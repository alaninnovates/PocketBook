import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useShowData} from "@/lib/hooks/use-show-data";
import {ScrollView, View} from "react-native";
import {Chip, IconButton, List, Switch, Text, TextInput, useTheme} from "react-native-paper";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {DrillView, useShowViews} from "@/lib/hooks/use-show-views";

const displayName = (view: DrillView) => view.name.trim() || 'Untitled view';

export default function ConfigureViewModalScreen() {
    const theme = useTheme();
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {showData, loading} = useShowData(id as string, true);
    const {selectedInstrument} = useShowContext();
    const [editingViewId, setEditingViewId] = useState<string | null>(null);
    const [sectionsExpanded, setSectionsExpanded] = useState(true);

    const {views, activeViewId, updateView, deleteView, addView, setActiveViewId} =
        useShowViews(id as string, showData);

    if (loading || !showData || !selectedInstrument || !views) {
        return (
            <>
                <Stack.Screen options={{title: 'Configure View'}}/>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Loading...</Text>
                </View>
            </>
        );
    }

    const editingView = views.find(v => v.id === editingViewId) ?? null;

    const removeView = (viewId: string) => {
        deleteView(viewId);
        if (editingViewId === viewId) setEditingViewId(null);
    };

    return (
        <>
            <Stack.Screen options={{
                title: editingView ? 'Edit View: ' + displayName(editingView)
                    : 'Configure View',
                headerLeft: editingView ? () => (
                    <IconButton
                        icon="arrow-left"
                        onPress={() => setEditingViewId(null)}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                ) : undefined,
                headerRight: () => (
                    <IconButton icon="close" onPress={() => router.back()} iconColor={theme.colors.onSurfaceVariant}/>
                )
            }}/>
            <SafeAreaView style={{flex: 1}}>
                <ScrollView
                    contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 12}}
                >
                    {editingView ? (
                        <>
                            <TextInput
                                label="View name"
                                mode="outlined"
                                value={editingView.name}
                                onChangeText={name => updateView(editingView.id, view => ({...view, name}))}
                                style={{marginHorizontal: 16, marginTop: 16}}
                            />
                            <List.Item
                                title="Show only your dot"
                                right={() => (
                                    <Switch
                                        value={editingView.soloPerformerDot}
                                        onValueChange={value => updateView(editingView.id, view => ({
                                            ...view,
                                            soloPerformerDot: value,
                                        }))}
                                    />
                                )}
                            />
                            <List.Accordion
                                title="Show/hide sections"
                                expanded={sectionsExpanded}
                                onPress={() => setSectionsExpanded(expanded => !expanded)}
                            >
                                {editingView.sections.map(section => (
                                    <List.Item
                                        key={section.name}
                                        title={section.description}
                                        right={() => (
                                            <IconButton
                                                icon={section.visible ? 'eye' : 'eye-off'}
                                                iconColor={theme.colors.onSurfaceVariant}
                                                onPress={() => updateView(editingView.id, view => ({
                                                    ...view,
                                                    sections: view.sections.map(s =>
                                                        s.name === section.name ? {...s, visible: !s.visible} : s
                                                    ),
                                                }))}
                                            />
                                        )}
                                    />
                                ))}
                            </List.Accordion>
                        </>
                    ) : (
                        <>
                            {views.map(view => (
                                <List.Item
                                    key={view.id}
                                    title={
                                        <View style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            <Text>{displayName(view)}</Text>
                                            {view.id === activeViewId && (
                                                <Chip compact>Active</Chip>
                                            )}
                                        </View>
                                    }
                                    onPress={() => setActiveViewId(view.id)}
                                    right={() => (
                                        <View style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}>
                                            {views.length > 1 && (
                                                <IconButton
                                                    icon="delete"
                                                    iconColor={theme.colors.error}
                                                    onPress={() => removeView(view.id)}
                                                />
                                            )}
                                            <IconButton
                                                icon="chevron-right"
                                                iconColor={theme.colors.onSurfaceVariant}
                                                onPress={() => setEditingViewId(view.id)}
                                            />
                                        </View>
                                    )}
                                />
                            ))}
                            <List.Item
                                title="Add view"
                                left={props => <List.Icon {...props} icon="plus"/>}
                                onPress={addView}
                            />
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}
