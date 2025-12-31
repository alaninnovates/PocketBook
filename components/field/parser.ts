import {DotbookEntry} from "@/lib/types";
import {
    FIELD_BACK_HASH_STEPS,
    FIELD_FRONT_HASH_STEPS, FIELD_HEIGHT_STEPS,
    yardsToSteps
} from "@/components/field/dimensions";

export const dotToFieldCoordinateSteps = (
    dot: DotbookEntry,
): {
    x: number;
    y: number;
} => {
    let x;
    if (dot.side === 1) {
        // right side of field, inside = towards center(left)
        x = (yardsToSteps(50-dot.sideToSide.yardline) +
            (dot.sideToSide.stepOffsetDirection === 'Inside'
                ? -dot.sideToSide.stepOffset
                : dot.sideToSide.stepOffset));
    } else {
        // left side of field, inside = towards center(right)
        x = -(yardsToSteps(50-dot.sideToSide.yardline)) +
            (dot.sideToSide.stepOffsetDirection === 'Inside'
                ? dot.sideToSide.stepOffset
                : -dot.sideToSide.stepOffset);
    }

    let y;
    switch (dot.frontToBack.line) {
        case 'Front Hash (HS)':
            y =
                FIELD_FRONT_HASH_STEPS +
                (dot.frontToBack.stepOffsetDirection === 'In Front Of'
                    ? dot.frontToBack.stepOffset
                    : -dot.frontToBack.stepOffset);
            break;
        case 'Back Hash (HS)':
            y =
                FIELD_BACK_HASH_STEPS +
                (dot.frontToBack.stepOffsetDirection === 'In Front Of'
                    ? dot.frontToBack.stepOffset
                    : -dot.frontToBack.stepOffset);
            break;
        case 'Front Side Line':
            y =
                (dot.frontToBack.stepOffsetDirection === 'In Front Of'
                    ? dot.frontToBack.stepOffset
                    : -dot.frontToBack.stepOffset);
            break;
        case 'Back Side Line':
            y = FIELD_HEIGHT_STEPS +
                (dot.frontToBack.stepOffsetDirection === 'In Front Of'
                    ? dot.frontToBack.stepOffset
                    : -dot.frontToBack.stepOffset);
            break;
    }
    return {x, y};
};