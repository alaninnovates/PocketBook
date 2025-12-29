import {Text} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useLocalSearchParams} from "expo-router";

export default function ShowScreen() {
    const { id } = useLocalSearchParams();

    return (
        <SafeAreaView>
            <Text>Hello {id}</Text>
        </SafeAreaView>
    );
}