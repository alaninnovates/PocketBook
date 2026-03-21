import {Session} from '@supabase/supabase-js'
import {createContext, useContext} from 'react'

export interface Profile {
    id: string;
    email: string;
    created_at: string;
    avatar_url: string;
    name: string;
    onboarding_step: number;
}

export type AuthData = {
    session?: Session | null
    profile?: Profile | null
    isLoading: boolean
    isLoggedIn: boolean
}

export const AuthContext = createContext<AuthData>({
    session: undefined,
    profile: undefined,
    isLoading: true,
    isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)