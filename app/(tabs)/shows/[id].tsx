import {useLocalSearchParams, useRouter} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useEffect, useMemo, useState} from "react";
import {View} from "react-native";
import {IconButton, Text, useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
    calculateMidset,
    calculateStepSize,
    dotCoordinatesEqual,
    dotToFieldCoordinateSteps,
    fieldCoordinateToDot
} from "@/components/field/parser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useShowData} from "@/lib/hooks/use-show-data";
import {useShowContext} from "@/lib/hooks/use-show-context";

export default function ShowScreen() {
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const [zoom, setZoom] = useState(0);
    const {top, left, bottom, right} = useSafeAreaInsets();
    const {showData, loading} = useShowData(id);
    const [loadingInstrument, setLoadingInstrument] = useState(true);
    const {currentIndex, setCurrentIndex, selectedInstrument, setSelectedInstrument} = useShowContext();

    useEffect(() => {
        const fetchSelectedInstrument = async () => {
            const storedInstrument = await AsyncStorage.getItem(`show_${id}_selected_instrument`);
            if (storedInstrument) {
                console.log('fetched stored instrument:', storedInstrument);
                setSelectedInstrument(storedInstrument);
            }
            setLoadingInstrument(false);
        }
        fetchSelectedInstrument();
    }, [id]);

    const isHold = useMemo(() => {
        if (!dots) return false;
        if (dots.length === 0) return false;
        if (currentIndex === 0) return false;
        const currentDot = dots[currentIndex];
        const previousDot = dots[currentIndex - 1];
        return (
            currentDot.sideToSide.stepOffset ===
            previousDot.sideToSide.stepOffset &&
            currentDot.sideToSide.stepOffsetDirection ===
            previousDot.sideToSide.stepOffsetDirection &&
            currentDot.sideToSide.yardline ===
            previousDot.sideToSide.yardline &&
            currentDot.frontToBack.stepOffset ===
            previousDot.frontToBack.stepOffset &&
            currentDot.frontToBack.stepOffsetDirection ===
            previousDot.frontToBack.stepOffsetDirection &&
            currentDot.frontToBack.line === previousDot.frontToBack.line
        );
    }, [currentIndex]);

    if (loading || !showData) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Loading...</Text>
        </View>
    }

    if (!selectedInstrument) {
        if (!loadingInstrument) router.push(`/(modals)/shows/${id}/select-instrument`);
        return null;
    }

    const dots = showData.dot_data[selectedInstrument].dots;

    const midset =
        currentIndex > 0 && !dotCoordinatesEqual(dots[currentIndex - 1], dots[currentIndex])
            ? fieldCoordinateToDot(
                calculateMidset(
                    dotToFieldCoordinateSteps(dots[currentIndex - 1]),
                    dotToFieldCoordinateSteps(dots[currentIndex]),
                ),
            )
            : null;

    const stepSize =
        currentIndex > 0 && !dotCoordinatesEqual(dots[currentIndex - 1], dots[currentIndex])
            ? calculateStepSize(
                dots[currentIndex - 1],
                dots[currentIndex],
                dots[currentIndex].counts,
            )
            : null;

    return (
        <View style={{width: '100%', height: '100%'}}>
            <ReactNativeZoomableView
                maxZoom={6}
                minZoom={0}
                initialZoom={0.4}
                bindToBorders={false}
                onTransform={(event) => {
                    setZoom(event.zoomLevel);
                }}
            >
                <FieldCanvas zoom={zoom} dotData={showData.dot_data} tempoData={showData.tempo_data}
                             currentIndex={currentIndex}
                             performer={selectedInstrument}
                />
            </ReactNativeZoomableView>
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: theme.colors.surfaceVariant,
                    width: '100%',
                    padding: 8
                }}>
                <View style={{
                    paddingTop: top,
                    paddingLeft: left,
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '90%'
                }}>
                    <View>
                        <Text variant="bodyLarge">
                            Movement {dots[currentIndex].movement}
                        </Text>
                        <Text variant="bodyLarge">
                            Page {dots[currentIndex].set}
                        </Text>
                    </View>
                    <View>
                        <Text variant="bodyLarge">
                            Step Size
                        </Text>
                        <Text variant="bodyLarge">
                            {stepSize ? `${stepSize} to 5` : '-'}
                        </Text>
                    </View>
                    <View>
                        <Text variant="bodyLarge">
                            Midset
                        </Text>
                        {midset ? (
                            <>
                                <Text variant="bodyLarge">
                                    Side {midset.side}:{' '}
                                    {midset.sideToSide.stepOffset}{' '}
                                    {midset.sideToSide.stepOffsetDirection}{' '}
                                    {midset.sideToSide.yardline} yd ln
                                </Text>
                                <Text variant="bodyLarge">
                                    {midset.frontToBack.stepOffset}{' '}
                                    {midset.frontToBack.stepOffsetDirection}{' '}
                                    {midset.frontToBack.line}
                                </Text>
                            </>
                        ) : (
                            <Text variant="bodyLarge">-</Text>
                        )}
                    </View>
                    <View>
                        <Text variant="bodyLarge">
                            Side {dots[currentIndex].side}:{' '}
                            {dots[currentIndex].sideToSide.stepOffset}{' '}
                            {dots[currentIndex].sideToSide.stepOffsetDirection}{' '}
                            {dots[currentIndex].sideToSide.yardline} yd ln
                        </Text>
                        <Text variant="bodyLarge">
                            {dots[currentIndex].frontToBack.stepOffset}{' '}
                            {dots[currentIndex].frontToBack.stepOffsetDirection}{' '}
                            {dots[currentIndex].frontToBack.line}
                        </Text>
                        <Text variant="bodyLarge">
                            {isHold ? 'Hold' : 'Move'}:{' '}
                            {dots[currentIndex].counts}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={{position: "absolute", bottom: bottom, right: right, flexDirection: 'row'}}>
                <IconButton
                    icon="arrow-left"
                    mode="contained"
                    size={32}
                    onPress={() => {
                        setCurrentIndex((prev) => Math.max(prev - 1, 0));
                    }}
                />
                <IconButton
                    icon="arrow-right"
                    mode="contained"
                    size={32}
                    onPress={() => {
                        setCurrentIndex((prev) => prev + 1);
                    }}
                />
            </View>
        </View>
    );
}