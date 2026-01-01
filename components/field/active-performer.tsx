import {Circle, matchFont, Rect, Text, vec} from "@shopify/react-native-skia";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {instrumentToColor} from "@/components/field/color";
import React from "react";
import {useTheme} from "react-native-paper";
import {clampMax} from "@/lib/utils";
import {DotData} from "@/lib/types";
import {dotToFieldCoordinateSteps} from "@/components/field/parser";
import {Platform} from "react-native";

const fontFamily = Platform.select({ios: "Arial", default: "arial"});

const CurrentPageDisplay = ({
                                coord,
                                zoom,
                                performer,
                            }: {
    coord: { x: number; y: number };
    zoom: number;
    performer: string;
}) => {
    const font = matchFont({
        fontFamily,
        fontSize: clampMax(6 * 6 / (zoom), 10),
    });
    const theme = useTheme();

    const cx = stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x);
    const cy = stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y);
    const r = clampMax(4 * 6 / (zoom), 6);

    const textX = stepsToPixels(CENTER_FRONT_POINT_STEPS.x - coord.x) + font.getTextWidth(performer) / 2;
    const textY = stepsToPixels(CENTER_FRONT_POINT_STEPS.y + coord.y) - font.measureText(performer).height / 2 + 1.5;
    return (
        <>
            <Circle
                key={performer}
                cx={cx}
                cy={cy}
                r={r}
                color={instrumentToColor(performer)}
                opacity={1}
            />
            <Rect
                width={r * 2 + 2}
                height={r * 2 + 2}
                x={cx - r - 1}
                y={cy - r - 1}
                color={"red"}
                style={"stroke"}
                strokeWidth={2}
            />
            <Text
                key={`text-${performer}`}
                x={textX}
                y={textY}
                transform={[{rotate: Math.PI}]}
                origin={vec(textX, textY)}
                color={theme.colors.background}
                font={font}
                text={performer}
            />
        </>
    );
};

export const ActivePerformer = ({dotData, currentIndex, zoom, performer}: {
    dotData: DotData;
    currentIndex: number;
    zoom: number;
    performer: string;
}) => {
    const dots = dotData[performer].dots;
    return (
        <>
            <CurrentPageDisplay
                coord={dotToFieldCoordinateSteps(dots[currentIndex])}
                zoom={zoom}
                performer={performer}
            />
        </>
    )
}