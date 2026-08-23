import React from "react";
import {Pressable, StyleSheet, View} from "react-native";
import {Surface, Text, useTheme} from "react-native-paper";
import {instrumentToColor} from "@/components/field/color";
import {PerformerInfo} from "@/lib/hooks/use-show-views";

export const PerformerPopup = ({performer, onDismiss}: {
    performer: PerformerInfo;
    onDismiss: () => void;
}) => {
    const theme = useTheme();
    const color = instrumentToColor(performer.performer, theme.dark);

    return (
        <Pressable
            style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            onPress={onDismiss}
        >
            <Pressable onPress={() => {}}>
                <Surface elevation={5} style={[styles.card, {borderRadius: theme.roundness * 3}]}>
                    <View style={styles.titleRow}>
                        <View style={[styles.dot, {backgroundColor: color}]}/>
                        <Text variant="titleLarge">{performer.performer}</Text>
                    </View>
                    <Text variant="bodyLarge">Label: {performer.label}</Text>
                    <Text variant="bodyLarge">Symbol: {performer.symbol}</Text>
                </Surface>
            </Pressable>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    card: {
        padding: 20,
        minWidth: 220,
        gap: 8,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});
