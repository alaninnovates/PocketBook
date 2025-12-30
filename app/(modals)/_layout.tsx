import {Stack} from "expo-router";

export default function ModalLayout() {
    return (
        <Stack>
            <Stack.Screen name="profile" options={{title: 'Join Ensemble'}}/>
        </Stack>
    )
}
