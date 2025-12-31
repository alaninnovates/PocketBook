import {useLocalSearchParams} from "expo-router";
import {FieldCanvas} from "@/components/field/field-canvas";
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useEffect, useState} from "react";
import {View} from "react-native";
import {DotData, TempoData} from "@/lib/types";
import {supabase} from "@/lib/supabase";
import {Text} from "react-native-paper";

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
                <FieldCanvas zoom={zoom} dotData={showData?.dot_data} tempoData={showData?.tempo_data}/>
            </ReactNativeZoomableView>
        </View>
    );
}