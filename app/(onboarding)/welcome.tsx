import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {Button, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";

export default function OnboardingWelcomeScreen() {
    const {profile} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
                First, let's get you set up with your profile information.
            </Text>
            <Button onClick={() => router.push('/(onboarding)/profile-info')}>
                Get Started
            </Button>
        </div>
    )
}