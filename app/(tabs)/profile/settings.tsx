import {Button, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {View} from "react-native";
import {FieldView, SettingsManager, SettingsProperty} from "@/lib/settings-manager";
import Slider from '@react-native-community/slider';

export default function SettingsScreen() {
    const theme = useTheme();
    const [fieldView, setFieldView] = useState<FieldView>(FieldView.Performer);
    const [dotScale, setDotScale] = useState<number>(1);
    const [loading, setLoading] = useState(true);

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

    return (
        <View style={{flex: 1, marginHorizontal: 16}}>
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
        </View>
    )
}
