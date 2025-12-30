import {supabase} from '@/lib/supabase';
import {View} from "react-native";
import {Button, TextInput} from "react-native-paper";
import {useState} from "react";

export function EmailPassword() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={{display: 'flex', flexDirection: 'column', gap: 8, width: '80%', marginTop: 16}}>
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
                const {data, error} = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    console.error('Error signing in:', error);
                } else {
                    console.log('Signed in successfully:', data);
                }
            }}>
                Sign In
            </Button>
        </View>
    )
}