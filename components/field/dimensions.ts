/*
center (0,0) at 50 yd ln, back side line, up is positive, right is positive
high school football field

1 step = 22.5 in
field w = 300ft (100yd) = 160 steps
field h = 160 ft (53 1/3 yd) = 85 1/3 steps

fsl = 0 steps
front hash = -28 steps
back hash = -56 steps
bsl = -85 1/3 steps

front to home label bottom = -11.2 steps
front to home label top = -14.4 steps
front to away label bottom = bsl + 11.2 = -74.1333 steps
front to away label top = bsl + 14.4 = -70.9333 steps

height of yard numbers = 6 ft = 72 in = 3.2 steps
width of yard numbers = 4 ft = 48in = 2.1333 steps

pixels per inch = 0.5
 */

export const PIXELS_PER_INCH = 0.5;
export const INCHES_PER_STEP = 22.5;
export const feetToSteps = (feet: number) => (feet * 12) / INCHES_PER_STEP;
export const yardsToSteps = (yards: number) => feetToSteps(yards * 3);
export const stepsToPixels = (steps: number) => steps * INCHES_PER_STEP * PIXELS_PER_INCH;

export const FIELD_WIDTH_STEPS = yardsToSteps(100);
export const FIELD_HEIGHT_STEPS = yardsToSteps(53 + 1 / 3);

export const FIELD_FRONT_SIDE_LINE_STEPS = 0;
export const FIELD_FRONT_HASH_STEPS = -28;
export const FIELD_BACK_HASH_STEPS = -56;
export const FIELD_BACK_SIDE_LINE_STEPS = -FIELD_HEIGHT_STEPS;

export const HOME_LABEL_BOTTOM_STEPS = -feetToSteps(11.2);
export const HOME_LABEL_TOP_STEPS = -feetToSteps(14.4);
export const AWAY_LABEL_BOTTOM_STEPS = FIELD_BACK_SIDE_LINE_STEPS + feetToSteps(11.2);
export const AWAY_LABEL_TOP_STEPS = FIELD_BACK_SIDE_LINE_STEPS + feetToSteps(14.4);

export const YARD_NUMBER_HEIGHT_STEPS = feetToSteps(6);
export const YARD_NUMBER_WIDTH_STEPS = feetToSteps(4);

export const CENTER_FRONT_POINT_STEPS = {
    x: FIELD_WIDTH_STEPS / 2,
    y: FIELD_HEIGHT_STEPS,
}
