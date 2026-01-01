import {ScrollView, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {EnsembleSwitcher} from "@/components/ensemble-switcher";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ShowsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [selectedEnsemble, setSelectedEnsemble] = useState<number | null>(null);
    const [shows, setShows] = useState<{
        id: number;
        ensemble_id: number;
        name: string;
        created_at: string;
        // not database property, added later
        downloaded: boolean;
    }[]>([]);
    const [downloadingShowIds, setDownloadingShowIds] = useState<number[]>([]);

    useEffect(() => {
        console.log('SELECTED ENSEMBLE CHANGED:', selectedEnsemble);
        if (!selectedEnsemble) {
            setShows([]);
            return;
        }
        const fetchShows = async () => {
            const {data, error} = await supabase
                .from('shows')
                .select('id, ensemble_id, name, created_at')
                .eq('ensemble_id', selectedEnsemble)
                .order('created_at', {ascending: false});
            if (error) {
                console.error('err fetching shows:', error);
                if (error.message === 'TypeError: Network request failed') {
                    const storedShows = await AsyncStorage.getItem(`shows_ensemble_${selectedEnsemble}`);
                    if (storedShows) {
                        const showsData = JSON.parse(storedShows);
                        console.log('SETTING SHOWS DATA', selectedEnsemble, showsData);
                        setShows(showsData);
                    }
                }
                return;
            }
            console.log('fetched shows:', data);
            const showsData = await Promise.all(data?.map(async show => ({
                ...show,
                downloaded: await AsyncStorage.getItem(`show_${show.id}`) !== null
            })) || []);
            setShows(showsData);
            await AsyncStorage.setItem(`shows_ensemble_${selectedEnsemble}`, JSON.stringify(showsData));
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
                                onPress={async () => {
                                    if (show.downloaded) {
                                        router.push(`/shows/${show.id}`)
                                    } else {
                                        setDownloadingShowIds((prev) => [...prev, show.id]);
                                        const {data, error} = await supabase
                                            .from('shows')
                                            .select('*')
                                            .eq('id', show.id)
                                            .single();

                                        if (error) {
                                            console.error('err fetching show data:', error);
                                        } else {
                                            await AsyncStorage.setItem(`show_${show.id}`, JSON.stringify(data));
                                            const newShows = shows.map((s) => {
                                                if (s.id === show.id) {
                                                    return {...s, downloaded: true};
                                                }
                                                return s;
                                            });
                                            setShows(newShows);
                                            if (selectedEnsemble) {
                                                await AsyncStorage.setItem(`shows_ensemble_${selectedEnsemble}`, JSON.stringify(newShows));
                                            }
                                        }
                                        setDownloadingShowIds((prev) => prev.filter((id) => id !== show.id));
                                    }
                                }}
                                buttonColor={show.downloaded ? theme.colors.primary : theme.colors.secondary}
                                loading={downloadingShowIds.includes(show.id)}
                                disabled={downloadingShowIds.includes(show.id)}
                        >
                            {show.downloaded ? 'Open' : 'Download'}
                        </Button>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}