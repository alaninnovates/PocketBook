import React, {createContext, useContext} from 'react'
import {ThemePreference} from "@/lib/settings-manager";

export type ThemeScheme = 'light' | 'dark';

export type ThemePreferenceData = {
    preference: ThemePreference;
    scheme: ThemeScheme;
    isReady: boolean;
    setPreference: (next: ThemePreference) => Promise<void>;
}

export const ThemePreferenceContext = createContext<ThemePreferenceData>({
    preference: ThemePreference.System,
    scheme: 'light',
    isReady: false,
    setPreference: async () => {},
})

export const useThemePreference = () => useContext(ThemePreferenceContext);
