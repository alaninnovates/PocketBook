import {supabase} from '@/lib/supabase';
import {Alert, View} from "react-native";
import {Button, Text, TextInput} from "react-native-paper";
import {useState} from "react";

export function EmailPassword({type}: { type: "sign-up" | "log-in" }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    return (
        <View style={{display: 'flex', flexDirection: 'column', gap: 8, width: '80%', marginTop: 16}}>
            {error && (
                <Text variant="bodyMedium" style={{color: 'red'}}>
                    Error: {error}. Try again!
                </Text>
            )}
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry
            />
            <Button mode="contained" onPress={async () => {
                if (type === "sign-up") {
                    const {data, error} = await supabase.auth.signUp({
                        email,
                        password,
                    });
                    if (error) {
                        console.error('Error signing up:', error);
                        setError(error.message);
                    } else {
                        console.log('Signed up successfully:', data);
                        Alert.alert("Success", "Confirm your account via the email we just sent you, then you can log in!");
                    }
                } else {
                    const {data, error} = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error) {
                        console.error('Error signing in:', error);
                        setError(error.message);
                    } else {
                        console.log('Signed in successfully:', data);
                    }
                }
            }}>
                {type === "sign-up" ? "Sign Up" : "Log In"}
            </Button>
        </View>
    )
}