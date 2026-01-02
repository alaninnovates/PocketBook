import {Text, useTheme} from "react-native-paper";
import {GoogleButton} from "@/components/auth/google-button";
import {DiscordButton} from "@/components/auth/discord-button";
import {EmailPassword} from "@/components/auth/email-password";
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";

export default function LoginScreen() {
    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center', alignItems: 'center'
            }}>
            <Text variant="headlineMedium">Login</Text>
            {/*<EmailPassword/>*/}
            <View style={{display: 'flex', flexDirection: 'row', gap: 16, marginTop: 16}}>
                <GoogleButton/>
                <DiscordButton/>
            </View>
        </SafeAreaView>
    )
}
