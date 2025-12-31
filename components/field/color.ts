// we love hashing woooo
export const instrumentToColor = (instrument: string) => {
    let hash = 0;
    for (let i = 0; i < instrument.length; i++) {
        hash = instrument.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0; // 32bit int
    }

    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash >> 3) % 30);
    const lightness = 40 + (Math.abs(hash >> 7) % 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
