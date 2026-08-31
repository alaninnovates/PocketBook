import {ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import {PaperProvider, useTheme} from "react-native-paper";
import {Platform} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import AuthProvider from "@/components/auth/auth-provider";
import {CombinedDarkTheme, CombinedLightTheme} from "@/lib/theme";
import ShowProvider from "@/lib/show-provider";
import ThemePreferenceProvider from "@/lib/theme-preference-provider";
import {useThemePreference} from "@/lib/hooks/use-theme-preference";
import UpdatePrompt from "@/components/update-prompt";
import {useEffect} from "react";

export const unstable_settings = {
    anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

function RootNavigator() {
    const {isLoadingSession, isLoadingProfile, profile, isLoggedIn} = useAuthContext();
    const {isReady: isThemeReady} = useThemePreference();
    const isOnboarding = profile?.onboarding_step !== OnboardingStep.Completed;

    useEffect(() => {
        if (isThemeReady && ((isLoggedIn && !profile && !isLoadingProfile) || (!isLoadingSession && !isLoggedIn))) {
            setTimeout(() => {
                SplashScreen.hideAsync();
            }, 1000);
        }
    }, [isLoadingSession, isLoadingProfile, isLoggedIn, profile, isThemeReady]);

    return (
        <Stack>
            <Stack.Protected guard={(isLoggedIn && !isOnboarding)}>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="(modals)" options={{presentation: 'modal', headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={(isLoggedIn && isOnboarding)}>
                <Stack.Screen name="(onboarding)" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="auth" options={{headerShown: false}}/>
                <Stack.Screen name="index" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Screen name="+not-found"/>
        </Stack>
    )
}

function WebPageBackground() {
    const theme = useTheme();
    const {isReady} = useThemePreference();
    useEffect(() => {
        if (!isReady || Platform.OS !== "web" || typeof document === "undefined") return;
        document.body.style.backgroundColor = theme.colors.background;
        document.documentElement.style.backgroundColor = theme.colors.background;
    }, [theme, isReady]);
    return null;
}

function ThemedApp() {
    const {scheme} = useThemePreference();
    const theme = scheme === 'dark' ? CombinedDarkTheme : CombinedLightTheme;

    return (
        <PaperProvider theme={theme}>
            <ThemeProvider value={theme}>
                <AuthProvider>
                    <ShowProvider>
                        <WebPageBackground/>
                        <RootNavigator/>
                        {Platform.OS !== "web" && <UpdatePrompt/>}
                        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'}/>
                    </ShowProvider>
                </AuthProvider>
            </ThemeProvider>
        </PaperProvider>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ThemePreferenceProvider>
                <ThemedApp/>
            </ThemePreferenceProvider>
        </GestureHandlerRootView>
    );
}
