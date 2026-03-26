import {Stack} from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";

// export const unstable_settings = {
//     anchor: '(onboarding)',
// };

export default function OnboardingLayout() {
    return (
        <SafeAreaView style={{padding: 16, flex: 1}}>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="welcome"/>
                <Stack.Screen name="profile-info"/>
                <Stack.Screen name="join-ensemble"/>
            </Stack>
        </SafeAreaView>
    );
}
