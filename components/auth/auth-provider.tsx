import {AuthContext} from '@/lib/hooks/use-auth-context'
import {supabase} from '@/lib/supabase'
import type {Session} from '@supabase/supabase-js'
import {PropsWithChildren, useEffect, useState} from 'react'
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

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                profile,
                isLoggedIn: session != undefined,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}