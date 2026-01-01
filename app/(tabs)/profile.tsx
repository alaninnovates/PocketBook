import {Button, IconButton, List, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/lib/supabase";
import {ScrollView, View} from "react-native";
import {useAuthContext} from "@/lib/hooks/use-auth-context";
import {useRouter} from "expo-router";
import {useEnsembles} from "@/lib/hooks/use-ensembles";

export default function ProfileScreen() {
    const {profile} = useAuthContext();
    const theme = useTheme();
    const router = useRouter();
    const {ensembles, setEnsembles} = useEnsembles();

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
                                    title={ensemble.ensembles.name}
                                    description={
                                        ensemble.role === 'awaiting_approval'
                                            ? `Awaiting Approval since ${new Date(ensemble.requested_at).toLocaleDateString()}`
                                            : `${ensemble.role === 'member' ? 'Member' : 'Admin'} since ${new Date(ensemble.approved_at).toLocaleDateString()}`
                                    }
                                    right={() => (
                                        <IconButton
                                            icon="delete" iconColor={theme.colors.error}
                                            onPress={async () => {
                                                await supabase
                                                    .from('ensemble_memberships')
                                                    .delete()
                                                    .eq('user_id', profile.id)
                                                    .eq('ensemble_id', ensemble.ensembles.id);
                                                setEnsembles(prev => prev.filter(e => e.ensembles.name !== ensemble.ensembles.name));
                                            }}
                                        />
                                    )}
                                />
                            ))
                        )}
                    </List.Section>
                    <Button mode="outlined" icon="plus" onPress={() => {
                        router.push('/(modals)/profile');
                    }}>
                        Join
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}