import {useLocalSearchParams} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useState} from "react";
import {View} from "react-native";

export default function ShowScreen() {
    const {id} = useLocalSearchParams();
    const [zoom, setZoom] = useState(0);

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
                <FieldCanvas zoom={zoom} />
            </ReactNativeZoomableView>
        </View>
    );
}