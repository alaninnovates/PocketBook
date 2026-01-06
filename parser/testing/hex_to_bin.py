import os

def hex_to_bin(filename):
    records = []
    with open(filename, 'r') as f:
        while True:
            chunk = f.readline().strip()
            if not chunk:
                break  # EOF
            record = bytes.fromhex(chunk)
            records.append(record)
    return records

if __name__ == "__main__":
    # read all files in instruments/
    instruments_files = os.listdir('instruments')
    for file in instruments_files:
        resp = hex_to_bin('instruments/' + file)
        with open('binary/' + file, 'wb') as f:
            for record in resp:
                f.write(record)