import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useShowData} from "@/lib/hooks/use-show-data";
import {ScrollView, View} from "react-native";
import {Chip, IconButton, List, Switch, Text, useTheme} from "react-native-paper";
import {useShowContext} from "@/lib/hooks/use-show-context";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from "react-native-safe-area-context";

interface ViewSection {
    name: string;
    description: string;
    visible: boolean;
}

export interface DrillView {
    id: string;
    name: string;
    sections: ViewSection[];
    soloPerformerDot: boolean;
}

export const makeDefaultSections = (performers: {
    label: string;
    symbol: string;
    performer: string;
}[]): ViewSection[] => {
    const uniqueSymbols = performers.map(p => p.symbol)
        .filter((s, index, self) => self.indexOf(s) === index)
        .sort((a, b) => a.localeCompare(b));

    return uniqueSymbols.map(symbol => ({
        name: symbol,
        description: `${symbol} (${performers.filter(p => p.symbol === symbol).slice(0, 2).map(p => `${p.performer} ${p.label}`).join(', ')}, ...)`,
        visible: true,
    }));
}

export default function ConfigureViewModalScreen() {
    const theme = useTheme();
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {showData, loading} = useShowData(id as string, true);
    const {selectedInstrument} = useShowContext();
    const [views, setViews] = useState<DrillView[] | null>(null);
    const [activeViewId, setActiveViewId] = useState<string | null>(null);
    const [editingViewId, setEditingViewId] = useState<string | null>(null);
    const [sectionsExpanded, setSectionsExpanded] = useState(true);

    useEffect(() => {
        (async () => {
            if (!showData || !selectedInstrument) return;
            const [storedViews, storedActiveView] = await Promise.all([
                AsyncStorage.getItem(`show_${id}_views`),
                AsyncStorage.getItem(`show_${id}_active_view`),
            ]);
            const parsedViews: DrillView[] = (storedViews ? JSON.parse(storedViews) : [
                {
                    id: 'default',
                    name: 'Default',
                    sections: makeDefaultSections(showData?.getPerformers() ?? []),
                    soloPerformerDot: false,
                }
            ]);
            setViews(parsedViews);
            setActiveViewId(storedActiveView ?? parsedViews[0]?.id ?? null);
        })();
    }, [id, showData, selectedInstrument]);

    useEffect(() => {
        if (views) AsyncStorage.setItem(`show_${id}_views`, JSON.stringify(views));
    }, [views, id]);

    useEffect(() => {
        if (activeViewId) AsyncStorage.setItem(`show_${id}_active_view`, activeViewId);
    }, [activeViewId, id]);

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

    const updateView = (viewId: string, updater: (view: DrillView) => DrillView) => {
        setViews(vs => vs.map(v => v.id === viewId ? updater(v) : v));
    };

    const deleteView = (viewId: string) => {
        const remaining = views.filter(v => v.id !== viewId);
        setViews(remaining);
        if (activeViewId === viewId) setActiveViewId(remaining[0]?.id ?? null);
        if (editingViewId === viewId) setEditingViewId(null);
    };

    const addView = () => {
        setViews(vs => [...vs, {
            id: `view-${Date.now()}`,
            name: `View ${vs.length + 1}`,
            sections: makeDefaultSections(showData?.getPerformers() ?? []),
            soloPerformerDot: false,
        }]);
    };

    return (
        <>
            <Stack.Screen options={{
                title: editingView ? 'Edit View: ' + editingView.name
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
                                            <Text>{view.name}</Text>
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
                                                    onPress={() => deleteView(view.id)}
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
