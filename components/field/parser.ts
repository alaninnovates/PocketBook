import {DotbookEntry} from "@/lib/types";
import {
    FIELD_BACK_HASH_STEPS,
    FIELD_FRONT_HASH_STEPS, FIELD_HEIGHT_STEPS, stepsToYards,
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
        x = (yardsToSteps(50 - dot.sideToSide.yardline) +
            (dot.sideToSide.stepOffsetDirection === 'Inside'
                ? -dot.sideToSide.stepOffset
                : dot.sideToSide.stepOffset));
    } else {
        // left side of field, inside = towards center(right)
        x = -(yardsToSteps(50 - dot.sideToSide.yardline)) +
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

export const calculateMidset = (
    coord1: { x: number; y: number },
    coord2: { x: number; y: number },
): [number, number] => {
    return [(coord1.x + coord2.x) / 2, (coord1.y + coord2.y) / 2];
};

export const fieldCoordinateToDot = (
    coord: [number, number],
): Omit<DotbookEntry, 'set' | 'counts' | 'movement'> => {
    const [x, y] = coord;

    let side: 1 | 2;
    let sideToSideYardline: number;
    let sideToSideStepOffset: number;
    let sideToSideStepOffsetDirection: 'Inside' | 'Outside';

    if (x >= 0) {
        // right side
        side = 1;
        sideToSideYardline = Math.round((50 - stepsToYards(x)) / 5) * 5;
        const offset = (x - (yardsToSteps(50 - sideToSideYardline)));
        if (offset >= 0) {
            sideToSideStepOffset = Math.round(offset);
            sideToSideStepOffsetDirection = 'Outside';
        } else {
            sideToSideStepOffset = Math.round(-offset);
            sideToSideStepOffsetDirection = 'Inside';
        }
    } else {
        // left side
        side = 2;
        sideToSideYardline = Math.round((50 - stepsToYards(-x)) / 5) * 5;
        const offset = (-x - (yardsToSteps(50 - sideToSideYardline)));
        if (offset >= 0) {
            sideToSideStepOffset = Math.round(offset);
            sideToSideStepOffsetDirection = 'Outside';
        } else {
            sideToSideStepOffset = Math.round(-offset);
            sideToSideStepOffsetDirection = 'Inside';
        }
    }

    let frontToBackLine: DotbookEntry['frontToBack']['line'];
    let frontToBackStepOffset: number;
    let frontToBackStepOffsetDirection: 'In Front Of' | 'Behind';

    const distanceFromFrontHash = y - FIELD_FRONT_HASH_STEPS;
    const distanceFromBackHash = y - FIELD_BACK_HASH_STEPS;
    const distanceFromFrontSideline = y - FIELD_HEIGHT_STEPS;

    if (
        Math.abs(distanceFromFrontSideline) <=
        Math.abs(distanceFromFrontHash) &&
        Math.abs(distanceFromFrontSideline) <= Math.abs(distanceFromBackHash)
    ) {
        frontToBackLine = 'Front Side Line';
        const offset = distanceFromFrontSideline;
        if (offset >= 0) {
            frontToBackStepOffset = Math.round(offset);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = Math.round(-offset);
            frontToBackStepOffsetDirection = 'Behind';
        }
    } else if (
        Math.abs(distanceFromFrontHash) <= Math.abs(distanceFromBackHash)
    ) {
        frontToBackLine = 'Front Hash (HS)';
        const offset = distanceFromFrontHash;
        if (offset >= 0) {
            frontToBackStepOffset = Math.round(offset);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = Math.round(-offset);
            frontToBackStepOffsetDirection = 'Behind';
        }
    } else {
        frontToBackLine = 'Back Hash (HS)';
        const offset = distanceFromBackHash;
        if (offset >= 0) {
            frontToBackStepOffset = Math.round(offset);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = Math.round(-offset);
            frontToBackStepOffsetDirection = 'Behind';
        }
    }

    return {
        side,
        sideToSide: {
            yardline: sideToSideYardline,
            stepOffset: sideToSideStepOffset,
            stepOffsetDirection: sideToSideStepOffsetDirection,
        },
        frontToBack: {
            line: frontToBackLine,
            stepOffset: frontToBackStepOffset,
            stepOffsetDirection: frontToBackStepOffsetDirection,
        },
    };
};

export const dotCoordinatesEqual = (dot1: DotbookEntry, dot2: DotbookEntry) => {
    return (
        dot1.side === dot2.side &&
        dot1.sideToSide.yardline === dot2.sideToSide.yardline &&
        dot1.sideToSide.stepOffset === dot2.sideToSide.stepOffset &&
        dot1.sideToSide.stepOffsetDirection ===
        dot2.sideToSide.stepOffsetDirection &&
        dot1.frontToBack.line === dot2.frontToBack.line &&
        dot1.frontToBack.stepOffset === dot2.frontToBack.stepOffset &&
        dot1.frontToBack.stepOffsetDirection ===
        dot2.frontToBack.stepOffsetDirection
    );
};

export const calculateStepSize = (
    dot1: DotbookEntry,
    dot2: DotbookEntry,
    counts: number,
): number => {
    const coord1 = dotToFieldCoordinateSteps(dot1);
    const coord2 = dotToFieldCoordinateSteps(dot2);
    // console.log('coord1:', coord1, 'coord2:', coord2);
    const yards = stepsToYards(Math.sqrt(
        Math.pow(coord2.x - coord1.x, 2) +
        Math.pow(coord2.y - coord1.y, 2),
    ));
    // console.log('yards between dots:', yards);
    return Math.round((8 * yards / counts) * 100) / 100;
};
