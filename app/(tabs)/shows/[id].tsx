import {useLocalSearchParams, useRouter} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Platform, View} from "react-native";
import {useAudioPlayer, useAudioPlayerStatus} from "expo-audio";
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
import {getShowAudioFile} from "@/lib/show-audio";
import {PerformerInfo} from "@/lib/hooks/use-show-views";
import {PerformerPopup} from "@/components/field/performer-popup";

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
    const [popupPerformer, setPopupPerformer] = useState<PerformerInfo | null>(null);
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const playStartCountRef = useRef<number | null>(null);
    const playStartShowTimeRef = useRef<number | null>(null);
    const currentCountRef = useRef(currentCount);

    const audioSource = useMemo(() => {
        if (Platform.OS === "web") return null;
        const audioFile = getShowAudioFile(id as string);
        return audioFile.exists ? {uri: audioFile.uri} : null;
    }, [id]);
    const hasAudio = audioSource !== null;
    const player = useAudioPlayer(audioSource, {updateInterval: 100});
    const playerStatus = useAudioPlayerStatus(player);

    const audioClockRef = useRef({time: 0, wall: 0, playing: false});
    useEffect(() => {
        audioClockRef.current = {
            time: playerStatus.currentTime,
            wall: Date.now(),
            playing: playerStatus.playing,
        };
    }, [playerStatus.currentTime, playerStatus.playing]);

    const isPlayingRef = useRef(isPlaying);
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        currentCountRef.current = currentCount;
    }, [currentCount]);

    useEffect(() => {
        console.log('currnet count is:', currentCount, 'current index is:', showData?.getSetIndexAtCount(currentCount));
    }, [currentCount]);

    const stopPlayback = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (hasAudio) player.pause();
        setIsPlaying(false);
        setAnimationProgress(0);
        startTimeRef.current = null;
        playStartCountRef.current = null;
        playStartShowTimeRef.current = null;
    }, [hasAudio, player]);

    const animate = useCallback(
        (timestamp: number) => {
            if (!showData) return null;
            if (startTimeRef.current === null) startTimeRef.current = timestamp;
            if (playStartCountRef.current === null) playStartCountRef.current = currentCountRef.current;
            if (playStartShowTimeRef.current === null) {
                playStartShowTimeRef.current = showData.getTimeForCount(playStartCountRef.current);
            }

            let showTime: number;
            if (hasAudio) {
                const clock = audioClockRef.current;
                showTime = clock.playing ? clock.time + (Date.now() - clock.wall) / 1000 : clock.time;
            } else {
                showTime = playStartShowTimeRef.current + (timestamp - startTimeRef.current) / 1000;
            }

            const count = showData.getCurrentCountForTime(playStartCountRef.current, showTime - playStartShowTimeRef.current);
            const countTime = showData.getTimeForCount(count-1);
            const nextCountTime = showData.getTimeForCount(count);
            const progress = (showTime - countTime) / (nextCountTime - countTime);
            // console.log('progress:', progress, 'count:', count, 'showTime:', showTime, 'countTime:', countTime, 'nextCountTime:', nextCountTime);

            const lastCountTime = showData.getTimeForCount(showData.getTotalCounts() - 1);
            if (showTime >= lastCountTime) {
                const lastCount = showData.getTotalCounts() - 1;
                if (currentCountRef.current !== lastCount) {
                    currentCountRef.current = lastCount;
                    setCurrentCount(lastCount);
                }
                stopPlayback();
                return;
            }

            if (count !== currentCountRef.current) {
                currentCountRef.current = count;
                setCurrentCount(count);
            }
            setAnimationProgress(progress);

            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [showData, hasAudio, setCurrentCount, stopPlayback]
    );

    const startPlayback = useCallback(() => {
        if (!showData) return;
        playStartCountRef.current = currentCountRef.current;
        playStartShowTimeRef.current = showData.getTimeForCount(currentCountRef.current);
        startTimeRef.current = null;
        if (hasAudio) {
            audioClockRef.current = {
                time: playStartShowTimeRef.current,
                wall: Date.now(),
                playing: true,
            };
            player.seekTo(playStartShowTimeRef.current);
            player.play();
        }
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [showData, hasAudio, player, animate]);

    useEffect(() => {
        if (playerStatus.didJustFinish && isPlayingRef.current) {
            stopPlayback();
        }
    }, [playerStatus.didJustFinish, stopPlayback]);

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
    // console.log('set index:', currentIndex, 'current count:', currentCount, coordinates);
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
                sets[currentIndex].count - sets[currentIndex - 1].count
            )
            : null;

    return (
        <View style={{width: '100%', height: '100%', backgroundColor: theme.colors.background}}>
            <FieldCanvas showData={showData}
                         animationProgress={animationProgress}
                         onPerformerTap={setPopupPerformer}
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
                            stopPlayback();
                        } else {
                            startPlayback();
                        }
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
            {popupPerformer && (
                <PerformerPopup
                    performer={popupPerformer}
                    onDismiss={() => setPopupPerformer(null)}
                />
            )}
        </View>
    );
}