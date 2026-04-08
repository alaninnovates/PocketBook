import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import {Button, Text, TextInput, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {View} from "react-native";
import {useState} from "react";

export default function OnboardingProfileInfoScreen() {
    const {profile, updateOnboardingStep, updateProfileName} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();
    const [firstName, setFirstName] = useState(profile?.name || '');
    const [lastName, setLastName] = useState('');
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
            <TextInput label="First Name" value={firstName} mode="outlined" onChangeText={setFirstName}/>
            <TextInput label="Last Name" value={lastName} mode="outlined" onChangeText={setLastName}/>
            <Button mode="contained" onPress={async () => {
                setLoading(true);
                await updateProfileName?.(firstName, lastName);
                await updateOnboardingStep?.(OnboardingStep.JoinEnsemble);
                router.push('/(onboarding)/join-ensemble');
            }} disabled={loading || !(firstName.trim() && lastName.trim())}>
                Continue
            </Button>
        </View>
    )
}