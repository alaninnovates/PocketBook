import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import {Button, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {View} from "react-native";

export default function OnboardingWelcomeScreen() {
    const {profile, updateOnboardingStep} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 32,
        }}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                Welcome to PocketBook, {profile?.name || 'there'}!
            </Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                PocketBook is the ultimate app for ...
            </Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                First, let&#39;s get you set up with your profile information.
            </Text>
            <Button mode="contained" onPress={async () => {
                await updateOnboardingStep?.(OnboardingStep.ProfileInfo);
                router.push('/(onboarding)/profile-info')
            }}>
                Get Started
            </Button>
        </View>
    )
}