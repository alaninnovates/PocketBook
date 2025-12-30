import {Button} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/lib/supabase";

export default function ProfileScreen() {
    return (
        <SafeAreaView>
            <Button mode="contained" onPress={async () => {
                const {error} = await supabase.auth.signOut();

                if (error) {
                    console.error('Error signing out:', error);
                }
            }}>
                Sign out
            </Button>
        </SafeAreaView>
    );
}