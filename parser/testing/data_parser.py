"""
first two bytes = performer index (defined in instruments section)
second 2 bytes = case 00 00 -> side 2; case FF FF -> side 1
third two bytes = steps off from the 50. one step = 625 units
fourth two bytes = either 00 or FF, and it seems when it is FF the person is above the center line whereas when it is 00 it is below the center line
fifth two bytes = SIGNED INTEGER - the distance away from the center line. ie when negative, above center line, and positive below the center line
sixth two bytes = unknown
seventh two bytes:
 - first bit = unknown
 - second bit = performer label (ie T, W, C, etc)
"""
import json


def bc(bytes):
    return bytes * 3


def parse_performer_data(segment):
    performer_index = int.from_bytes(bytes.fromhex(segment[bc(0):bc(2)]), byteorder='big')
    # x
    side = 'Side 2' if segment[bc(2):bc(4)] == '00 00 ' else 'Side 1'
    steps_off = int.from_bytes(bytes.fromhex(segment[bc(4):bc(6)]), byteorder='big', signed=True) / 625
    # y
    position_flag = 'Above Center Line' if segment[bc(6):bc(8)] == 'FF FF ' else 'Below Center Line'
    distance_from_center = int.from_bytes(bytes.fromhex(segment[bc(8):bc(10)]), byteorder='big', signed=True) / 625
    unknown_value = segment[bc(10):bc(12)]
    unknown_value_2 = segment[bc(12):bc(13)]
    performer_label = chr(int.from_bytes(bytes.fromhex(segment[bc(13):bc(14)]))).strip()

    return {
        'performer_index': performer_index,
        'x': {
            'side': side,
            'distance_from_50': steps_off,
        },
        'y': {
            'center_direction': position_flag,
            'distance_from_center': distance_from_center,
        },
        'unknown_value': unknown_value,
        'unknown_value_2': unknown_value_2,
        'performer_label': performer_label
    }


if __name__ == "__main__":
    tuba_file = "instruments/1_01_55.bin"
    results = []
    with open(tuba_file, 'r') as f:
        while True:
            segment = f.readline()
            if not segment:
                break  # EOF
            parsed_data = parse_performer_data(segment)
            results.append(parsed_data)
    with open('parsed_tuba_data.json', 'w') as out_file:
        json.dump(results, out_file)
