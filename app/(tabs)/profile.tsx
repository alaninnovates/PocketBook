import {Button, IconButton, List, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/lib/supabase";
import {ScrollView, View} from "react-native";
import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {useState} from "react";

export default function ProfileScreen() {
    const {profile} = useAuthContext();
    const theme = useTheme();
    const [ensembles, setEnsembles] = useState<string[]>([]);

    const addEnsemble = () => {
        setEnsembles([...ensembles, `Ensemble ${ensembles.length + 1}`]);
    };

    const deleteEnsemble = (index: number) => {
        setEnsembles(ensembles.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView style={{padding: 16, flex: 1}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{gap: 16, paddingBottom: 16}}>
                <View style={{backgroundColor: theme.colors.primaryContainer, borderRadius: 12, padding: 16, gap: 12}}>
                    <Text variant="headlineMedium">Profile</Text>
                    <Text>{profile.name}</Text>
                    <Text>Email: {profile.email}</Text>
                    <Button mode="contained" onPress={async () => {
                        const {error} = await supabase.auth.signOut();

                        if (error) {
                            console.error('Error signing out:', error);
                        }
                    }}>
                        Sign out
                    </Button>
                </View>
                <View style={{padding: 16}}>
                    <Text variant="headlineMedium">Ensembles</Text>
                    <List.Section style={{gap: 8}}>
                        {ensembles.length === 0 ? (
                            <Text style={{color: theme.colors.secondary, fontStyle: 'italic'}}>No ensembles yet</Text>
                        ) : (
                            ensembles.map((ensemble, index) => (
                                <List.Item
                                    key={index}
                                    title={ensemble}
                                    description="Joined 1 Jan 2025"
                                    right={() => (
                                        <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => deleteEnsemble(index)} />
                                    )}
                                />
                            ))
                        )}
                    </List.Section>
                    <Button mode="outlined" icon="plus" onPress={addEnsemble}>
                        Join
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}