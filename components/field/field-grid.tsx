import {Line, Skia, Text, useTypeface, vec} from "@shopify/react-native-skia";
import {stepsToPixels, yardsToSteps} from "@/components/field/dimensions";
import {MD3Theme} from "react-native-paper";
import React from "react";
import {GridLineType, MeasureDirection, ShowData, Unit} from "@/lib/hooks/use-show-data";

export const FieldGrid = ({theme, showGrid, showData}: { theme: MD3Theme, showGrid: boolean; showData: ShowData }) => {
    const typeface = useTypeface(require('@/assets/fonts/cmunrm.ttf'));

    if (!typeface) {
        return null;
    }

    const fieldMetadata = showData.getFieldMetadata();
    // console.log('field metadata', fieldMetadata);
    const gridData = showData.getGridData();
    // console.log('gridData', gridData);

    // convert selected unit to steps
    const selectedUnitToSteps = (value: number) => {
        switch (fieldMetadata.units) {
            case Unit.Yards:
                return yardsToSteps(value);
            case Unit.Meters:
                return yardsToSteps(value * 1.09361);
            case Unit.Feet:
                return yardsToSteps(value / 3);
            default:
                return value;
        }
    }

    console.log('dimensions', fieldMetadata.dimensions);
    const gridUnitLines = [];
    /*GRID - every step at x and y*/
    /*start at (0,0) and go up and down until exceeds fieldMetadata.dimensions.top, and also bottom*/
    let step = 0;
    while (step <= selectedUnitToSteps(fieldMetadata.dimensions.right)) {
        gridUnitLines.push(
            <Line
                key={`grid-v-r-${step}`}
                p1={vec(stepsToPixels(step), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                p2={vec(stepsToPixels(step), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                color={theme.dark ? '#606062' : '#b9e9ea'}
                style="stroke"
                strokeWidth={1}
            />
        )
        step += 1;
    }
    step = 0;
    while (step >= selectedUnitToSteps(fieldMetadata.dimensions.left)) {
        gridUnitLines.push(
            <Line
                key={`grid-v-l-${step}`}
                p1={vec(stepsToPixels(step), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                p2={vec(stepsToPixels(step), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                color={theme.dark ? '#606062' : '#b9e9ea'}
                style="stroke"
                strokeWidth={1}
            />
        )
        step -= 1;
    }
    step = 0;
    while (step >= selectedUnitToSteps(fieldMetadata.dimensions.top)) {
        gridUnitLines.push(
            <Line
                key={`grid-h-t-${step}`}
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(step))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(step))}
                color={theme.dark ? '#606062' : '#b9e9ea'}
                style="stroke"
                strokeWidth={1}
            />
        )
        step -= 1;
    }
    step = 0;
    while (step <= selectedUnitToSteps(fieldMetadata.dimensions.bottom)) {
        gridUnitLines.push(
            <Line
                key={`grid-h-b-${step}`}
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(step))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(step))}
                color={theme.dark ? '#606062' : '#b9e9ea'}
                style="stroke"
                strokeWidth={1}
            />
        )
        step += 1;
    }

    // based on method_3191
    const getFont = () => {
        const fontSizeInSteps = selectedUnitToSteps(fieldMetadata.markers.front.size);
        // console.log('fnt size steps:',fontSizeInSteps);
        const baseFont = Skia.Font(typeface, 12);
        const metrics = baseFont.getMetrics();
        const baseHeight = metrics.descent - metrics.ascent;
        // console.log('base height:', baseHeight);

        // todo: lwk magic number i dont get it fix later
        const PIXELS_TO_POINTS = 1.88;
        // console.log(PIXELS_TO_POINTS);
        const targetPoints = stepsToPixels(fontSizeInSteps) * PIXELS_TO_POINTS;

        const size = baseFont.getSize() * targetPoints / baseHeight;
        // console.log('scaled font size:', size);
        return Skia.Font(typeface, size);
    }

    return (
        <>
            {showGrid && gridUnitLines}
            {/*GRID LINES*/}
            {gridData.lines.map(({direction, position, label, type, showMarker}, index) => {
                if (type === GridLineType.YardTick) return;
                const strokeWidth = {
                    [GridLineType.DivisionLine]: 4,
                    [GridLineType.SubDivisionLine]: 2,
                    [GridLineType.MajorHash]: 4,
                    [GridLineType.MinorHash]: 2,
                }[type] || 2;
                const markers = [];
                if (type === GridLineType.DivisionLine && direction === 'vertical' && showMarker) {
                    const text = label || (
                        fieldMetadata.measureDirection === MeasureDirection.Inward ?
                            (50 - Math.abs(position)).toString() :
                            position.toString()
                    );
                    if (text === '0') return;
                    const font = getFont();
                    // for the back number
                    const bottomX = stepsToPixels(selectedUnitToSteps(position)) - (font.measureText(text).width / 2);
                    const bottomY = stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)) - stepsToPixels(selectedUnitToSteps(fieldMetadata.markers.back.distance - fieldMetadata.markers.front.size / 2));
                    markers.push(
                        <Text
                            key={`grid-line-marker-back-${index}`}
                            transform={[{rotate: 0}]}
                            origin={vec(bottomX, bottomY)}
                            x={bottomX}
                            y={bottomY}
                            font={font}
                            color={theme.colors.onBackground}
                            text={text}
                        />
                    );
                    // for the front number
                    const topX = stepsToPixels(selectedUnitToSteps(position)) + (font.measureText(text).width / 2);
                    const topY = stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)) + stepsToPixels(selectedUnitToSteps(fieldMetadata.markers.front.distance - fieldMetadata.markers.front.size / 2));
                    markers.push(
                        <Text
                            key={`grid-line-marker-front-${index}`}
                            transform={[{rotate: Math.PI}]}
                            origin={vec(topX, topY)}
                            x={topX}
                            y={topY}
                            font={font}
                            color={theme.colors.onBackground}
                            text={text}
                        />
                    );
                }
                return (
                    direction === 'vertical' ? (
                        <React.Fragment key={`grid-line-${index}`}>
                            {markers}
                            <Line
                                p1={vec(stepsToPixels(selectedUnitToSteps(position)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                                p2={vec(stepsToPixels(selectedUnitToSteps(position)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                                color={theme.dark ? 'white' : 'black'}
                                style="stroke"
                                strokeWidth={strokeWidth}
                            />
                        </React.Fragment>
                    ) : (
                        <Line
                            key={`grid-line-${index}`}
                            p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(selectedUnitToSteps(position)))}
                            p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(selectedUnitToSteps(position)))}
                            color={theme.dark ? 'white' : 'black'}
                            style="stroke"
                            strokeWidth={strokeWidth}
                        />
                    )
                )
            })}
            {/*FRONT/BACK/LEFT/RIGHT SIDELINE*/}
            <Line
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.left)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.bottom)))}
                p2={vec(stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.right)), stepsToPixels(selectedUnitToSteps(fieldMetadata.dimensions.top)))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
        </>
    )
}