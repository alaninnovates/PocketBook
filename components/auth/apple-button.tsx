import {Alert, Platform} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {supabase} from '@/lib/supabase';
import {signInWithOAuth} from '@/lib/oauth';
import {IconButton, useTheme} from "react-native-paper";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export function AppleButton({type}: { type: "sign-up" | "log-in" }) {
    const theme = useTheme();

    if (Platform.OS === 'web') {
        return (
            <IconButton
                mode="contained"
                icon={({size, color}) => (
                    <FontAwesome6
                        name="apple"
                        size={size}
                        color={color}
                    />
                )}
                size={32}
                onPress={async () => {
                    try {
                        await signInWithOAuth('apple');
                    } catch (error) {
                        console.error('Apple sign-in failed:', error);
                    }
                }}
            />
        );
    }

    if (Platform.OS !== 'ios') return null;

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={
                type === "sign-up"
                    ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={theme.dark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={99}
            style={{width: 52, height: 52}}
            onPress={async () => {
                try {
                    const isAvailable = await AppleAuthentication.isAvailableAsync();
                    if (!isAvailable) {
                        Alert.alert(
                            "Apple Sign-In Unavailable",
                            "Apple authentication is not available on this device. Please try a different sign-in method.",
                        );
                        return;
                    }

                    const credential = await AppleAuthentication.signInAsync({
                        requestedScopes: [
                            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                            AppleAuthentication.AppleAuthenticationScope.EMAIL,
                        ],
                    });

                    if (!credential.identityToken) {
                        Alert.alert(
                            "Sign-In Failed",
                            "We didn't receive a valid identity token from Apple. Please try again.",
                        );
                        return;
                    }

                    const {error, data: {user}} = await supabase.auth.signInWithIdToken({
                        provider: 'apple',
                        token: credential.identityToken,
                    });

                    if (error) {
                        console.error('Supabase Apple sign-in error:', error);
                        Alert.alert(
                            "Sign-In Failed",
                            error.message || "We couldn't sign you in with Apple. Please try again.",
                        );
                        return;
                    }

                    if (credential.fullName) {
                        const nameParts = [];
                        if (credential.fullName.givenName) nameParts.push(credential.fullName.givenName);
                        if (credential.fullName.middleName) nameParts.push(credential.fullName.middleName);
                        if (credential.fullName.familyName) nameParts.push(credential.fullName.familyName);
                        const fullName = nameParts.join(' ');

                        if (fullName) {
                            const {error: updateError} = await supabase.auth.updateUser({
                                data: {
                                    full_name: fullName,
                                    given_name: credential.fullName.givenName,
                                    family_name: credential.fullName.familyName,
                                },
                            });
                            if (updateError) {
                                console.error('Error updating user profile:', updateError);
                            }
                        }
                    }
                } catch (e: any) {
                    if (e?.code === 'ERR_REQUEST_CANCELED') return;
                    Alert.alert(
                        "Sign-In Error",
                        e.message || "An unexpected error occurred during Apple sign-in. Please try again.",
                    );
                }
            }}
        />
    );
}
