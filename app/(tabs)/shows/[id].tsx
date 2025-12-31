import {useLocalSearchParams} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useEffect, useState} from "react";
import {View} from "react-native";
import {DotData, TempoData} from "@/lib/types";
import {supabase} from "@/lib/supabase";
import {IconButton, Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ShowScreen() {
    const {id} = useLocalSearchParams();
    const [zoom, setZoom] = useState(0);
    const [showData, setShowData] = useState<{
        id: string;
        name: string;
        dot_data: DotData;
        tempo_data: TempoData;
        created_at: string;
    } | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const {top, left, bottom, right} = useSafeAreaInsets();

    useEffect(() => {
        const fetchShowData = async () => {
            const {data, error} = await supabase
                .from('shows')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching show data:', error);
            } else {
                setShowData(data);
            }
        }
        fetchShowData();
    }, [id]);

    if (!showData) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Loading...</Text>
        </View>
    }

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
                <FieldCanvas zoom={zoom} dotData={showData?.dot_data} tempoData={showData?.tempo_data}
                             currentIndex={currentIndex}
                />
            </ReactNativeZoomableView>
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