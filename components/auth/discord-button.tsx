import {signInWithOAuth} from '@/lib/oauth';
import {useEffect} from 'react';
import {Platform} from 'react-native';

import * as WebBrowser from "expo-web-browser";
import {IconButton} from "react-native-paper";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export function DiscordButton() {

    async function onSignInButtonPress() {
        try {
            await signInWithOAuth('discord');
        } catch (error) {
            console.error('Discord sign-in failed:', error);
        }
    }

    // to warm up the browser (native only; not available on web)
    useEffect(() => {
        if (Platform.OS === 'web') return;

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
