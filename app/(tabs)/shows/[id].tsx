import {useLocalSearchParams, useRouter} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {View} from "react-native";
import {IconButton, Text, TouchableRipple, useTheme} from "react-native-paper";
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
import * as ScreenOrientation from 'expo-screen-orientation';

export default function ShowScreen() {
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const {top, left, bottom, right} = useSafeAreaInsets();
    const {showData, loading} = useShowData(id as string);
    const [loadingInstrument, setLoadingInstrument] = useState(true);
    const {currentCount, setCurrentCount, selectedInstrument, setSelectedInstrument} = useShowContext();

    const [isPlaying, setIsPlaying] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const currentAnimationStepRef = useRef(currentCount);

    useEffect(() => {
        (async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        })();
        return () => {
            (async () => {
                await ScreenOrientation.unlockAsync();
            })();
        }
    }, []);

    useMemo(() => {
        currentAnimationStepRef.current = currentCount;
    }, [currentCount]);

    const dotsLength = useMemo(() => {
        if (!showData) return 0;
        return showData.getSets().length;
    }, [showData]);

    const animate = useCallback(
        (timestamp: number) => {
            if (!showData) return null;
            if (startTimeRef.current === null) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;

            const currentDot = coordinates[currentAnimationStepRef.current];
            const tempo = (showData.tempo_data?.[currentDot.movement]?.[currentDot.set]) ?? 120;
            const durationPerCount = 60000 / tempo;
            const totalDuration =
                currentAnimationStepRef.current < dotsLength - 1
                    ? coordinates[currentAnimationStepRef.current + 1].counts *
                    durationPerCount
                    : 0;

            if (totalDuration > 0) {
                const progress = Math.min(elapsed / totalDuration, 1);
                setAnimationProgress(progress);

                if (progress >= 1) {
                    const nextStep = currentAnimationStepRef.current + 1;
                    if (nextStep >= dotsLength) {
                        setIsPlaying(false);
                        setAnimationProgress(0);
                        animationFrameRef.current = null;
                        startTimeRef.current = null;
                        return;
                    }
                    setCurrentIndex(nextStep);
                    setAnimationProgress(0);
                    startTimeRef.current = null;
                }
            } else {
                const nextStep = currentAnimationStepRef.current + 1;
                if (nextStep >= dotsLength) {
                    setIsPlaying(false);
                    setAnimationProgress(0);
                    animationFrameRef.current = null;
                    startTimeRef.current = null;
                    return;
                }
                setCurrentIndex(nextStep);
                setAnimationProgress(0);
                startTimeRef.current = null;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [isPlaying, dotsLength, showData]
    );

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
        if (!showData || !selectedInstrument) return false;
        if (currentCount === 0) return false;
        const currentDot = showData.getCoordAtCount(currentCount, selectedInstrument);
        const previousIndex = showData.getSetIndexAtCount(currentCount)! - 1;
        const previousDot = showData.getCoordAtCount(showData.getCountAtSetIndex(previousIndex)!, selectedInstrument);
        return (
            currentDot.x === previousDot.x &&
            currentDot.y === previousDot.y
        );
    }, [showData, currentCount, selectedInstrument]);

    if (loading || !showData) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Loading...</Text>
        </View>
    }

    if (!selectedInstrument) {
        if (!loadingInstrument) router.push(`/(modals)/shows/${id}/select-instrument`);
        return null;
    }

    const coordinates = showData.getCoordsForPerformer(selectedInstrument);
    const sets = showData.getSets();
    const currentIndex = showData.getSetIndexAtCount(currentCount)!;
    const currentDot = fieldCoordinateToDot(coordinates[currentIndex].coord);

    const midset =
        currentIndex > 0 && !dotCoordinatesEqual(coordinates[currentIndex - 1].coord, coordinates[currentIndex].coord)
            ? fieldCoordinateToDot(
                calculateMidset(
                    coordinates[currentIndex - 1].coord,
                    coordinates[currentIndex].coord,
                ),
            )
            : null;

    const stepSize =
        currentIndex > 0 && !dotCoordinatesEqual(coordinates[currentIndex - 1].coord, coordinates[currentIndex].coord)
            ? calculateStepSize(
                coordinates[currentIndex - 1].coord,
                coordinates[currentIndex].coord,
                sets[currentIndex].counts,
            )
            : null;

    return (
        <View style={{width: '100%', height: '100%'}}>
            <FieldCanvas showData={showData}
                         animationProgress={animationProgress}
            />
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
                        {/*<Text variant="bodyLarge">*/}
                        {/*    Movement {coordinates[currentIndex].movement}*/}
                        {/*</Text>*/}
                        <Text variant="bodyLarge">
                            Page {sets[currentIndex].name}
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
                            Side {currentDot.side}:{' '}
                            {currentDot.sideToSide.stepOffset}{' '}
                            {currentDot.sideToSide.stepOffsetDirection}{' '}
                            {currentDot.sideToSide.yardline} yd ln
                        </Text>
                        <Text variant="bodyLarge">
                            {currentDot.frontToBack.stepOffset}{' '}
                            {currentDot.frontToBack.stepOffsetDirection}{' '}
                            {currentDot.frontToBack.line}
                        </Text>
                        <Text variant="bodyLarge">
                            {isHold ? 'Hold' : 'Move'}:{' '}
                            {sets[currentIndex].counts}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={{position: "absolute", right: right, top: '45%'}}>
                <IconButton
                    icon={isPlaying ? "pause" : "play"}
                    mode="contained"
                    size={32}
                    onPress={() => {
                        if (isPlaying) {
                            if (animationFrameRef.current) {
                                cancelAnimationFrame(animationFrameRef.current);
                                animationFrameRef.current = null;
                            }
                            setIsPlaying(false);
                            setAnimationProgress(0);
                            startTimeRef.current = null;
                            return;
                        }
                        setIsPlaying(true);
                        animationFrameRef.current =
                            requestAnimationFrame(animate);
                    }}
                />
                <IconButton
                    icon={"format-list-bulleted"}
                    mode="contained"
                    size={32}
                    onPress={() => router.push(`/(modals)/shows/${id}/select-set`)}
                />
            </View>
            <View style={{position: "absolute", bottom: bottom, left: left, flexDirection: 'row'}}>
                <IconButton
                    icon="close"
                    mode="contained"
                    size={32}
                    onPress={() => router.back()}
                />
            </View>
            <View style={{position: "absolute", bottom: bottom, right: right, flexDirection: 'row'}}>
                <IconButton
                    icon="arrow-left"
                    mode="contained"
                    size={32}
                    onPress={() => {
                        const newCount = Math.max(0, currentCount - sets[currentIndex].counts);
                        setCurrentCount(newCount);
                    }}
                />
                <IconButton
                    icon="arrow-right"
                    mode="contained"
                    size={32}
                    onPress={() => {
                        const newCount = currentCount + sets[currentIndex].counts;
                        setCurrentCount(newCount);
                    }}
                />
            </View>
        </View>
    );
}