import React from "react";
import {Circle, matchFont, Text, vec} from "@shopify/react-native-skia";
import {instrumentToColor} from "@/components/field/color";
import {dotToFieldCoordinateSteps} from "@/components/field/parser";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {useTheme} from "react-native-paper";
import {Platform} from "react-native";
import {clampMax} from "@/lib/utils";
import {interpolatePosition} from "@/components/field/playback";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {ShowData} from "@/lib/hooks/use-show-data";

const fontFamily = Platform.select({ios: "Arial", default: "arial"});

export const OtherPerformers = ({showData, setName, zoom, animationProgress}: {
    showData: ShowData;
    setName: string;
    zoom: number;
    animationProgress: number;
}) => {
    const theme = useTheme();
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);
    const font = matchFont({
        fontFamily,
        fontSize: clampMax(6 * 6 / (zoom), 10),
    });

    return showData.getPerformerCoordsForSet(setName).map(({performer: {performer, label}, coord}) => {
        // if (dots[currentIndex] == null) {
        //     console.log(
        //         `No dot for performer ${performer} ${label} at index ${currentIndex}`,
        //     );
        //     return null;
        // }

        if (animationProgress > 0 && dots[currentIndex + 1] != null) {
            const nextCoord = dotToFieldCoordinateSteps(
                dots[currentIndex + 1],
            );
            coord = interpolatePosition(
                coord,
                nextCoord,
                animationProgress,
            );
        }

        const multiplier = fieldView === FieldView.Performer ? 1 : -1;

        const textX = stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x) + (font.getTextWidth(label) / 2) * multiplier;
        const textY = stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y) + (-font.measureText(label).height / 2 + 1.5) * multiplier;

        return (
            <React.Fragment key={label}>
                <Circle
                    key={label}
                    cx={stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x)}
                    cy={stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y)}
                    r={clampMax(4 * 6 / (zoom), 6)}
                    color={instrumentToColor(performer, theme.dark)}
                    opacity={1}
                />
                <Text
                    key={`text-${label}`}
                    x={textX}
                    y={textY}
                    transform={[{rotate: fieldView === FieldView.Performer ? Math.PI : 0}]}
                    origin={vec(textX, textY)}
                    color={theme.colors.background}
                    font={font}
                    text={label}
                />
            </React.Fragment>
        );
    })
};