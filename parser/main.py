import sys
import os
import json
from instruments import parse_instruments
from sets import parse_sets

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python main.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    out_dict = {}
    with open(input_file, 'rb') as f:
        data = f.read()
        out_dict['instruments'] = parse_instruments(data)
        out_dict['sets'] = parse_sets(data)
    with open(f"{output_file}.json", 'w') as out_f:
        json.dump(out_dict, out_f, indent=4)
