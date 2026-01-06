from utils import bc, find_index_of

def parse_instruments(data):
    """

    :param data:
    :return:
    """
    start_read = find_index_of(data, 'CAST', return_end=True) + bc(7)
    instruments = {}
    """ ex data after start_read
ld = the column of the last byte of data for the label
idx   ld label       name
01 00 04 55 31    00 06 54 75 62 61 00
02 00 04 52 32    00 0A 54 72 6F 6D 62 6F 6E 65 00
03 00 04 54 32    00 09 54 72 75 6D 70 65 74 00
label starts at the 4th byte after index, and ends at the ld column
notice name can be any length, but ends with 00
    """
    while True:
        instrument_index = data[start_read:start_read + bc(1)]
        # print("instrument_index:", int.from_bytes(instrument_index, byteorder='big'))
        ld = int.from_bytes(data[start_read + bc(2):start_read + bc(3)], byteorder='big') + 1
        # print("ld:", ld)
        instrument_label = data[start_read + bc(3):start_read + ld].decode('ascii')
        # print(f"label: {instrument_label}")
        name_start = start_read + ld + bc(2)
        name_end = name_start
        while data[name_end:name_end + bc(1)] != b'\x00':
            name_end += bc(1)
        instrument_name = data[name_start:name_end].decode('ascii')
        # print(f"name: {instrument_name}")
        if 'PTAB' in instrument_name:
            instruments[int.from_bytes(instrument_index, byteorder='big')] = {
                'label': instrument_label,
                'name': instrument_name[:-4]
            }
            break
        instruments[int.from_bytes(instrument_index, byteorder='big')] = {
            'label': instrument_label,
            'name': instrument_name
        }
        start_read = name_end + bc(1)
    return instruments