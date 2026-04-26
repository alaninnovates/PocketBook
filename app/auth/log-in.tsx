import {IconButton, Text, TextInput, useTheme} from "react-native-paper";
import {GoogleButton} from "@/components/auth/google-button";
import {DiscordButton} from "@/components/auth/discord-button";
import {EmailPassword} from "@/components/auth/email-password";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {View} from "react-native";
import {useRouter} from "expo-router";

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();
    const {left} = useSafeAreaInsets();
    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center', alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}>
            <IconButton icon={"arrow-left"} size={24} onPress={() => {
                router.navigate('/');
            }} style={{ position: "absolute", top: 0, left }}/>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                Log in
            </Text>
            <EmailPassword type="log-in"/>
            <View style={{display: 'flex', flexDirection: 'row', gap: 16}}>
                <GoogleButton/>
                <DiscordButton/>
            </View>
        </SafeAreaView>
    )
}
