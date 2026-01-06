def bc(bytes):
    #returns number of string characters to read for the given byte count
    return bytes * 3

def instruments(filename):
    records = {}
    with open(filename, 'rb') as f:
        while True:
            chunk = f.read(bc(880)).decode('ascii')
            if not chunk:
                break  # EOF
#             print(chunk)
            # split into 14-byte segments except a last incomplete one
            segments = [chunk[i:i+bc(14)] for i in range(0, len(chunk), bc(14))]
#             print(segments)
#             break
            prev_index = None
            for segment in segments:
                # read first 3 chars of each segment
                index = segment[bc(1):bc(2)].strip()
                label = segment[bc(13):bc(14)].strip()
                if prev_index is not None and int.from_bytes(bytes.fromhex(index)) != int.from_bytes(bytes.fromhex(prev_index)) + 1:
                    break
                prev_index = index
                if index not in records:
                    records[index] = {'label': label, 'index': index, 'data': []}
                records[index]['data'].append(segment)
    return records

if __name__ == "__main__":
    filename = 'drill_data.bin'
    records = instruments(filename)  # 55 = tuba; 50 = piccolo, 4F = bari sax
    for index, record in records.items():
        print(f"Index: {index}, Label: {record['label']}, Segments: {len(record['data'])}")
        file = f"instruments/{int.from_bytes(bytes.fromhex(index))}_{index}_{record['label']}.bin"
        with open(file, 'wb') as f:
            for segment in record['data']:
                f.write(segment.encode('ascii') + b'\n')
