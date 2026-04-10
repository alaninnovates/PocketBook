import {ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {PaperProvider} from "react-native-paper";
import {useColorScheme} from "react-native";
import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import AuthProvider from "@/components/auth/auth-provider";
import {CombinedDarkTheme, CombinedLightTheme} from "@/lib/theme";
import ShowProvider from "@/lib/show-provider";

export const unstable_settings = {
    anchor: '(tabs)',
};

function RootNavigator() {
    const {profile, isLoggedIn} = useAuthContext();
    const isOnboarding = profile?.onboarding_step !== OnboardingStep.Completed;
    return (
        <Stack>
            <Stack.Protected guard={!profile || (isLoggedIn && !isOnboarding)}>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="(modals)" options={{presentation: 'modal', headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={!profile || (isLoggedIn && isOnboarding)}>
                <Stack.Screen name="(onboarding)" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn || !profile}>
                <Stack.Screen name="index" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Screen name="+not-found"/>
        </Stack>
    )
}


export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <PaperProvider theme={colorScheme === 'dark' ? CombinedDarkTheme : CombinedLightTheme}>
            <ThemeProvider value={colorScheme === 'dark' ? CombinedDarkTheme : CombinedLightTheme}>
                <AuthProvider>
                    <ShowProvider>
                        <RootNavigator/>
                        <StatusBar style="auto"/>
                    </ShowProvider>
                </AuthProvider>
            </ThemeProvider>
        </PaperProvider>
    );
}
