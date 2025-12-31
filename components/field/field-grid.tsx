import {Line, vec} from "@shopify/react-native-skia";
import {
    FIELD_HEIGHT_STEPS, FIELD_WIDTH_STEPS, FIELD_FRONT_HASH_STEPS, FIELD_BACK_HASH_STEPS, stepsToPixels,
    CENTER_FRONT_POINT_STEPS
} from "@/components/field/dimensions";
import {MD3Theme} from "react-native-paper";

export const FieldGrid = ({theme, showGrid}: { theme: MD3Theme, showGrid: boolean }) => {
    return (
        <>
            {showGrid && (
                <>
                    {/*GRID - every step at x and y*/}
                    {Array.from({length: FIELD_HEIGHT_STEPS + 1}).map((_, index) => {
                        return (
                            <Line
                                key={`grid-h-${index}`}
                                p1={vec(0, stepsToPixels(FIELD_HEIGHT_STEPS - index))}
                                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(FIELD_HEIGHT_STEPS - index))}
                                color={theme.colors.onBackground}
                                style="stroke"
                                strokeWidth={1}
                            />
                        )
                    })}
                    {Array.from({length: FIELD_WIDTH_STEPS + 1}).map((_, index) => {
                        return (
                            <Line
                                key={`grid-v-${index}`}
                                p1={vec(stepsToPixels(index), 0)}
                                p2={vec(stepsToPixels(index), stepsToPixels(FIELD_HEIGHT_STEPS))}
                                color={theme.colors.onBackground}
                                style="stroke"
                                strokeWidth={1}
                            />
                        )
                    })}
                </>
            )}
            {/*HALF-LINES - every 4 steps at x and y*/}
            {Array.from({length: FIELD_HEIGHT_STEPS / 4 + 1}).map((_, index) => {
                const stepPosition = 4 * index;
                return (
                    <Line
                        key={`halfline-h-${index}`}
                        p1={vec(0, stepsToPixels(FIELD_HEIGHT_STEPS - stepPosition))}
                        p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(FIELD_HEIGHT_STEPS - stepPosition))}
                        color={theme.colors.onBackground}
                        style="stroke"
                        strokeWidth={2}
                    />
                )
            })}
            {Array.from({length: FIELD_WIDTH_STEPS / 4 + 1}).map((_, index) => {
                const stepPosition = 4 * index;
                return (
                    <Line
                        key={`halfline-v-${index}`}
                        p1={vec(stepsToPixels(stepPosition), 0)}
                        p2={vec(stepsToPixels(stepPosition), stepsToPixels(FIELD_HEIGHT_STEPS))}
                        color={theme.colors.onBackground}
                        style="stroke"
                        strokeWidth={2}
                    />
                )
            })}
            {/*HORIZONTAL YARDLINES*/}
            {Array.from({length: 20}).map((_, index) => {
                const stepPosition = (FIELD_WIDTH_STEPS / 20) * index;
                return (
                    <Line
                        key={`yardline-${index}`}
                        p1={vec(stepsToPixels(stepPosition), 0)}
                        p2={vec(stepsToPixels(stepPosition), stepsToPixels(FIELD_HEIGHT_STEPS))}
                        color={theme.colors.onBackground}
                        style="stroke"
                        strokeWidth={2}
                    />
                )
            })}
            {/*FRONT/BACK HASH*/}
            <Line
                p1={vec(0, stepsToPixels(CENTER_FRONT_POINT_STEPS.y + FIELD_FRONT_HASH_STEPS))}
                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(CENTER_FRONT_POINT_STEPS.y + FIELD_FRONT_HASH_STEPS))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(0, stepsToPixels(CENTER_FRONT_POINT_STEPS.y + FIELD_BACK_HASH_STEPS))}
                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(CENTER_FRONT_POINT_STEPS.y + FIELD_BACK_HASH_STEPS))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            {/*FRONT/BACK/LEFT/RIGHT SIDELINE*/}
            <Line
                p1={vec(0, 0)}
                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), 0)}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(0, stepsToPixels(FIELD_HEIGHT_STEPS))}
                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(FIELD_HEIGHT_STEPS))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(0, 0)}
                p2={vec(0, stepsToPixels(FIELD_HEIGHT_STEPS))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
            <Line
                p1={vec(stepsToPixels(FIELD_WIDTH_STEPS), 0)}
                p2={vec(stepsToPixels(FIELD_WIDTH_STEPS), stepsToPixels(FIELD_HEIGHT_STEPS))}
                color={theme.colors.onBackground}
                style="stroke"
                strokeWidth={4}
            />
        </>
    )
}