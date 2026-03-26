import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {Button, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {View} from "react-native";

export default function OnboardingProfileInfoScreen() {
    const {profile} = useAuthContext();
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
                O
            </Text>
            <Button mode="contained" onPress={() => router.push('/(onboarding)/join-ensemble')}>
                Continue
            </Button>
        </View>
    )
}