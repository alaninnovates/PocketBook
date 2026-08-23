import {ScrollView, View} from "react-native";
import {Button, Dialog, Portal, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect, useRouter} from "expo-router";
import {EnsembleSwitcher} from "@/components/ensemble-switcher";
import {useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ShowData} from "@/lib/hooks/use-show-data";
import {clearShowViews} from "@/lib/hooks/use-show-views";
import {useNetInfo} from '@react-native-community/netinfo'

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
        newVersionAvailable?: boolean;
        sets?: number;
    }[]>([]);
    const [downloadingShowIds, setDownloadingShowIds] = useState<number[]>([]);
    const [updateingShowIds, setUpdatingShowIds] = useState<number[]>([]);
    const [storedInstrumentMap, setStoredInstrumentMap] = useState<{[showId: string]: string} | null>({});
    const [offlineDialogVisible, setOfflineDialogVisible] = useState(false);
    const {isConnected} = useNetInfo();

    const fetchShows = async () => {
        const {data, error} = await supabase
            .from('shows')
            .select('id, ensemble_id, name, created_at, updated_at')
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
            downloaded: await AsyncStorage.getItem(`show_${show.id}`) !== null,
            sets: await (async () => {
                const storedInstrument = await AsyncStorage.getItem(`show_${show.id}_selected_instrument`);
                if (storedInstrument) {
                    setStoredInstrumentMap((prev) => ({...prev, [show.id]: storedInstrument}));
                }
                const showDataString = await AsyncStorage.getItem(`show_${show.id}`);
                if (showDataString) {
                    const showData = new ShowData(JSON.parse(showDataString));
                    console.log(showData.getSets().length)
                    return showData.getSets().length;
                }
                return undefined;
            })(),
            newVersionAvailable: await (async () => {
                const showDataString = await AsyncStorage.getItem(`show_${show.id}`);
                if (showDataString) {
                    const showData = new ShowData(JSON.parse(showDataString));
                    if (showData.getUpdatedAt() < new Date(show.updated_at)) {
                        return true;
                    }
                }
                return false;
            })(),
        })) || []);
        setShows(showsData);
        await AsyncStorage.setItem(`shows_ensemble_${selectedEnsemble}`, JSON.stringify(showsData));
    }

    useFocusEffect(() => {
        console.log('SELECTED ENSEMBLE CHANGED:', selectedEnsemble);
        if (!selectedEnsemble) {
            setShows([]);
            return;
        }
        fetchShows();
    });

    return (
        <SafeAreaView style={{padding: 16, flex: 1}}>
            <EnsembleSwitcher selectedEnsemble={selectedEnsemble} setSelectedEnsemble={setSelectedEnsemble}/>
            <ScrollView
                style={{flex: 1}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{gap: 16, paddingBottom: 16}}
            >
                {shows.length === 0 && (
                    <Text variant="bodyMedium" style={{marginTop: 32, textAlign: 'center'}}>No shows available for this
                        ensemble.</Text>
                )}
                {shows.map((show) => (
                    <View key={show.id}
                          style={{padding: 16, backgroundColor: theme.colors.surface, borderRadius: theme.roundness}}>
                        <View style={{
                            display: "flex",
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: 8,
                        }}>
                            <View style={{maxWidth: '80%'}}>
                                <Text variant="headlineMedium" style={{marginBottom: 8}}>{show.name}</Text>
                                <Text>Date: {new Date(show.created_at).toDateString()}</Text>
                                <Text>Sets: {show.sets !== undefined ? show.sets : '-'}</Text>
                            </View>
                            {storedInstrumentMap && storedInstrumentMap[show.id] && (
                                <Button
                                    mode="elevated"
                                    onPress={() => {
                                        router.push(`/(modals)/shows/${show.id}/select-instrument`);
                                    }}
                                >
                                    {storedInstrumentMap[show.id]}
                                </Button>
                            )}
                        </View>
                        <View style={{display: 'flex', flexDirection: 'row', marginTop: 8, gap: 8, width: '100%'}}>
                            <Button mode="contained" style={{flex: 1}}
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
                                    loading={downloadingShowIds.includes(show.id) || updateingShowIds.includes(show.id)}
                                    disabled={downloadingShowIds.includes(show.id) || updateingShowIds.includes(show.id)}
                            >
                                {show.downloaded ? 'Open' : 'Download'}
                            </Button>
                            {show.newVersionAvailable && (
                                <Button mode="outlined"
                                        onPress={async () => {
                                            if (!isConnected) {
                                                setOfflineDialogVisible(true);
                                                return;
                                            }
                                            setUpdatingShowIds((prev) => [...prev, show.id]);
                                            const {data, error} = await supabase
                                                .from('shows')
                                                .select('*')
                                                .eq('id', show.id)
                                                .single();

                                            if (error) {
                                                console.error('err fetching show data:', error);
                                            } else {
                                                await AsyncStorage.setItem(`show_${show.id}`, JSON.stringify(data));
                                                await clearShowViews(show.id);
                                                const newShows = shows.map((s) => {
                                                    if (s.id === show.id) {
                                                        return {...s, newVersionAvailable: false};
                                                    }
                                                    return s;
                                                });
                                                setShows(newShows);
                                                if (selectedEnsemble) {
                                                    await AsyncStorage.setItem(`shows_ensemble_${selectedEnsemble}`, JSON.stringify(newShows));
                                                }
                                            }
                                            setUpdatingShowIds((prev) => prev.filter((id) => id !== show.id));
                                        }}
                                        loading={updateingShowIds.includes(show.id)}
                                        disabled={updateingShowIds.includes(show.id)}
                                >
                                    Update
                                </Button>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
            <Portal>
                <Dialog visible={offlineDialogVisible} onDismiss={() => setOfflineDialogVisible(false)}>
                    <Dialog.Title>
                        Offline
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            You are currently offline. Please connect to the internet to update the show.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={async () => {
                            setOfflineDialogVisible(false);
                        }}>
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}
