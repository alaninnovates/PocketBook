import {useState} from "react";
import {useFocusEffect} from "expo-router";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useAuthContext} from "@/lib/hooks/use-auth-context";

export const useEnsembles = () => {
    const {profile} = useAuthContext();

    const [ensembles, setEnsembles] = useState<{
        ensembles: { id: number; name: string };
        role: 'awaiting_approval' | 'member' | 'admin';
        requested_at: string;
        approved_at: string
    }[]>([]);

    useFocusEffect(() => {
        if (!profile) return;
        const fetchEnsembles = async () => {
            const {data, error} = await supabase
                .from('ensemble_memberships')
                .select('ensembles(id,name), role, requested_at, approved_at')
                .neq('role', 'awaiting_approval')
                .eq('user_id', profile.id);

            console.log(data);
            if (error) {
                console.error('err fetching user ensembles:', error.message);
                if (error.message === 'TypeError: Network request failed') {
                    const storedEnsembles = await AsyncStorage.getItem('user_ensembles');
                    if (storedEnsembles) {
                        const ensemblesData = JSON.parse(storedEnsembles);
                        setEnsembles(ensemblesData);
                    }
                }
            } else {
                const ensemblesData = data?.map(item => item) || [];
                ensemblesData?.sort((a, b) => {
                    if (a.role === 'awaiting_approval' && b.role !== 'awaiting_approval') {
                        return -1;
                    }
                    if (a.role !== 'awaiting_approval' && b.role === 'awaiting_approval') {
                        return 1;
                    }
                    return new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime();
                });
                setEnsembles(ensemblesData);
                await AsyncStorage.setItem('user_ensembles', JSON.stringify(ensemblesData));
            }
        }
        fetchEnsembles();
    });

    return {ensembles, setEnsembles};
}