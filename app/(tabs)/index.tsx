import {View} from "react-native";
import {Button} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <SafeAreaView>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Hello
            </Button>
        </SafeAreaView>
    );
}