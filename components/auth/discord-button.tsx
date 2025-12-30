import {supabase} from '@/lib/supabase';
import {useEffect} from 'react';

import {expo} from '@/app.json';
import * as WebBrowser from "expo-web-browser";
import {IconButton} from "react-native-paper";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

WebBrowser.maybeCompleteAuthSession();

export function DiscordButton() {

    function extractParamsFromUrl(url: string) {
        const parsedUrl = new URL(url);
        const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
        const params = new URLSearchParams(hash);

        return {
            access_token: params.get("access_token"),
            expires_in: parseInt(params.get("expires_in") || "0"),
            refresh_token: params.get("refresh_token"),
            token_type: params.get("token_type"),
            provider_token: params.get("provider_token"),
            code: params.get("code"),
        };
    };

    async function onSignInButtonPress() {
        console.debug('onSignInButtonPress - start');
        const res = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: `${expo.scheme}://discord-auth`,
                queryParams: {prompt: "consent"},
                skipBrowserRedirect: true,
            },
        });

        const discordOAuthUrl = res.data.url;

        if (!discordOAuthUrl) {
            console.error("no oauth url found!");
            return;
        }

        const result = await WebBrowser.openAuthSessionAsync(
            discordOAuthUrl,
            `${expo.scheme}://discord-auth`,
            {showInRecents: true},
        ).catch((err) => {
            console.error('onSignInButtonPress - openAuthSessionAsync - error', {err});
            console.log(err);
        });

        console.debug('onSignInButtonPress - openAuthSessionAsync - result', {result});

        if (result && result.type === "success") {
            console.debug('onSignInButtonPress - openAuthSessionAsync - success');
            const params = extractParamsFromUrl(result.url);
            console.debug('onSignInButtonPress - openAuthSessionAsync - success', {params});

            if (params.access_token && params.refresh_token) {
                console.debug('onSignInButtonPress - setSession');
                const {data, error} = await supabase.auth.setSession({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                });
                console.debug('onSignInButtonPress - setSession - success', {data, error});
                return;
            } else {
                console.error('onSignInButtonPress - setSession - failed');
                // sign in/up failed
            }
        } else {
            console.error('onSignInButtonPress - openAuthSessionAsync - failed');
        }
    }

    // to warm up the browser
    useEffect(() => {
        WebBrowser.warmUpAsync();

        return () => {
            WebBrowser.coolDownAsync();
        };
    }, []);

    return (
        <IconButton
            mode="contained"
            icon={({size, color}) => (
                <FontAwesome6
                    name="discord"
                    size={size}
                    color={color}
                />
            )}
            size={32}
            onPress={onSignInButtonPress}
        />
    );
}