import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {Button, Text} from "react-native-paper";
import {useShowData} from "@/lib/hooks/use-show-data";
import {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ScrollView, View} from "react-native";
import {instrumentToColor} from "@/components/field/color";
import {useShowContext} from "@/lib/hooks/use-show-context";

export default function SelectInstrumentModalScreen() {
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {showData, loading} = useShowData(id);
    const {selectedInstrument, setSelectedInstrument} = useShowContext();

    useEffect(() => {
        const storeSelectedInstrument = async () => {
            if (selectedInstrument) {
                await AsyncStorage.setItem(`show_${id}_selected_instrument`, selectedInstrument);
            }
        }
        storeSelectedInstrument();
    }, [selectedInstrument, id]);

    if (loading || !showData) {
        return (
            <>
                <Stack.Screen options={{title: 'Select Instrument'}}/>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Loading...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{title: 'Select Instrument'}}/>
            <ScrollView style={{padding: 16}} contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 12, padding: 16}}>
                {Object.values(showData.dot_data)
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map(({ performer, label }) => (
                        <Button
                            key={label}
                            onPress={() => {
                                setSelectedInstrument(label);
                                router.back();
                            }}
                            buttonColor={instrumentToColor(performer)}
                        >
                            {performer} {label}
                        </Button>
                    ))}
            </ScrollView>
        </>
    );
}