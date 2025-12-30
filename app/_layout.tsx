import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {PaperProvider} from "react-native-paper";
import {useColorScheme} from "react-native";
import {useAuthContext} from "@/lib/hooks/use-auth-context";
import AuthProvider from "@/components/auth/auth-provider";

export const unstable_settings = {
    anchor: '(tabs)',
};

function RootNavigator() {
    const {isLoggedIn} = useAuthContext();
    return (
        <Stack>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="login" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Screen name="+not-found"/>
        </Stack>
    )
}


export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <PaperProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AuthProvider>
                    <RootNavigator/>
                    <StatusBar style="auto"/>
                </AuthProvider>
            </ThemeProvider>
        </PaperProvider>
    );
}
