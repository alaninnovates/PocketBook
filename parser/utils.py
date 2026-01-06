def find_index_of(data, target_text, return_end = False):
    """
    Finds the index of the target_text in data.
    :param data:
    :param target_text: ASCII text to find
    :param return_end: If True, returns the index after the found text
    :return:
    """
    target_bytes = target_text.encode('ascii')
    index = data.find(target_bytes)
    if index == -1:
        return -1
    if return_end:
        return index + len(target_bytes)
    return index

def bc(bytes):
    """
    this function lowk just tells me that im reading bytes. does nothing
    """
    return bytes