import {AuthContext, OnboardingStep, Profile} from '@/lib/hooks/use-auth-context'
import {supabase} from '@/lib/supabase'
import type {Session} from '@supabase/supabase-js'
import {PropsWithChildren, useCallback, useEffect, useState} from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthProvider({children}: PropsWithChildren) {
    const [session, setSession] = useState<Session | undefined | null>()
    const [profile, setProfile] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true)

            const {
                data: {session},
                error,
            } = await supabase.auth.getSession()

            if (error) {
                console.error('Error fetching session:', error)
            }

            setSession(session)
            setIsLoading(false)
        }

        fetchSession()

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', {event: _event, session})
            setSession(session)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)

            if (session) {
                const {data, error} = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (error) {
                    console.error('Error fetching profile:', error)
                    if (error.message === 'TypeError: Network request failed') {
                        const storedProfile = await AsyncStorage.getItem('user_profile');
                        if (storedProfile) {
                            const profileData = JSON.parse(storedProfile);
                            setProfile(profileData);
                            setIsLoading(false);
                            return;
                        }
                    }
                }
                setProfile(data)
                await AsyncStorage.setItem('user_profile', JSON.stringify(data));
            } else {
                setProfile(null)
            }

            setIsLoading(false)
        }

        fetchProfile()
    }, [session])


    const updateOnboardingStep = useCallback(async (newStep: OnboardingStep) => {
        const {data, error} = await supabase
            .from('profiles')
            .update({onboarding_step: newStep})
            .eq('id', profile.id)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating onboarding step:', error);
        }

        if (data) {
            setProfile(data);
            await AsyncStorage.setItem('user_profile', JSON.stringify(data));
            console.log('Updated onboarding step to:', newStep, "(new profile data: ", data, ")");
        }
    }, [profile]);

    const updateProfileName = useCallback(async (firstName: string, lastName: string) => {
        const {data, error} = await supabase
            .from('profiles')
            .update({first_name: firstName, last_name: lastName})
            .eq('id', profile.id)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating profile name:', error);
        }

        if (data) {
            setProfile(data);
            await AsyncStorage.setItem('user_profile', JSON.stringify(data));
            console.log('Updated profile name to:', firstName, lastName, "(new profile data: ", data, ")");
        }
    }, [profile]);

    const signOut = useCallback(async () => {
        const {error} = await supabase.auth.signOut();
        await AsyncStorage.removeItem('user_profile');
        setProfile(null);
        if (error) {
            console.error('Error signing out:', error)
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                profile,
                isLoggedIn: session != undefined,
                updateOnboardingStep,
                updateProfileName,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}