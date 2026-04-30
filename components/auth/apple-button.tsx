import {Platform} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {supabase} from '@/lib/supabase';

export function AppleButton({type}: { type: "sign-up" | "log-in" }) {
    if (Platform.OS !== 'ios') return null;

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={
                type === "sign-up"
                    ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={99}
            style={{width: 52, height: 52}}
            onPress={async () => {
                try {
                    const credential = await AppleAuthentication.signInAsync({
                        requestedScopes: [
                            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                            AppleAuthentication.AppleAuthenticationScope.EMAIL,
                        ],
                    });
                    if (credential.identityToken) {
                        const {error, data: {user}} = await supabase.auth.signInWithIdToken({
                            provider: 'apple',
                            token: credential.identityToken,
                        });
                        console.log(JSON.stringify({error, user}, null, 2));
                        if (!error) {
                            // user is signed in.
                        }
                    } else {
                        throw new Error('No identityToken.');
                    }
                } catch (e: any) {
                    if (e.code === 'ERR_REQUEST_CANCELED') {
                        // handle that the user canceled the sign-in flow
                    } else {
                        // handle other errors
                    }
                }
            }}
        />
    );
}
