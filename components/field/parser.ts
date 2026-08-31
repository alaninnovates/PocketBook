import {DotbookEntry} from "@/lib/types";
import {stepsToYards, yardsToSteps} from "@/components/field/dimensions";
import {Coordinate} from "@/lib/hooks/use-show-data";

const roundToDecimal = (num: number, decimalPlaces: number): number => {
    // round to nearest 1/2^decimalPlaces
    const factor = Math.pow(2, decimalPlaces);
    return Math.round(num * factor) / factor;
}

export const calculateMidset = (
    coord1: { x: number; y: number },
    coord2: { x: number; y: number },
): Coordinate => {
    return {
        x: (coord1.x + coord2.x) / 2,
        y: (coord1.y + coord2.y) / 2
    };
};

export const fieldCoordinateToDot = (
    coord: Coordinate
): DotbookEntry => {
    const {x, y} = coord;

    let side: 1 | 2;
    let sideToSideYardline: number;
    let sideToSideStepOffset: number;
    let sideToSideStepOffsetDirection: 'Inside' | 'Outside';

    if (x >= 0) {
        // right side
        side = 2;
        sideToSideYardline = Math.round((50 - stepsToYards(x)) / 5) * 5;
        const offset = (x - (yardsToSteps(50 - sideToSideYardline)));
        if (offset >= 0) {
            sideToSideStepOffset = roundToDecimal(offset, 2);
            sideToSideStepOffsetDirection = 'Outside';
        } else {
            sideToSideStepOffset = roundToDecimal(-offset, 2);
            sideToSideStepOffsetDirection = 'Inside';
        }
    } else {
        // left side
        side = 1;
        sideToSideYardline = Math.round((50 - stepsToYards(-x)) / 5) * 5;
        const offset = (-x - (yardsToSteps(50 - sideToSideYardline)));
        if (offset >= 0) {
            sideToSideStepOffset = roundToDecimal(offset, 2);
            sideToSideStepOffsetDirection = 'Outside';
        } else {
            sideToSideStepOffset = roundToDecimal(-offset, 2);
            sideToSideStepOffsetDirection = 'Inside';
        }
    }

    let frontToBackLine: DotbookEntry['frontToBack']['line'];
    let frontToBackStepOffset: number;
    let frontToBackStepOffsetDirection: 'In Front Of' | 'Behind';

    const distanceFromFrontHash = 14 - y;
    const distanceFromBackHash = y + 14;
    const distanceFromFrontSideline = 42 - y;
    const distanceFromBackSideline = y + 42;
    // console.log('coord:', coord, 'x:', x, 'y:', y);
    // console.log('distanceFromFrontHash:', distanceFromFrontHash, 'distanceFromBackHash:', distanceFromBackHash, 'distanceFromFrontSideline:', distanceFromFrontSideline, 'distanceFromBackSideline:', distanceFromBackSideline);

    if (
        Math.abs(distanceFromFrontSideline) <=
        Math.abs(distanceFromFrontHash) &&
        Math.abs(distanceFromFrontSideline) <= Math.abs(distanceFromBackHash)
    ) {
        frontToBackLine = 'Front Side Line';
        const offset = distanceFromFrontSideline;
        if (offset <= 0) {
            frontToBackStepOffset = roundToDecimal(-offset, 2);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = roundToDecimal(offset, 2);
            frontToBackStepOffsetDirection = 'Behind';
        }
    } else if (
        Math.abs(distanceFromFrontHash) <= Math.abs(distanceFromBackHash)
    ) {
        frontToBackLine = 'Front Hash (HS)';
        const offset = distanceFromFrontHash;
        if (offset <= 0) {
            frontToBackStepOffset = roundToDecimal(-offset, 2);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = roundToDecimal(offset, 2);
            frontToBackStepOffsetDirection = 'Behind';
        }
    } else if (
        Math.abs(distanceFromBackHash) <= Math.abs(distanceFromBackSideline)
    ) {
        frontToBackLine = 'Back Hash (HS)';
        const offset = distanceFromBackHash;
        if (offset >= 0) {
            frontToBackStepOffset = roundToDecimal(offset, 2);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = roundToDecimal(-offset, 2);
            frontToBackStepOffsetDirection = 'Behind';
        }
    } else {
        frontToBackLine = 'Back Side Line';
        const offset = distanceFromBackSideline;
        if (offset >= 0) {
            frontToBackStepOffset = roundToDecimal(offset, 2);
            frontToBackStepOffsetDirection = 'In Front Of';
        } else {
            frontToBackStepOffset = roundToDecimal(-offset, 2);
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

export const dotCoordinatesEqual = (dot1: Coordinate, dot2: Coordinate) => {
    return dot1.x === dot2.x && dot1.y === dot2.y
};

export const calculateStepSize = (
    coord1: Coordinate,
    coord2: Coordinate,
    counts: number,
): number => {
    // console.log('coord1:', coord1, 'coord2:', coord2);
    const stepsDelta = Math.sqrt(
        Math.pow(coord2.x - coord1.x, 2) +
        Math.pow(coord2.y - coord1.y, 2),
    );
    const yards = stepsToYards(stepsDelta);
    // console.log('yards between dots:', yards);
    return Math.round((8 * yards / counts) * 100) / 100;
};
