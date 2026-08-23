import {useLocalSearchParams, useRouter} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Platform, View} from "react-native";
import {IconButton, Text, useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
    calculateMidset,
    calculateStepSize,
    dotCoordinatesEqual,
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
    const [headerWidth, setHeaderWidth] = useState(0);
    const [pageColWidth, setPageColWidth] = useState(0);
    const [dotColWidth, setDotColWidth] = useState(0);
    const [stepColWidth, setStepColWidth] = useState(0);
    const [midsetColWidth, setMidsetColWidth] = useState(0);

    const showStepAndMidset =
        headerWidth === 0 ||
        headerWidth >= pageColWidth + dotColWidth + stepColWidth + midsetColWidth + 32;
    const {showData, loading} = useShowData(id as string);
    const [loadingInstrument, setLoadingInstrument] = useState(true);
    const {
        currentCount,
        setCurrentCount,
        selectedInstrument,
        setSelectedInstrument,
        setDefaultInstrument
    } = useShowContext();

    const [isPlaying, setIsPlaying] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startCountTimeInShowRef = useRef<number | null>(null);
    const currentCountRef = useRef(currentCount);

    useEffect(() => {
        currentCountRef.current = currentCount;
    }, [currentCount]);

    useEffect(() => {
        console.log('currnet count is:', currentCount, 'current index is:', showData?.getSetIndexAtCount(currentCount));
    }, [currentCount]);

    useEffect(() => {
        if (Platform.OS === "web") return;
        (async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        })();
        return () => {
            (async () => {
                await ScreenOrientation.unlockAsync();
            })();
        }
    }, []);

    const animate = useCallback(
        (timestamp: number) => {
            if (!showData) return null;
            if (startTimeRef.current === null) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            if (startCountTimeInShowRef.current === null) {
                startCountTimeInShowRef.current = showData.getTimeForCount(currentCountRef.current);
            }

            const currentCountTimestamp = showData.getTimeForCount(currentCountRef.current) - startCountTimeInShowRef.current;
            const nextCountTimestamp = showData.getTimeForCount(currentCountRef.current + 1) - startCountTimeInShowRef.current;

            const progress = (elapsed / 1000 - currentCountTimestamp) / (nextCountTimestamp - currentCountTimestamp);
            setAnimationProgress(progress);
            // console.log('elapsed:', elapsed/1000, 'currentCount:', currentCountRef.current, 'progress:', progress);


            if (progress >= 1) {
                // increment count
                const nextCount = currentCountRef.current + 1;
                // console.log('incrementing count from', currentCountRef.current, 'to', nextCount);
                // console.log('nextCount:', nextCount, 'totalCounts:', showData.getTotalCounts());
                if (nextCount >= showData.getTotalCounts()) {
                    setIsPlaying(false);
                    setAnimationProgress(0);
                    animationFrameRef.current = null;
                    startTimeRef.current = null;
                    startCountTimeInShowRef.current = null;
                    return;
                }
                // update the ref synchronously so the next frame sees the new
                // count even before React re-renders
                currentCountRef.current = nextCount;
                setCurrentCount(nextCount);
                setAnimationProgress(0);
                // startTimeRef.current = null;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [showData, setCurrentCount]
    );

    useEffect(() => {
        const fetchSelectedInstrument = async () => {
            const storedInstrument = await AsyncStorage.getItem(`show_${id}_selected_instrument`);
            if (storedInstrument) {
                console.log('fetched stored instrument:', storedInstrument);
                setSelectedInstrument(storedInstrument);
                setDefaultInstrument(storedInstrument);
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
        if (previousIndex < 0) return false;
        const si = showData.getCountAtSetIndex(previousIndex)!;
        console.log("previous index:", previousIndex, "si:", si, "current count:", currentCount);
        const previousDot = showData.getCoordAtCount(si, selectedInstrument);
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
    // console.log('set index:', currentIndex, 'current count:', currentCount, 'current dot:', currentDot);

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
                sets[currentIndex].count - sets[currentIndex - 1].count
            )
            : null;

    return (
        <View style={{width: '100%', height: '100%', backgroundColor: theme.colors.background}}>
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
                }}
                      onLayout={(e) => {
                          setHeaderWidth(e.nativeEvent.layout.width)
                      }}>
                    <View onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        setPageColWidth((prev) => Math.max(prev, width))
                    }}>
                        <Text variant="bodyLarge">
                            Page {sets[currentIndex].name}
                        </Text>
                        <Text variant="bodyLarge">
                            Count {currentCount - (sets[currentIndex - 1]?.count || 0)} of {sets[currentIndex].count - (currentIndex > 0 ? sets[currentIndex - 1].count : 0)}
                        </Text>
                    </View>
                    {showStepAndMidset &&
                      <View onLayout={(e) => {
                          const width = e.nativeEvent.layout.width;
                          setStepColWidth((prev) => Math.max(prev, width))
                      }}>
                        <Text variant="bodyLarge">
                          Step Size
                        </Text>
                        <Text variant="bodyLarge">
                            {stepSize ? `${stepSize} to 5` : '-'}
                        </Text>
                      </View>}
                    {showStepAndMidset &&
                      <View onLayout={(e) => {
                          const width = e.nativeEvent.layout.width;
                          setMidsetColWidth((prev) => Math.max(prev, width))
                      }}>
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
                      </View>}
                    <View onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        setDotColWidth((prev) => Math.max(prev, width))
                    }}>
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
                            {currentIndex === 0 ? sets[currentIndex].count :
                                sets[currentIndex].count - sets[currentIndex - 1].count}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={{position: "absolute", right: right, top: '35%'}}>
                <IconButton
                    icon={"eye"}
                    mode="contained"
                    size={32}
                    onPress={() => router.push(`/(modals)/shows/${id}/configure-view`)}
                />
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
                            startCountTimeInShowRef.current = null;
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
                        if (currentIndex === 0) return;
                        setCurrentCount(sets[currentIndex - 1].count);
                    }}
                />
                <IconButton
                    icon="arrow-right"
                    mode="contained"
                    size={32}
                    onPress={() => {
                        if (currentIndex === sets.length - 1) return;
                        const newCount = sets[currentIndex + 1].count;
                        setCurrentCount(newCount);
                    }}
                />
            </View>
        </View>
    );
}