import {SafeAreaView} from "react-native-safe-area-context";
import {EnsembleSwitcher} from "@/components/ensemble-switcher";
import {useEffect, useState} from "react";
import {SegmentedButtons, Text, useTheme} from "react-native-paper";
import {ScrollView, View} from "react-native";
import {supabase} from "@/lib/supabase";

export default function ManageScreen() {
    const theme = useTheme();
    const [selectedEnsemble, setSelectedEnsemble] = useState<number | null>(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (!selectedEnsemble) {
            setMembers([]);
            return;
        }
        const fetchMembers = async () => {
            const {data, error} = await supabase.from('ensemble_memberships')
                .select('profiles(id, email, name), role, requested_at, approved_at')
                .eq('ensemble_id', selectedEnsemble);
            if (error) {
                console.error('err fetching ensemble members:', error);
            } else {
                console.log(data);
                setMembers(data);
            }
        }
        fetchMembers();
    }, [selectedEnsemble]);

    return (
        <SafeAreaView style={{padding: 16, flex: 1}}>
            <EnsembleSwitcher selectedEnsemble={selectedEnsemble} setSelectedEnsemble={setSelectedEnsemble}
                              filterAdmin={true}/>
            <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', gap: 16, height: '100%'}}>
                {members.length === 0 && (
                    <Text variant="bodyMedium" style={{marginTop: 32, textAlign: 'center'}}>No members available for
                        this
                        ensemble.</Text>
                )}
                {members.map((member: any) => (
                    <View key={member.profiles.id}
                          style={{padding: 16, backgroundColor: theme.colors.surface, borderRadius: theme.roundness, gap: 8}}>
                        <Text variant="titleMedium">{member.profiles.name || 'No Name'}</Text>
                        <Text variant="bodyMedium">Email: {member.profiles.email}</Text>
                        <SegmentedButtons
                            value={member.role}
                            onValueChange={async (newRole) => {
                                console.log('changing role to:', newRole, 'for member:', member.profiles.id);
                                const {error} = await supabase.from('ensemble_memberships')
                                    .update({
                                        role: newRole,
                                        approved_at: newRole !== 'awaiting_approval' ? new Date().toISOString() : null,
                                    })
                                    .eq('ensemble_id', selectedEnsemble)
                                    .eq('user_id', member.profiles.id);
                                if (error) {
                                    console.error('err updating member role:', error);
                                } else {
                                    setMembers((prevMembers: any) => prevMembers.map((m: any) => {
                                        if (m.profiles.id === member.profiles.id) {
                                            return {
                                                ...m,
                                                role: newRole,
                                                approved_at: newRole !== 'awaiting_approval' ? new Date().toISOString() : null,
                                            };
                                        }
                                        return m;
                                    }))
                                }
                            }}
                            buttons={[
                                {
                                    value: 'awaiting_approval',
                                    label: 'Awaiting Approval',
                                },
                                {
                                    value: 'member',
                                    label: 'Member',
                                },
                                {
                                    value: 'admin',
                                    label: 'Admin',
                                }
                            ]}
                        />
                        <Text variant="bodySmall">
                            {member.role === 'awaiting_approval'
                                ? `Requested at: ${new Date(member.requested_at).toLocaleDateString()}`
                                : `Approved at: ${new Date(member.approved_at).toLocaleDateString()}`}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}