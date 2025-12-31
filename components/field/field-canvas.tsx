import {Canvas,} from "@shopify/react-native-skia";
import {FIELD_HEIGHT_STEPS, FIELD_WIDTH_STEPS, stepsToPixels} from "./dimensions";
import {FieldGrid} from "./field-grid";
import {OtherPerformers} from "./other-performers";
import {useTheme} from "react-native-paper";
import {DotData, TempoData} from "@/lib/types";

export const FieldCanvas = ({zoom, dotData, tempoData}: {
    zoom: number;
    dotData: DotData;
    tempoData: TempoData;
}) => {
    const theme = useTheme();

    return (
        <Canvas style={{
            width: stepsToPixels(FIELD_WIDTH_STEPS),
            height: stepsToPixels(FIELD_HEIGHT_STEPS),
            transform: [{rotate: '180deg'}],
        }}>
            <FieldGrid theme={theme} showGrid={zoom > 0.9}/>
            <OtherPerformers dotData={dotData} currentIndex={41} zoom={zoom}/>
        </Canvas>
    )
}