export type FrontBack =
    | 'Front Side Line'
    | 'Front Hash (HS)'
    | 'Back Hash (HS)'
    | 'Back Side Line';

export type DotbookEntry = {
    movement: number;
    set: string;
    counts: number;
    side: number;
    sideToSide: {
        yardline: number;
        stepOffset: number;
        stepOffsetDirection: 'Inside' | 'Outside';
    };
    frontToBack: {
        line: FrontBack;
        stepOffset: number;
        stepOffsetDirection: 'In Front Of' | 'Behind';
    };
    note?: string;
};

export type DotData = {
    [key: string]: {
        performer: string;
        symbol: string;
        label: string;
        dots: DotbookEntry[];
    };
};

export type TempoData = {
    [movement: string]: {
        [set: string]: number;
    };
};