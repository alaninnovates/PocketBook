import {Text, useTheme} from "react-native-paper";
import {GoogleButton} from "@/components/auth/google-button";
import {DiscordButton} from "@/components/auth/discord-button";
import {EmailPassword} from "@/components/auth/email-password";
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";
import {Image} from "expo-image";

export default function LoginScreen() {
    const theme = useTheme();
    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center', alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                Welcome to PocketBook!
            </Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                The ultimate drill learning platform for marching.
            </Text>
            <View style={{width: '80%', aspectRatio: 1.5, backgroundColor: theme.colors.surface, borderRadius: theme.roundness, justifyContent: 'center', alignItems: 'center'}}>
                <Image source={require('../assets/images/homepage-sample-image.png')} style={{width: '100%', height: '100%', borderRadius: theme.roundness}} contentFit="cover"/>
            </View>
            <Text variant="bodyLarge" style={{color: theme.colors.onSurfaceVariant, marginTop: 16}}>
                Log in
            </Text>
            <View style={{display: 'flex', flexDirection: 'row', gap: 16}}>
                <GoogleButton/>
                <DiscordButton/>
            </View>
        </SafeAreaView>
    )
}
