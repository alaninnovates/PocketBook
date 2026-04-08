import {OnboardingStep, useAuthContext} from "@/lib/hooks/use-auth-context";
import {Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {View} from "react-native";
import JoinEnsemble from "@/components/join-ensemble";

export default function OnboardingJoinEnsembleScreen() {
    const {updateOnboardingStep} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 32,
            height: '100%',
        }}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                Join Ensemble
            </Text>
            <JoinEnsemble onSuccess={async () => {
                await updateOnboardingStep?.(OnboardingStep.Completed);
                router.push('/(tabs)/shows');
            }}/>
        </View>
    )
}