import {ScrollView, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {EnsembleSwitcher} from "@/components/ensemble-switcher";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";

export default function ShowsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [selectedEnsemble, setSelectedEnsemble] = useState<number | null>(null);
    const [shows, setShows] = useState<{
        id: number;
        ensemble_id: number;
        name: string;
        tempo_data: {};
        dot_data: {};
        created_at: string;
    }[]>([]);

    useEffect(() => {
        console.log('SELECTED ENSEMBLE CHANGED:', selectedEnsemble);
        if (!selectedEnsemble) {
            setShows([]);
            return;
        }
        const fetchShows = async () => {
            const {data, error} = await supabase
                .from('shows')
                .select('*')
                .eq('ensemble_id', selectedEnsemble)
                .order('created_at', {ascending: false});
            console.log('fetched shows:', data);
            setShows(data || []);
        }
        fetchShows();
    }, [selectedEnsemble]);

    return (
        <SafeAreaView style={{padding: 16}}>
            {/*<Text variant="headlineLarge" style={{marginBottom: 16}}>Shows</Text>*/}
            <EnsembleSwitcher selectedEnsemble={selectedEnsemble} setSelectedEnsemble={setSelectedEnsemble}/>
            <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 16, height: '100%'}}>
                {shows.length === 0 && (
                    <Text variant="bodyMedium" style={{marginTop: 32, textAlign: 'center'}}>No shows available for this
                        ensemble.</Text>
                )}
                {shows.map((show) => (
                    <View key={show.id}
                          style={{padding: 16, backgroundColor: theme.colors.surface, borderRadius: theme.roundness}}>
                        <Text variant="headlineMedium" style={{marginBottom: 8}}>{show.name}</Text>
                        <Text>Date: {new Date(show.created_at).toDateString()}</Text>
                        <Text>Pages: -</Text>
                        <Button mode="contained" style={{marginTop: 8}}
                                onPress={() => router.push(`/shows/${show.id}`)}
                                buttonColor={show.downloaded ? theme.colors.primary : theme.colors.secondary}
                        >
                            {show.downloaded ? 'Open' : 'Download'}
                        </Button>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}