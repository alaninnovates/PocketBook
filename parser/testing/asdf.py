import struct

# --- Configuration: adjust if needed ---
STEP_SCALE = 21.75      # units per step
STEPS_PER_YARD = 1.6    # 8-to-5 marching band ratio
X_ORIGIN = 60151         # internal units corresponding to 0 yd
Y_ORIGIN = 0             # front sideline

# --- Helper functions ---
def decode_signed_int(bytes_seq):
    """
    Decode big-endian signed integer from bytes
    Supports arbitrary length (works for 4 or 6 bytes)
    """
    value = int.from_bytes(bytes_seq, byteorder='big', signed=False)
    # Check sign bit manually for non-standard sizes
    bit_length = len(bytes_seq) * 8
    if value & (1 << (bit_length - 1)):
        value -= 1 << bit_length
    return value

def units_to_steps(value, origin):
    """Convert internal units to marching band steps"""
    return (value - origin) / STEP_SCALE

def steps_to_yards(steps):
    """Convert steps to yards + remaining steps"""
    yards = int(steps / STEPS_PER_YARD)
    rem_steps = steps - yards * STEPS_PER_YARD
    return yards, rem_steps

# --- Main decoding function ---
def decode_drill_file(filename):
    records = []
    with open(filename, 'rb') as f:
        while True:
            # read til \n
            chunk = f.readline().decode('ascii')
            if not chunk:
                break  # EOF
            chunk = bytes.fromhex(chunk.strip())
            print(chunk)

            label = chr(chunk[0])
            index = chunk[2]

            # X: bytes 3–8 (6 bytes)
            x_raw = decode_signed_int(chunk[3:9])
            # Y: bytes 9–12 (4 bytes)
            y_raw = decode_signed_int(chunk[9:13])
            print(chunk[3:9], x_raw)
            print(chunk[9:13], y_raw)

            flags = chunk[13]

            # Convert to steps
            x_steps = units_to_steps(x_raw, X_ORIGIN)
            y_steps = units_to_steps(y_raw, Y_ORIGIN)

            # Convert to yards + fractional steps
            x_yds, x_rem_steps = steps_to_yards(x_steps)
            y_yds, y_rem_steps = steps_to_yards(y_steps)

            record = {
                'label': label,
                'index': index,
                'x_raw': x_raw,
                'y_raw': y_raw,
                'x_steps': x_steps,
                'y_steps': y_steps,
                'x_yards': x_yds,
                'x_rem_steps': x_rem_steps,
                'y_yards': y_yds,
                'y_rem_steps': y_rem_steps,
                'flags': flags
            }
            records.append(record)

    return records

# --- Demo usage ---
if __name__ == "__main__":
    filename = 'drill_data.bin'  # replace with your file
    records = decode_drill_file(filename)

    for r in records:
        print(f"Performer {r['label']} #{r['index']}: "
              f"X = {r['x_yards']} yd + {r['x_rem_steps']:.2f} steps, "
              f"Y = {r['y_yards']} yd + {r['y_rem_steps']:.2f} steps, "
              f"Flags = {r['flags']:02X}")
