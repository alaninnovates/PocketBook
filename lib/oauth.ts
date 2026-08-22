import * as WebBrowser from 'expo-web-browser'
import {Platform} from 'react-native'
import {supabase} from '@/lib/supabase'
import {expo} from '@/app.json'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithOAuth(provider: 'google' | 'discord' | 'apple') {
    if (Platform.OS === 'web') {
        // console.log(window.location.origin + window.location.pathname);
        // return;
        const {error} = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin + window.location.pathname,
                ...(provider === 'discord' ? {queryParams: {prompt: 'consent'}} : {}),
            },
        })
        if (error) throw error
        return
    }

    const redirectTo = `${expo.scheme}://${provider}-auth`
    const {data, error} = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
            ...(provider === 'discord' ? {queryParams: {prompt: 'consent'}} : {}),
            skipBrowserRedirect: true,
        },
    })
    if (error) throw error
    if (!data.url) throw new Error(`No OAuth URL returned for ${provider}`)

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {showInRecents: true})
    if (result.type !== 'success') return

    const code = new URL(result.url).searchParams.get('code')
    if (!code) throw new Error(`No code found in OAuth redirect URL for ${provider}`)

    const {error: exchangeError} = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) throw exchangeError
}
