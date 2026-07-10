import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useShowData} from "@/lib/hooks/use-show-data";
import {ScrollView, View} from "react-native";
import {DataTable, IconButton, Text, useTheme} from "react-native-paper";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {fieldCoordinateToDot} from "@/components/field/parser";

export default function SelectInstrumentModalScreen() {
    const theme = useTheme();
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {showData, loading} = useShowData(id as string, true);
    const {currentCount, setCurrentCount, selectedInstrument} = useShowContext();

    if (loading || !showData || !selectedInstrument) {
        return (
            <>
                <Stack.Screen options={{title: 'Select Set'}}/>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Loading...</Text>
                </View>
            </>
        );
    }

    const narrowerCell = {
        maxWidth: 80,
    }

    return (
        <>
            <Stack.Screen options={{
                title: 'Select Set', headerRight: () => (
                    <IconButton icon="close" onPress={() => router.back()} iconColor={theme.colors.onSurfaceVariant}/>
                )
            }}/>
            <ScrollView
                style={{padding: 16}}
                contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 12, padding: 16}}
            >
                <DataTable>
                    <DataTable.Header>
                        {/*<DataTable.Title style={narrowerCell}>Movement</DataTable.Title>*/}
                        <DataTable.Title style={narrowerCell}>Set</DataTable.Title>
                        <DataTable.Title style={narrowerCell}>Counts</DataTable.Title>
                        <DataTable.Title>Side to Side</DataTable.Title>
                        <DataTable.Title>Front to Back</DataTable.Title>
                    </DataTable.Header>

                    {showData.getCoordsForPerformer(selectedInstrument)
                        .map(({coord, set}) => {
                            const {side, sideToSide, frontToBack} = fieldCoordinateToDot(coord);
                            return (
                                <DataTable.Row
                                    key={set.name}
                                    onPress={() => {
                                        setCurrentCount(set.counts);
                                        router.back();
                                    }}
                                    style={(currentCount > set.counts) ?
                                        {backgroundColor: 'rgba(0, 0, 255, 0.1)'} : {}}
                                >
                                    {/*<DataTable.Cell style={narrowerCell}>{movement}</DataTable.Cell>*/}
                                    <DataTable.Cell style={narrowerCell}>{set.name}</DataTable.Cell>
                                    <DataTable.Cell style={narrowerCell}>{set.counts}</DataTable.Cell>
                                    <DataTable.Cell>
                                        Side {side}:{' '}
                                        {sideToSide.stepOffset}{' '}
                                        {sideToSide.stepOffsetDirection}{' '}
                                        {sideToSide.yardline} yd ln
                                    </DataTable.Cell>
                                    <DataTable.Cell>
                                        {frontToBack.stepOffset}{' '}
                                        {frontToBack.stepOffsetDirection}{' '}
                                        {frontToBack.line}
                                    </DataTable.Cell>
                                </DataTable.Row>
                            )
                        })}
                </DataTable>
            </ScrollView>
        </>
    );
}