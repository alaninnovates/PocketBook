import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import {Button, Text, TextInput, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {View} from "react-native";
import {useState} from "react";

export default function OnboardingProfileInfoScreen() {
    const {profile, updateOnboardingStep, updateProfileName} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();
    const [name, setName] = useState(profile?.name || '');
    const [loading, setLoading] = useState(false);

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 32,
        }}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                About You
            </Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                This is the information that will be displayed to your ensemble and band directors. You can edit this information later in your profile settings.
            </Text>
            <TextInput label="Full Name" value={name} mode="outlined" onChangeText={setName}/>
            <Button mode="contained" onPress={async () => {
                setLoading(true);
                await updateProfileName?.(name);
                await updateOnboardingStep?.(OnboardingStep.JoinEnsemble);
                router.push('/(onboarding)/join-ensemble');
            }} disabled={loading || !name.trim()}>
                Continue
            </Button>
        </View>
    )
}