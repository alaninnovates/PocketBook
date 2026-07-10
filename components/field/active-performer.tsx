import {Circle, Line, matchFont, Rect, Text, vec} from "@shopify/react-native-skia";
import {CENTER_FRONT_POINT_STEPS, stepsToPixels} from "@/components/field/dimensions";
import React from "react";
import {useTheme} from "react-native-paper";
import {clampMax} from "@/lib/utils";
import {calculateMidset, dotToFieldCoordinateSteps} from "@/components/field/parser";
import {Platform} from "react-native";
import {interpolatePosition} from "@/components/field/playback";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {Coordinate, ShowData} from "@/lib/hooks/use-show-data";
import {useShowContext} from "@/lib/hooks/use-show-context";

const fontFamily = Platform.select({ios: "Arial", default: "arial"});

const CurrentPageDisplay = ({
                                coord,
                                zoom,
                                performer,
                            }: {
    coord: Coordinate;
    zoom: number;
    performer: string;
}) => {
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);
    const font = matchFont({
        fontFamily,
        fontSize: clampMax(6 * 6 / (zoom), 10),
    });
    const theme = useTheme();

    const cx = stepsToPixels(coord.x);
    const cy = stepsToPixels(coord.y);
    const r = clampMax(4 * 6 / (zoom), 6);

    const multiplier = fieldView === FieldView.Performer ? 1 : -1;
    const textX = stepsToPixels(coord.x) + (font.getTextWidth(performer) / 2) * multiplier;
    const textY = stepsToPixels(coord.y) + (-font.measureText(performer).height / 2 + 1.5) * multiplier;
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
                transform={[{rotate: fieldView === FieldView.Performer ? Math.PI : 0}]}
                origin={vec(textX, textY)}
                color={theme.colors.background}
                font={font}
                text={performer}
            />
        </>
    );
};

const AdditionalPagesDisplay = ({
                                    coords,
                                    currentIndex,
                                    additionalDots,
                                    direction,
                                }: {
    coords: Coordinate[];
    currentIndex: number;
    additionalDots: Coordinate[];
    direction: number;
}) => {
    const [dotScale] = useProperty<number>(SettingsProperty.DotScale, 1);
    return (
        <>
            {additionalDots.map((currentCoord, index) => {
                const nextCoord = additionalDots[index + 1] || coords[currentIndex];
                const midCoord = calculateMidset(currentCoord, nextCoord);

                return (
                    <React.Fragment key={index}>
                        <Circle
                            cx={stepsToPixels(currentCoord.x)}
                            cy={stepsToPixels(currentCoord.y)}
                            r={4 * dotScale}
                            color="red"
                        />
                        <Line
                            p1={vec(stepsToPixels(currentCoord.x), stepsToPixels(currentCoord.y))}
                            p2={vec(stepsToPixels(nextCoord.x), stepsToPixels(nextCoord.y))}
                            color={direction === -1 ? 'blue' : 'green'}
                            strokeWidth={2 * dotScale}
                        />
                        {(currentCoord.x !== nextCoord.x ||
                            currentCoord.y !== nextCoord.y) && (
                            <Circle
                                cx={stepsToPixels(midCoord.x)}
                                cy={stepsToPixels(midCoord.y)}
                                r={2 * dotScale}
                                color={direction === -1 ? 'blue' : 'green'}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

export const ActivePerformer = ({showData, zoom, animationProgress}: {
    showData: ShowData;
    zoom: number;
    animationProgress: number;
}) => {
    const {currentCount, selectedInstrument} = useShowContext();
    if (!selectedInstrument) {
        return null;
    }
    let minusQuantity = 1, plusQuantity = 1;
    const coords = showData.getCoordsForPerformer(selectedInstrument).map(c => c.coord);
    const currentIndex = showData.getSetIndexAtCount(currentCount)!;
    const minusCoords = minusQuantity
        ? coords.slice(
            Math.max(0, currentIndex - minusQuantity),
            currentIndex,
        )
        : [];
    const plusCoords = plusQuantity
        ? coords.slice(
            currentIndex + 1,
            Math.min(
                coords.length,
                currentIndex + 1 + plusQuantity,
            ),
        )
        : [];
    return (
        <>
            <AdditionalPagesDisplay
                coords={coords}
                currentIndex={currentIndex}
                additionalDots={minusCoords}
                direction={-1}
            />
            <AdditionalPagesDisplay
                coords={coords}
                currentIndex={currentIndex}
                additionalDots={plusCoords}
                direction={1}
            />
            <CurrentPageDisplay
                coord={coords[currentIndex + 1] && animationProgress > 0
                    ? interpolatePosition(
                        showData.getCoordAtCount(currentCount, selectedInstrument),
                        showData.getCoordAtCount(currentCount+1, selectedInstrument),
                        animationProgress,
                    )
                    : showData.getCoordAtCount(currentCount, selectedInstrument)
                }
                zoom={zoom}
                performer={selectedInstrument}
            />
        </>
    )
}