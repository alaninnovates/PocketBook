import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
    MD3DarkTheme,
    MD3LightTheme,
    adaptNavigationTheme,
} from 'react-native-paper';
import merge from 'deepmerge';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

const generatedLight = {
    "colors": {
        "primary": "rgb(1, 97, 163)",
        "onPrimary": "rgb(255, 255, 255)",
        "primaryContainer": "rgb(209, 228, 255)",
        "onPrimaryContainer": "rgb(0, 29, 54)",
        "secondary": "rgb(83, 95, 112)",
        "onSecondary": "rgb(255, 255, 255)",
        "secondaryContainer": "rgb(215, 227, 247)",
        "onSecondaryContainer": "rgb(16, 28, 43)",
        "tertiary": "rgb(107, 87, 120)",
        "onTertiary": "rgb(255, 255, 255)",
        "tertiaryContainer": "rgb(242, 218, 255)",
        "onTertiaryContainer": "rgb(37, 20, 49)",
        "error": "rgb(186, 26, 26)",
        "onError": "rgb(255, 255, 255)",
        "errorContainer": "rgb(255, 218, 214)",
        "onErrorContainer": "rgb(65, 0, 2)",
        "background": "rgb(253, 252, 255)",
        "onBackground": "rgb(26, 28, 30)",
        "surface": "rgb(253, 252, 255)",
        "onSurface": "rgb(26, 28, 30)",
        "surfaceVariant": "rgb(223, 226, 235)",
        "onSurfaceVariant": "rgb(67, 71, 78)",
        "outline": "rgb(115, 119, 127)",
        "outlineVariant": "rgb(195, 199, 207)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(47, 48, 51)",
        "inverseOnSurface": "rgb(241, 240, 244)",
        "inversePrimary": "rgb(158, 202, 255)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(240, 244, 250)",
            "level2": "rgb(233, 240, 248)",
            "level3": "rgb(225, 235, 245)",
            "level4": "rgb(223, 233, 244)",
            "level5": "rgb(218, 230, 242)"
        },
        "surfaceDisabled": "rgba(26, 28, 30, 0.12)",
        "onSurfaceDisabled": "rgba(26, 28, 30, 0.38)",
        "backdrop": "rgba(44, 49, 55, 0.4)"
    }
}

const generatedDark = {
    "colors": {
        "primary": "rgb(158, 202, 255)",
        "onPrimary": "rgb(0, 50, 88)",
        "primaryContainer": "rgb(0, 73, 125)",
        "onPrimaryContainer": "rgb(209, 228, 255)",
        "secondary": "rgb(187, 199, 219)",
        "onSecondary": "rgb(37, 49, 64)",
        "secondaryContainer": "rgb(59, 72, 88)",
        "onSecondaryContainer": "rgb(215, 227, 247)",
        "tertiary": "rgb(214, 190, 228)",
        "onTertiary": "rgb(59, 41, 72)",
        "tertiaryContainer": "rgb(82, 63, 95)",
        "onTertiaryContainer": "rgb(242, 218, 255)",
        "error": "rgb(255, 180, 171)",
        "onError": "rgb(105, 0, 5)",
        "errorContainer": "rgb(147, 0, 10)",
        "onErrorContainer": "rgb(255, 180, 171)",
        "background": "rgb(26, 28, 30)",
        "onBackground": "rgb(226, 226, 230)",
        "surface": "rgb(26, 28, 30)",
        "onSurface": "rgb(226, 226, 230)",
        "surfaceVariant": "rgb(67, 71, 78)",
        "onSurfaceVariant": "rgb(195, 199, 207)",
        "outline": "rgb(141, 145, 153)",
        "outlineVariant": "rgb(67, 71, 78)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(226, 226, 230)",
        "inverseOnSurface": "rgb(47, 48, 51)",
        "inversePrimary": "rgb(1, 97, 163)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(33, 37, 41)",
            "level2": "rgb(37, 42, 48)",
            "level3": "rgb(41, 47, 55)",
            "level4": "rgb(42, 49, 57)",
            "level5": "rgb(45, 52, 62)"
        },
        "surfaceDisabled": "rgba(226, 226, 230, 0.12)",
        "onSurfaceDisabled": "rgba(226, 226, 230, 0.38)",
        "backdrop": "rgba(44, 49, 55, 0.4)"
    }
}

export const CombinedLightTheme = merge(MD3LightTheme, {
    ...LightTheme,
    // colors: generatedLight.colors,
});
export const CombinedDarkTheme = merge(MD3DarkTheme, {
    ...DarkTheme,
    // colors: generatedDark.colors,
});
