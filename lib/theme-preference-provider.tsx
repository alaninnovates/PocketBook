import {PropsWithChildren, useEffect, useState} from "react";
import {useColorScheme} from "react-native";
import {SettingsManager, SettingsProperty, ThemePreference} from "@/lib/settings-manager";
import {ThemePreferenceContext, ThemeScheme} from "@/lib/hooks/use-theme-preference";

export default function ThemePreferenceProvider({children}: PropsWithChildren) {
    const [preference, setPreferenceState] = useState<ThemePreference>(ThemePreference.System);
    const [isReady, setIsReady] = useState(false);
    const systemScheme = useColorScheme();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const stored = await SettingsManager.getProperty<ThemePreference>(
                    SettingsProperty.Theme,
                    ThemePreference.System
                );
                if (!cancelled) setPreferenceState(stored);
            } finally {
                if (!cancelled) setIsReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const scheme: ThemeScheme = preference === ThemePreference.System
        ? (systemScheme === 'dark' ? 'dark' : 'light')
        : preference;

    const setPreference = async (next: ThemePreference) => {
        setPreferenceState(next);
        await SettingsManager.setProperty<ThemePreference>(SettingsProperty.Theme, next);
    };

    return (
        <ThemePreferenceContext.Provider value={{
            preference,
            scheme,
            isReady,
            setPreference,
        }}>
            {children}
        </ThemePreferenceContext.Provider>
    );
}
