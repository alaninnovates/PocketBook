import {Button, Dialog, Portal, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {ScrollView, View} from "react-native";
import {FieldView, SettingsManager, SettingsProperty} from "@/lib/settings-manager";
import Slider from '@react-native-community/slider';
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/lib/supabase";
import {useAuthContext} from "@/lib/hooks/use-auth-context";

export default function SettingsScreen() {
    const theme = useTheme();
    const {signOut} = useAuthContext();
    const [fieldView, setFieldView] = useState<FieldView>(FieldView.Performer);
    const [dotScale, setDotScale] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        (async () => {
            const savedFieldView = await SettingsManager.getProperty<FieldView>(
                SettingsProperty.FieldView,
                FieldView.Performer
            );
            setFieldView(savedFieldView);
            setLoading(false);
        })();
    }, []);

    const updateFieldView = async (next: FieldView) => {
        await SettingsManager.setProperty<FieldView>(SettingsProperty.FieldView, next);
        setFieldView(next);
    };

    const updateDotScale = async (next: number) => {
        await SettingsManager.setProperty<number>(SettingsProperty.DotScale, next);
        setDotScale(next);
    }

    const handleDeleteAccount = async () => {
        setDeleting(true);
        const {error} = await supabase.rpc('delete_user');
        if (error) {
            console.error('Error deleting account:', error);
            setDeleting(false);
            setDeleteDialogVisible(false);
            return;
        }
        await signOut?.();
        setDeleting(false);
        setDeleteDialogVisible(false);
    };

    return (
        <SafeAreaView style={{flex: 1, marginHorizontal: 16}} edges={['bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{gap: 16, paddingBottom: 16}}>
                <View style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                        Field View
                    </Text>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <Button
                            mode={fieldView === FieldView.Director ? "contained" : "outlined"}
                            onPress={() => updateFieldView(FieldView.Director)}
                            disabled={loading}
                        >
                            Director
                        </Button>
                        <Button
                            mode={fieldView === FieldView.Performer ? "contained" : "outlined"}
                            onPress={() => updateFieldView(FieldView.Performer)}
                            disabled={loading}
                        >
                            Performer
                        </Button>
                    </View>
                    <Text>
                        {fieldView === FieldView.Performer ? (
                            "View the field from the perspective of a performer, with the front sideline at the top of the screen."
                        ) : (
                            "View the field from the perspective of a director, with the front sideline at the bottom of the screen."
                        )}
                    </Text>
                </View>
                <View style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                        Dot Scale
                    </Text>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <Slider
                            style={{flex: 1}}
                            minimumValue={0.5}
                            maximumValue={2}
                            step={0.5}
                            value={dotScale}
                            onValueChange={updateDotScale}
                            minimumTrackTintColor={theme.colors.primary}
                            renderStepNumber
                        />
                    </View>
                    <Text>
                        Configure how big performer dots and movements appear on the field.
                    </Text>
                </View>
                <View style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Text variant="headlineMedium" style={{color: theme.colors.error}}>
                        Danger Zone
                    </Text>
                    <Text>
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </Text>
                    <Button
                        mode="contained"
                        buttonColor={theme.colors.error}
                        textColor={theme.colors.onError}
                        icon="delete"
                        onPress={() => setDeleteDialogVisible(true)}
                    >
                        Delete Account
                    </Button>
                </View>
            </ScrollView>
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => !deleting && setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Account</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to delete your account? This action is permanent and cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)} disabled={deleting}>Cancel</Button>
                        <Button
                            onPress={handleDeleteAccount}
                            textColor={theme.colors.error}
                            loading={deleting}
                            disabled={deleting}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    )
}
