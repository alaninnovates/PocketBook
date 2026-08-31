import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {Button, Text, useTheme} from "react-native-paper";
import {useShowData} from "@/lib/hooks/use-show-data";
import {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ScrollView, View} from "react-native";
import {colorToHex, getTextColorForBackground, instrumentToColor} from "@/components/field/color";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {useThemePreference} from "@/lib/hooks/use-theme-preference";

export default function SelectInstrumentModalScreen() {
    const {scheme} = useThemePreference();console.log('scheme ininst:', scheme);

    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {showData, loading} = useShowData(id as string);
    const {selectedInstrument, setSelectedInstrument, setDefaultInstrument} = useShowContext();

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
                <Stack.Screen options={{title: 'Select Instrument', orientation: 'all'}}/>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Loading...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{title: 'Select Instrument', orientation: 'all'}}/>
            <ScrollView style={{padding: 16}}
                        contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 12, padding: 16}}>
                {showData.getPerformers()
                    .sort((a, b) => a.performer.localeCompare(b.performer))
                    .map(({performer, label}) => {
                        const buttonColor = colorToHex(showData.getPerformerColor(performer)!, scheme === 'dark');
                        const textColor = getTextColorForBackground(buttonColor);
                        return (
                            <Button
                                key={performer}
                                onPress={() => {
                                    setSelectedInstrument(performer);
                                    setDefaultInstrument(performer);
                                    router.back();
                                }}
                                buttonColor={buttonColor}
                                textColor={textColor}
                            >
                                {label} {performer}
                            </Button>
                        )
                    })}
            </ScrollView>
        </>
    );
}