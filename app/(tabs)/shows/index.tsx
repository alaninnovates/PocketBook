import {ScrollView, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";

const templateShows = [
    {
        id: 1,
        title: 'LAHS 2024 Moonlight',
        date: new Date('2024-05-15'),
        pages: 50,
        downloaded: true,
    },
    {
        id: 2,
        title: 'LAHS 2025 Hexed',
        date: new Date('2025-05-20'),
        pages: 67,
        downloaded: false,
    }
]

export default function ShowsScreen() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={{padding: 16}}>
            <Text variant="headlineLarge" style={{marginBottom: 16}}>Shows</Text>
            <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 16, height: '100%'}}>
                {templateShows.map((show) => (
                    <View key={show.id} style={{padding: 16, backgroundColor: theme.colors.surface, borderRadius: theme.roundness}}>
                        <Text variant="headlineMedium" style={{marginBottom: 8}}>{show.title}</Text>
                        <Text>Date: {show.date.toDateString()}</Text>
                        <Text>Pages: {show.pages}</Text>
                        <Button mode="contained" style={{marginTop: 8}}
                                onPress={() => router.push(`/shows/${show.id}`)}
                                buttonColor={show.downloaded ? theme.colors.primary : theme.colors.secondary}
                        >
                            {show.downloaded ? 'Open' : 'Download'}
                        </Button>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}