import {View, ScrollView} from 'react-native';
import {Text, TextInput, List, Button, useTheme} from 'react-native-paper';
import {useState, useEffect} from "react";
import {supabase} from "@/lib/supabase";
import {useRouter} from "expo-router";

export default function ModalScreen() {
    const router = useRouter();
    const theme = useTheme();

    const [ensembleName, setEnsembleName] = useState('');
    const [code, setCode] = useState('');
    const [ensembleNameInFocus, setEnsembleNameInFocus] = useState(false);
    const [filteredEnsembles, setFilteredEnsembles] = useState<string[]>([]);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ensembleName.trim()) {
            setFilteredEnsembles([]);
            return;
        }

        const getData = async () => {
            const {data, error} = await supabase
                .from('ensembles')
                .select('name')
                .ilike('name', `%${ensembleName}%`)
                .limit(10);

            if (error) {
                console.error('err fetching ensembles:', error);
                setFilteredEnsembles([]);
            } else {
                setFilteredEnsembles(data ? data.map(ensemble => ensemble.name) : []);
            }
        };

        getData();
    }, [ensembleName]);

    const handleSelectEnsemble = (ensemble: string) => {
        setEnsembleName(ensemble);
    };

    return (
        <View style={{padding: 16, flex: 1}}>
            {error && (
                <Text style={{color: theme.colors.error, marginBottom: 16}}>{error}</Text>
            )}
            <View style={{marginTop: 16}}>
                <TextInput
                    label="Ensemble Name"
                    value={ensembleName}
                    onChangeText={setEnsembleName}
                    style={{width: '100%'}}
                    onFocus={() => setEnsembleNameInFocus(true)}
                    onBlur={() => setEnsembleNameInFocus(false)}
                />
                {ensembleName.length > 0 && filteredEnsembles.length > 0 && ensembleNameInFocus && (
                    <ScrollView
                        style={{
                            maxHeight: 200,
                            borderWidth: 1,
                            borderColor: '#e0e0e0',
                            borderTopWidth: 0,
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 4,
                        }}
                        scrollEnabled={filteredEnsembles.length > 4}
                    >
                        <List.Section>
                            {filteredEnsembles.map((ensemble, index) => (
                                <List.Item
                                    key={index}
                                    title={ensemble}
                                    onPress={() => handleSelectEnsemble(ensemble)}
                                />
                            ))}
                        </List.Section>
                    </ScrollView>
                )}
            </View>
            <TextInput
                label="Code"
                value={code}
                onChangeText={setCode}
                secureTextEntry
                style={{marginTop: 16, width: '100%'}}
            />
            <Button
                mode="contained"
                style={{marginTop: 24}}
                onPress={async () => {
                    setButtonLoading(true);
                    const {data, error} = await supabase
                        .rpc('attempt_join_ensemble', {
                            p_name: ensembleName,
                            p_code: code,
                        });
                    if (error) {
                        console.error('err requesting to join ensemble:', error);
                        setError(error.message);
                    }
                    if (data) {
                        console.log('successfully joined:', ensembleName);
                        router.back();
                    }
                    setButtonLoading(false);
                }}
                loading={buttonLoading}
                disabled={buttonLoading}
            >
                Request to Join
            </Button>
        </View>
    );
}
