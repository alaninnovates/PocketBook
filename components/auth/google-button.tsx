import {
    GoogleSignin,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin'
import {supabase} from '@/lib/supabase'
import {IconButton} from "react-native-paper";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export function GoogleButton() {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID || '',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID || '',
    })

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
            onPress={async () => {
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
                        // some other error happened
                    }
                }
            }}
        />
    )
}