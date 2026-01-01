import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {DotData, TempoData} from "@/lib/types";

export const useShowData = (id) => {
    const router = useRouter();
    const [showData, setShowData] = useState<{
        id: string;
        name: string;
        dot_data: DotData;
        tempo_data: TempoData;
        created_at: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShowData = async () => {
            const {data, error} = await supabase
                .from('shows')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('err fetching show data:', error);
                if (error.message === 'TypeError: Network request failed') {
                    const storedShow = await AsyncStorage.getItem(`show_${id}`);
                    if (storedShow) {
                        const showData = JSON.parse(storedShow);
                        setShowData(showData);
                    } else {
                        router.push('/shows');
                    }
                }
            } else {
                setShowData(data);
            }
            setLoading(false);
        }
        fetchShowData();
    }, [id]);

    return {showData, loading};
}