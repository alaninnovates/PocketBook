import {DotData} from "@/lib/types";
import React from "react";
import {Circle, matchFont, Text, vec} from "@shopify/react-native-skia";
import {instrumentToColor} from "@/components/field/color";
import {dotToFieldCoordinateSteps} from "@/components/field/parser";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {useTheme} from "react-native-paper";
import {Platform} from "react-native";
import {clampMax} from "@/lib/utils";

const fontFamily = Platform.select({ ios: "Arial", default: "arial" });

export const OtherPerformers = ({dotData, currentIndex, zoom}: {
    dotData: DotData;
    currentIndex: number;
    zoom: number;
}) => {
    const theme = useTheme();
    const font = matchFont({
        fontFamily,
        fontSize: clampMax(6 * 6/(zoom), 10),
    });

    return Object.values(dotData).map(({performer, label, dots}) => {
        if (dots[currentIndex] == null) {
            console.log(
                `No dot for performer ${performer} ${label} at index ${currentIndex}`,
            );
            return null;
        }

        let coord = dotToFieldCoordinateSteps(dots[currentIndex]);
        // console.log('performer coord:', performer, label, coord);
        // if (animationProgress > 0 && dots[currentIndex + 1] != null) {
        //     const nextCoord = dotToFieldCoordinate(
        //         dots[currentIndex + 1],
        //     );
        //     coord = interpolatePosition(
        //         coord,
        //         nextCoord,
        //         animationProgress,
        //     );
        // }

        const textX = stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x) + font.getTextWidth(label) / 2;
        const textY  = stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y) - font.measureText(label).height / 2 + 1.5;

        return (
            <React.Fragment key={label}>
                <Circle
                    key={label}
                    cx={stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x)}
                    cy={stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y)}
                    r={clampMax(4 * 6/(zoom), 6)}
                    color={instrumentToColor(performer)}
                    opacity={1}
                />
                <Text
                    key={`text-${label}`}
                    x={textX}
                    y={textY}
                    transform={[{rotate: Math.PI}]}
                    origin={vec(textX, textY)}
                    color={theme.colors.background}
                    font={font}
                    text={label}
                />
            </React.Fragment>
        );
    })
};