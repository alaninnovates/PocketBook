import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {supabase} from "@/lib/supabase";
import {useState} from "react";
import Dropdown from "@/components/dropdown";
import {useFocusEffect} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function EnsembleSwitcher({selectedEnsemble, setSelectedEnsemble}: {
    selectedEnsemble: number | null;
    setSelectedEnsemble: (id: number | null) => void;
}) {
    const {profile} = useAuthContext();
    const [ensembles, setEnsembles] = useState<{
        id: number; name: string;
    }[]>([]);

    useFocusEffect(() => {
        if (!profile) return;
        const fetchEnsembles = async () => {
            const {data, error} = await supabase
                .from('ensemble_memberships')
                .select('ensembles(id,name)')
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
                const ensemblesData = data?.map(item => item.ensembles) || [];
                setEnsembles(ensemblesData);
                await AsyncStorage.setItem('user_ensembles', JSON.stringify(ensemblesData));
                if (ensemblesData.length > 0 && !selectedEnsemble) {
                    setSelectedEnsemble(ensemblesData[0].id);
                }
            }
        }
        fetchEnsembles();
    });

    return (
        <Dropdown
            onChange={(value) => {
                setSelectedEnsemble(value ? parseInt(value) : null);
            }}
            placeholder="Select Ensemble"
            value={selectedEnsemble ? selectedEnsemble.toString() : undefined}
            valueText={ensembles.find(e => e.id === selectedEnsemble)?.name}
        >
            {ensembles.map(({id, name}) => (
                <Dropdown.Item key={id} title={name} value={id.toString()}/>
            ))}
        </Dropdown>
    )
}