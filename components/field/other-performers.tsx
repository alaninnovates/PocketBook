import React from "react";
import {Circle, matchFont, Text, vec} from "@shopify/react-native-skia";
import {instrumentToColor} from "@/components/field/color";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {useTheme} from "react-native-paper";
import {Platform} from "react-native";
import {clampMax} from "@/lib/utils";
import {interpolatePosition} from "@/components/field/playback";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {ShowData} from "@/lib/hooks/use-show-data";
import {useShowContext} from "@/lib/hooks/use-show-context";

const fontFamily = Platform.select({ios: "Arial", default: "arial"});

export const OtherPerformers = ({showData, zoom, animationProgress}: {
    showData: ShowData;
    zoom: number;
    animationProgress: number;
}) => {
    const theme = useTheme();
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);
    const {currentCount} = useShowContext();
    const font = matchFont({
        fontFamily,
        fontSize: clampMax(6 * 6 / (zoom), 10),
    });

    return showData.getPerformerCoordsForCount(currentCount).map(({performer: {performer, label}, coord}, indx) => {
        // if (dots[currentIndex] == null) {
        //     console.log(
        //         `No dot for performer ${performer} ${label} at index ${currentIndex}`,
        //     );
        //     return null;
        // }

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

        const textX = stepsToPixels(coord.x) + (font.getTextWidth(performer) / 2) * multiplier;
        const textY = stepsToPixels(coord.y) + (-font.measureText(performer).height / 2 + 1.5) * multiplier;
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
            </React.Fragment>
        );
    })
};