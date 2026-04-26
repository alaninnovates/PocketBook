import {Stack} from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";

export default function AuthLayout() {
    return (
        <SafeAreaView style={{padding: 16, flex: 1}}>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="log-in"/>
                <Stack.Screen name="sign-up"/>
            </Stack>
        </SafeAreaView>
    );
}
