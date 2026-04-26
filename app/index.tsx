import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center', alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}>
            <Text variant="headlineMedium" style={{color: theme.colors.primary}}>
                Welcome to PocketBook!
            </Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                The ultimate drill learning platform for marching.
            </Text>
            <View style={{
                width: '80%',
                aspectRatio: 1.5,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Image source={require('../assets/images/homepage-sample-image.png')}
                       style={{width: '100%', height: '100%', borderRadius: theme.roundness}} contentFit="cover"/>
            </View>
            <View style={{display: 'flex', width: '70%', flexDirection: 'column', gap: 16}}>
                <Button mode="contained" onPress={() => router.push('/auth/log-in')}>
                    Log In
                </Button>
                <Button mode="outlined" onPress={() => router.push('/auth/sign-up')}>
                    Sign up
                </Button>
            </View>
        </SafeAreaView>
    )
}
