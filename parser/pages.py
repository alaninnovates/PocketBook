from utils import bc, find_index_of

"""
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
"""

un_to_step = 625

def sets_to_coordinates(instruments, sets):
    dot_data = {}
    for set in sets:
        print(set)
    return dot_data

def counts_to_sets(pages, sets):
    # print(sets, len(pages))
    # total_counts = sum([s['counts'] for s in sets.values()])
    # print("total_counts:", total_counts)
    return pages

def parse_pages(data, instruments, sets):
    """

    :param data:
    :param instruments:
    :param sets:
    :return:
    """
    # print("last_instrument_index:", last_instrument_index)
    start_read = find_index_of(data, 'PAGE', return_end=True)
    start_read += bc(9)
    counts = {}
    """ ex data after start_read
blue = performer index
cyan = case 00 00 -> side 2; case FF FF -> side 1
green = SIGNED INTEGER - units off from the 50.
yellow = either 00 or FF, and it seems when it is FF the marcher is above the center line whereas when it is 00 it is below the center line
orange = SIGNED INTEGER - units away from the center line
red = unknown
purple = | first bit = unknown
         | second bit = performer label (ie T, W, C, etc)

idx side offset dir  offset ???  ?? label
01 FF FF E2 B4 00 00 0C 35 FF 99 00 55 00
02 FF FF EE E9 00 00 15 F9 FF 99 00 52 00
03 FF FF C4 30 00 00 24 9F FF 99 00 54 00
04 FF FF C0 1E 00 00 30 04 FF 99 00 54 00
05 FF FF BE 15 00 00 29 81 FF 99 00 4D 00
06 00 00 05 4A 00 00 30 04 00 00 FF 4F 00
07 FF FF DC 9A 00 00 11 17 FF 99 00 42 00
    ...read until performer index is last_instrument_index
    """
    while True:
        performer_index = int.from_bytes(data[start_read:start_read + bc(1)], byteorder='big')
        # print("performer_index:", performer_index)
        # print("side", data[start_read + bc(1):start_read + bc(3)])
        side = 'Side 2' if data[start_read + bc(1):start_read + bc(3)] == b'\xFF\xFF' else 'Side 1'
        offset_from_50 = int.from_bytes(data[start_read + bc(3):start_read + bc(5)], byteorder='big', signed=True)
        direction_flag = 'Above Center Line' if data[start_read + bc(5):start_read + bc(7)] == b'\xFF\xFF' else 'Below Center Line'
        # print(data[start_read + bc(5):start_read + bc(7)])
        offset_from_center = int.from_bytes(data[start_read + bc(7):start_read + bc(9)], byteorder='big', signed=True)
        # print(data[start_read + bc(7):start_read + bc(9)])
        # print("offset_from_center:", offset_from_center)
        unknown_value = int.from_bytes(data[start_read + bc(9):start_read + bc(12)], byteorder='big')
        # print(data[start_read + bc(9):start_read + bc(12)])
        performer_label = (data[start_read + bc(12):start_read + bc(13)]).decode('ascii').strip()
        # print("performer_label:", performer_label)

        counts[performer_index] = {
            'x': {
                'side': side,
                'distance_from_50': offset_from_50,
            },
            'y': {
                'center_direction': direction_flag,
                'distance_from_center': offset_from_center,
            },
            'unknown_value': unknown_value,
            'performer_label': performer_label
        }

        start_read += bc(14)
        if performer_index == len(instruments):
            break

    set_data = counts_to_sets(counts, sets)
    coords = sets_to_coordinates(instruments, set_data)
    return coords
