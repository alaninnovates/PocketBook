import {Canvas,} from "@shopify/react-native-skia";
import {FIELD_HEIGHT_STEPS, FIELD_WIDTH_STEPS, stepsToPixels} from "./dimensions";
import {FieldGrid} from "./field-grid";
import {OtherPerformers} from "./other-performers";
import {useTheme} from "react-native-paper";
import {DotData, TempoData} from "@/lib/types";
import {ActivePerformer} from "@/components/field/active-performer";

export const FieldCanvas = ({zoom, dotData, tempoData, currentIndex, performer, animationProgress}: {
    zoom: number;
    dotData: DotData;
    tempoData: TempoData;
    currentIndex: number;
    performer: string;
    animationProgress: number;
}) => {
    const theme = useTheme();

    return (
        <Canvas style={{
            width: stepsToPixels(FIELD_WIDTH_STEPS),
            height: stepsToPixels(FIELD_HEIGHT_STEPS),
            transform: [{rotate: '180deg'}],
        }}>
            <FieldGrid theme={theme} showGrid={zoom > 0.9}/>
            <OtherPerformers dotData={dotData} currentIndex={currentIndex} zoom={zoom} animationProgress={animationProgress} />
            <ActivePerformer dotData={dotData} currentIndex={currentIndex} zoom={zoom} performer={performer} animationProgress={animationProgress} />
        </Canvas>
    )
}