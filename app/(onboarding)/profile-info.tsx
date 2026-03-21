import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {useTheme} from "react-native-paper";
import {useRouter} from "expo-router";

export default function OnboardingProfileInfoScreen() {
    const {profile} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();
}