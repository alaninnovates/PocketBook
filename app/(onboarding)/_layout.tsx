import {Stack} from 'expo-router';

// export const unstable_settings = {
//     anchor: '(onboarding)',
// };

export default function OnboardingLayout() {
    return (
        <Stack>
            <Stack.Screen name="welcome"/>
            <Stack.Screen name="profile-info"/>
            <Stack.Screen name="join-ensemble"/>
        </Stack>
    );
}
