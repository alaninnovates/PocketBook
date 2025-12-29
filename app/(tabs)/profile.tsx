import {Button} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function ProfileScreen() {
    return (
        <SafeAreaView>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
                Hello
            </Button>
        </SafeAreaView>
    );
}