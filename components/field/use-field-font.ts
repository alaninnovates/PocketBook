import {Platform} from "react-native";
import {matchFont, SkFont, useFont} from "@shopify/react-native-skia";

const fontFamily = Platform.select({ios: "Arial", default: "arial"});

// matchFont (system font lookup) is not implemented on Skia Web, so load the
// bundled Arial from data there instead. useFont is called unconditionally to
// satisfy the rules of hooks; its result is unused on native, which keeps
// using the system Arial.
export const useFieldFont = (fontSize: number) => {
    const webFont = useFont(require("@/assets/fonts/arial.ttf"), fontSize);
    if (Platform.OS === "web") {
        return webFont;
    }
    return matchFont({fontFamily, fontSize});
};

// SkFont.measureText is not implemented on Skia Web — compute the same
// values from getTextWidth / getMetrics there instead.
export const measureTextWidth = (font: SkFont, text: string) => {
    if (Platform.OS === "web") {
        return font.getTextWidth(text);
    }
    return font.measureText(text).width;
};

export const measureTextHeight = (font: SkFont, text: string) => {
    if (Platform.OS === "web") {
        const metrics = font.getMetrics();
        return metrics.descent - metrics.ascent;
    }
    return font.measureText(text).height;
};
