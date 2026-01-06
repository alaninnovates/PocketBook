from utils import bc, find_index_of

def parse_sets(data):
    """

    :param data:
    :return:
    """
    sets = {}
    """ex data for sets
50(P) 54(T) 41 (A) 42 (B) 20 20 20 20 20 20 20 00 00 01 EF 00 1D --> skip all '20', skip 6 bytes

most of these values are unknown or unnecessary. read all of the 00-prefixed data
subset is either 00 or 01, and is the 5th byte

?? cnt      subset
00 00 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
00 08 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
00 18 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
00 24 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
00 34 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
00 40 00 02 00 00 02 00 02 00 02 00 02 00 02 00 02
    """
    start_read = find_index_of(data, 'PTAB', return_end=True)
    while data[start_read:start_read + bc(1)] == b'\x20':
        start_read += bc(1)
    start_read += bc(6)
    i = 0
    subset_cnt = 0
    while True:
        d_type = data[start_read:start_read + bc(1)] # either 00 or 01 but tbh idk what 01 does so
        # print(d_type)
        if d_type == b'\x00':
            # print(data[start_read:start_read + bc(17)])
            cnt = int.from_bytes(data[start_read + bc(1):start_read + bc(2)], byteorder='big')
            subset = int.from_bytes(data[start_read + bc(4):start_read + bc(5)], byteorder='big')
            if subset == 1:
                subset_cnt += 1
                letter = chr(ord('A') + subset_cnt - 1)
                set_name = f"{i}{letter}"
            else:
                i += 1
                subset_cnt = 0
                set_name = f"{i}"
            # print(f"set {set_name} with count {cnt} and subset {subset}")
            sets[set_name] = {
                'counts': cnt,
                'subset': subset
            }
            start_read += bc(17)
        else:
            break
    return sets