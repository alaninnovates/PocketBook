import {Canvas,} from "@shopify/react-native-skia";
import {FIELD_HEIGHT_STEPS, FIELD_WIDTH_STEPS, stepsToPixels} from "./dimensions";
import {FieldGrid} from "@/components/field/field-grid";
import {useTheme} from "react-native-paper";

export const FieldCanvas = ({zoom}: { zoom: number }) => {
    const theme = useTheme();

    return (
        <Canvas style={{
            width: stepsToPixels(FIELD_WIDTH_STEPS),
            height: stepsToPixels(FIELD_HEIGHT_STEPS),
            transform: [{rotate: '180deg'}],
        }}>
            <FieldGrid theme={theme} showGrid={zoom > 0.9}/>
        </Canvas>
    )
}