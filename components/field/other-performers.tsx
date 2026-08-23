import React, {useEffect, useState} from "react";
import {Circle, Text, vec} from "@shopify/react-native-skia";
import {instrumentToColor} from "@/components/field/color";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {useTheme} from "react-native-paper";
import {clampMax} from "@/lib/utils";
import {interpolatePosition} from "@/components/field/playback";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {ShowData, useShowData} from "@/lib/hooks/use-show-data";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {measureTextHeight, useFieldFont} from "@/components/field/use-field-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {DrillView, makeDefaultSections} from "@/app/(modals)/shows/[id]/configure-view";

export const OtherPerformers = ({showData, zoom, animationProgress}: {
    showData: ShowData;
    zoom: number;
    animationProgress: number;
}) => {
    const theme = useTheme();
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);
    const {currentCount} = useShowContext();
    // null on web until the bundled font finishes loading
    const font = useFieldFont(clampMax(6 * 6 / (zoom), 10));


    const {selectedInstrument} = useShowContext();
    const [views, setViews] = useState<DrillView[] | null>(null);
    const [activeViewId, setActiveViewId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!showData || !selectedInstrument) return;
            const [storedViews, storedActiveView] = await Promise.all([
                AsyncStorage.getItem(`show_${showData.getId()}_views`),
                AsyncStorage.getItem(`show_${showData.getId()}_active_view`),
            ]);
            const parsedViews: DrillView[] = (storedViews ? JSON.parse(storedViews) : [
                {
                    id: 'default',
                    name: 'Default',
                    sections: makeDefaultSections(showData?.getPerformers() ?? []),
                    soloPerformerDot: false,
                }
            ]);
            setViews(parsedViews);
            setActiveViewId(storedActiveView ?? parsedViews[0]?.id ?? null);
        })();
    }, [showData, selectedInstrument]);

    const activeView = views?.find(view => view.id === activeViewId) ?? null;

    return showData.getPerformerCoordsForCount(currentCount).map(({performer: {performer, symbol, label}, coord}, indx) => {
        // if (dots[currentIndex] == null) {
        //     console.log(
        //         `No dot for performer ${performer} ${label} at index ${currentIndex}`,
        //     );
        //     return null;
        // }

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
                    r={clampMax(4 * 6 / (zoom), 6)}
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