import {Circle, Line, matchFont, Rect, Text, vec} from "@shopify/react-native-skia";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import {instrumentToColor} from "@/components/field/color";
import React from "react";
import {useTheme} from "react-native-paper";
import {clampMax} from "@/lib/utils";
import {DotbookEntry, DotData} from "@/lib/types";
import {calculateMidset, dotToFieldCoordinateSteps} from "@/components/field/parser";
import {Platform} from "react-native";
import {interpolatePosition} from "@/components/field/playback";

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
                color="red"
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

const AdditionalPagesDisplay = ({
                                    pages,
                                    currentIndex,
                                    additionalDots,
                                    direction,
                                }: {
    pages: DotbookEntry[];
    currentIndex: number;
    additionalDots: DotbookEntry[];
    direction: number;
}) => {
    return (
        <>
            {additionalDots.map((dot, index) => {
                const currentCoord = dotToFieldCoordinateSteps(dot);
                const nextCoord = dotToFieldCoordinateSteps(
                    additionalDots[index + 1] || pages[currentIndex],
                );
                const midCoord = calculateMidset(currentCoord, nextCoord);

                return (
                    <React.Fragment key={index}>
                        <Circle
                            cx={stepsToPixels(CENTER_FRONT_POINT_STEPS.x - currentCoord.x)}
                            cy={stepsToPixels(CENTER_FRONT_POINT_STEPS.y + currentCoord.y)}
                            r={4}
                            color="red"
                        />
                        <Line
                            p1={vec(stepsToPixels(CENTER_FRONT_POINT_STEPS.x - currentCoord.x), stepsToPixels(CENTER_FRONT_POINT_STEPS.y + currentCoord.y))}
                            p2={vec(stepsToPixels(CENTER_FRONT_POINT_STEPS.x - nextCoord.x), stepsToPixels(CENTER_FRONT_POINT_STEPS.y + nextCoord.y))}
                            color={direction === -1 ? 'blue' : 'green'}
                            strokeWidth={2}
                        />
                        {(currentCoord.x !== nextCoord.x ||
                            currentCoord.y !== nextCoord.y) && (
                            <Circle
                                cx={stepsToPixels(CENTER_FRONT_POINT_STEPS.x - midCoord[0])}
                                cy={stepsToPixels(CENTER_FRONT_POINT_STEPS.y + midCoord[1])}
                                r={2}
                                color={direction === -1 ? 'blue' : 'green'}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

export const ActivePerformer = ({dotData, currentIndex, zoom, performer, animationProgress}: {
    dotData: DotData;
    currentIndex: number;
    zoom: number;
    performer: string;
    animationProgress: number;
}) => {
    let minusQuantity = 1, plusQuantity = 1;
    const dots = dotData[performer].dots;
    const minusDots = minusQuantity
        ? dots.slice(
            Math.max(0, currentIndex - minusQuantity),
            currentIndex,
        )
        : [];
    const plusDots = plusQuantity
        ? dots.slice(
            currentIndex + 1,
            Math.min(
                dots.length,
                currentIndex + 1 + plusQuantity,
            ),
        )
        : [];
    return (
        <>
            <AdditionalPagesDisplay
                pages={dots}
                currentIndex={currentIndex}
                additionalDots={minusDots}
                direction={-1}
            />
            <AdditionalPagesDisplay
                pages={dots}
                currentIndex={currentIndex}
                additionalDots={plusDots}
                direction={1}
            />
            <CurrentPageDisplay
                coord={dots[currentIndex + 1] && animationProgress > 0
                    ? interpolatePosition(
                        dotToFieldCoordinateSteps(dots[currentIndex]),
                        dotToFieldCoordinateSteps(dots[currentIndex + 1]),
                        animationProgress,
                    )
                    : dotToFieldCoordinateSteps(dots[currentIndex])}
                zoom={zoom}
                performer={performer}
            />
        </>
    )
}