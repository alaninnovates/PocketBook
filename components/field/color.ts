// we love hashing woooo
export const instrumentToColor = (instrument: string, darkMode: boolean) => {
    let hash = 0;
    for (let i = 0; i < instrument.length; i++) {
        hash = instrument.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0; // 32bit int
    }

    let hue, saturation, lightness
    if (darkMode) {
        hue = Math.abs(hash) % 360;
        saturation = 70 + (Math.abs(hash >> 3) % 20);
        lightness = 30 + (Math.abs(hash >> 7) % 10);
    } else {
        hue = Math.abs(hash) % 360;
        saturation = 60 + (Math.abs(hash >> 3) % 30);
        lightness = 40 + (Math.abs(hash >> 7) % 20);
    }

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
