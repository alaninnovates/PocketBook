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

export const colorToHex = (color: {r: number; g: number; b: number}, darkMode: boolean) => {
    let {r, g, b} = color;

    if (darkMode) {
        r = Math.round(r * 0.8);
        g = Math.round(g * 0.8);
        b = Math.round(b * 0.8);
    }

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const getTextColorForBackground = (backgroundColor: string) => {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}