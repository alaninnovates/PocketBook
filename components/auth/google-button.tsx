import {
    GoogleSignin,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin'
import {supabase} from '@/lib/supabase'
import {signInWithOAuth} from '@/lib/oauth'
import {IconButton} from "react-native-paper";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {Platform} from "react-native";

if (Platform.OS !== 'web') {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID || '',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID || '',
    })
}

export function GoogleButton() {
    const onPress = async () => {
        if (Platform.OS === 'web') {
            // The native Google SDK isn't available on web, so use the
            // same-tab OAuth redirect flow instead.
            try {
                await signInWithOAuth('google')
            } catch (error) {
                console.error('Google sign-in failed:', error)
            }
            return
        }

        try {
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn()
            if (isSuccessResponse(response)) {
                const {data, error} = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.data.idToken!,
                })
                console.log(error, data)
            }
        } catch (error: any) {
            if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                console.error('Google sign-in failed:', error)
            }
        }
    }

    return (
        <IconButton
            mode="contained"
            icon={({size, color}) => (
                <FontAwesome6
                    name="google"
                    size={size}
                    color={color}
                />
            )}
            size={32}
            onPress={onPress}
        />
    )
}
