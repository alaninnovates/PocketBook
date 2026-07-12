import React, {useCallback, useMemo, useRef, useState} from "react";
import {LayoutChangeEvent, StyleSheet, View} from "react-native";
import {Canvas, Group, vec} from "@shopify/react-native-skia";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue} from "react-native-reanimated";
import {FIELD_HEIGHT_PIXELS, FIELD_WIDTH_PIXELS} from "./dimensions";
import {FieldGrid} from "./field-grid";
import {OtherPerformers} from "./other-performers";
import {useTheme} from "react-native-paper";
import {ActivePerformer} from "@/components/field/active-performer";
import {FieldView, SettingsProperty, useProperty} from "@/lib/settings-manager";
import {ShowData} from "@/lib/hooks/use-show-data";
import {ShowContext, useShowContext} from "@/lib/hooks/use-show-context";

const INITIAL_ZOOM = 0.4;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 6;
const GRID_ZOOM_THRESHOLD = 0.9;

export const FieldCanvas = ({showData, animationProgress}: {
    showData: ShowData;
    animationProgress: number;
}) => {
    const theme = useTheme();
    const [fieldView] = useProperty<FieldView>(SettingsProperty.FieldView, FieldView.Performer);

    // react-side zoom for level-of-detail (font/dot sizes, etc)
    const [lodZoom, setLodZoom] = useState(INITIAL_ZOOM);

    const scale = useSharedValue(INITIAL_ZOOM);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);

    const pinchStartScale = useSharedValue(INITIAL_ZOOM);
    const pinchStartX = useSharedValue(0);
    const pinchStartY = useSharedValue(0);
    const pinchStartFocalX = useSharedValue(0);
    const pinchStartFocalY = useSharedValue(0);

    const initializedRef = useRef(false);
    const lastLayoutRef = useRef({width: 0, height: 0});

    const updateLodZoom = useCallback((z: number) => {
        setLodZoom(z);
    }, []);

    // push zoom to to react
    useAnimatedReaction(
        () => {
            const z = scale.value;
            return {
                z,
                bucket: Math.round(z * 10),
                grid: z > GRID_ZOOM_THRESHOLD ? 1 : 0,
            };
        },
        (current, previous) => {
            if (!previous || current.bucket !== previous.bucket || current.grid !== previous.grid) {
                runOnJS(updateLodZoom)(current.z);
            }
        },
    );

    const centerField = useCallback((viewportWidth: number, viewportHeight: number) => {
        scale.value = INITIAL_ZOOM;
        translateX.value = (viewportWidth - FIELD_WIDTH_PIXELS * INITIAL_ZOOM) / 2;
        translateY.value = (viewportHeight - FIELD_HEIGHT_PIXELS * INITIAL_ZOOM) / 2;
        setLodZoom(INITIAL_ZOOM);
    }, [scale, translateX, translateY]);

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        if (!width || !height) return;

        const previous = lastLayoutRef.current;
        if (!initializedRef.current) {
            initializedRef.current = true;
            centerField(width, height);
        } else {
            translateX.value += (width - previous.width) / 2;
            translateY.value += (height - previous.height) / 2;
        }
        lastLayoutRef.current = {width, height};
    }, [centerField, translateX, translateY]);

    const panGesture = useMemo(() => Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
            panStartX.value = translateX.value;
            panStartY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = panStartX.value + event.translationX;
            translateY.value = panStartY.value + event.translationY;
        })
        .onEnd(() => {
            runOnJS(updateLodZoom)(scale.value);
        }), [panStartX, panStartY, translateX, translateY, scale, updateLodZoom]);

    const pinchGesture = useMemo(() => Gesture.Pinch()
        .onStart((event) => {
            pinchStartScale.value = scale.value;
            pinchStartX.value = translateX.value;
            pinchStartY.value = translateY.value;
            pinchStartFocalX.value = event.focalX;
            pinchStartFocalY.value = event.focalY;
        })
        .onUpdate((event) => {
            if (event.numberOfPointers < 2) return;
            const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartScale.value * event.scale));
            const ratio = nextScale / pinchStartScale.value;
            translateX.value = event.focalX - (pinchStartFocalX.value - pinchStartX.value) * ratio;
            translateY.value = event.focalY - (pinchStartFocalY.value - pinchStartY.value) * ratio;
            scale.value = nextScale;
        })
        .onEnd(() => {
            runOnJS(updateLodZoom)(scale.value);
        }), [pinchStartScale, pinchStartX, pinchStartY, pinchStartFocalX, pinchStartFocalY, translateX, translateY, scale, updateLodZoom]);

    const gesture = useMemo(() => Gesture.Simultaneous(panGesture, pinchGesture), [panGesture, pinchGesture]);

    const translateTransform = useDerivedValue(() => [
        {translateX: translateX.value},
        {translateY: translateY.value},
    ]);
    const scaleTransform = useDerivedValue(() => [{scale: scale.value}]);

    const fieldRotationTransform = useMemo(
        () => (fieldView === FieldView.Performer ? [{rotate: Math.PI}] : []),
        [fieldView],
    );

    const {currentCount, setCurrentCount, selectedInstrument, setSelectedInstrument} = useShowContext();

    return (
        <GestureDetector gesture={gesture}>
            <View collapsable={false} style={StyleSheet.absoluteFill} onLayout={onLayout}>
                <Canvas style={StyleSheet.absoluteFill}>
                    <ShowContext.Provider value={{currentCount, setCurrentCount, selectedInstrument, setSelectedInstrument}}>
                        <Group transform={translateTransform}>
                            <Group transform={scaleTransform}>
                                <Group
                                    origin={vec(FIELD_WIDTH_PIXELS / 2, FIELD_HEIGHT_PIXELS / 2)}
                                    transform={fieldRotationTransform}
                                >
                                    <FieldGrid theme={theme} showGrid={lodZoom > GRID_ZOOM_THRESHOLD} showData={showData} />
                                    <OtherPerformers showData={showData} zoom={lodZoom}
                                                     animationProgress={animationProgress}/>
                                    <ActivePerformer showData={showData} zoom={lodZoom}
                                                     animationProgress={animationProgress}/>
                                </Group>
                            </Group>
                        </Group>
                    </ShowContext.Provider>
                </Canvas>
            </View>
        </GestureDetector>
    )
}
