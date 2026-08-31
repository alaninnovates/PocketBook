import React from "react";
import {Circle, Text, vec} from "@shopify/react-native-skia";
import {instrumentToColor} from "@/components/field/color";
import {stepsToPixels} from "@/components/field/dimensions";
import {useTheme} from "react-native-paper";
import {clampMax} from "@/lib/utils";
import {interpolatePosition} from "@/components/field/playback";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {ShowData} from "@/lib/hooks/use-show-data";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {measureTextHeight, useFieldFont} from "@/components/field/use-field-font";
import {useShowViews} from "@/lib/hooks/use-show-views";

export const OtherPerformers = ({showData, zoom, animationProgress}: {
    showData: ShowData;
    zoom: number;
    animationProgress: number;
}) => {
    const [dotScale] = useProperty<number>(SettingsProperty.DotScale, 1);
    // console.log('RE-RENDERING OTHER PERF')
    const theme = useTheme();
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);
    const {currentCount} = useShowContext();
    // null on web until the bundled font finishes loading
    const font = useFieldFont(clampMax(6 * 6 / (zoom), 10));

    const {views, activeViewId} = useShowViews(showData.getId(), showData);
    const activeView = views?.find(view => view.id === activeViewId) ?? null;
    // console.log(activeView?.sections)

    if (activeView?.soloPerformerDot) {
        return null;
    }

    return showData.getPerformerCoordsForCount(currentCount).map(({performer: {performer, symbol, label}, coord}, indx) => {
        if (activeView && !activeView.sections.find(section => section.name === symbol)?.visible) {
            return null;
        }

        if (animationProgress > 0 && currentCount <= showData.getTotalCounts()) {
            const nextCoord = showData.getCoordAtCount(currentCount + 1, performer);
            coord = interpolatePosition(
                coord,
                nextCoord,
                animationProgress,
            );
        }

        const multiplier = fieldView === FieldView.Performer ? 1 : -1;
        // console.log("performer:",performer, "label:", label)

        const textX = font ? stepsToPixels(coord.x) + (font.getTextWidth(performer) / 2) * multiplier : 0;
        const textY = font ? stepsToPixels(coord.y) + (-measureTextHeight(font, performer) / 2 + 1.5) * multiplier : 0;
        // console.log(coord.x, coord.y);

        return (
            <React.Fragment key={indx}>
                <Circle
                    key={performer}
                    cx={stepsToPixels(coord.x)}
                    cy={stepsToPixels(coord.y)}
                    r={clampMax(4 * 6 / (zoom), 6) * dotScale}
                    color={instrumentToColor(performer, theme.dark)}
                    opacity={1}
                />
                {font && (
                    <Text
                        key={`text-${performer}`}
                        x={textX}
                        y={textY}
                        transform={[{rotate: fieldView === FieldView.Performer ? Math.PI : 0}]}
                        origin={vec(textX, textY)}
                        color={theme.colors.background}
                        font={font}
                        text={performer}
                    />
                )}
            </React.Fragment>
        );
    })
};