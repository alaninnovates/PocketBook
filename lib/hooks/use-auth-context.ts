import {Session} from '@supabase/supabase-js'
import {createContext, useContext} from 'react'

export enum OnboardingStep {
    Welcome = 0,
    ProfileInfo = 1,
    JoinEnsemble = 2,
    Completed = 3,
}

export interface Profile {
    id: string;
    email: string;
    created_at: string;
    avatar_url: string;
    name: string;
    onboarding_step: OnboardingStep;
}

export type AuthData = {
    session?: Session | null
    profile?: Profile | null
    isLoading: boolean
    isLoggedIn: boolean
    updateOnboardingStep?: (newStep: OnboardingStep) => Promise<void>;
}

export const AuthContext = createContext<AuthData>({
    session: undefined,
    profile: undefined,
    isLoading: true,
    isLoggedIn: false,
    updateOnboardingStep: undefined,
})

export const useAuthContext = () => useContext(AuthContext)