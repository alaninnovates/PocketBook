import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'
import {AppState, Platform} from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

const isSSR = typeof window === 'undefined';

const safeStorageAdapter = {
    getItem: async (key: string) => {
        if (isSSR) return null;
        return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (isSSR) return;
        return AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (isSSR) return;
        return AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: Platform.OS === 'web' ? safeStorageAdapter : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,

        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
    },
})

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})
