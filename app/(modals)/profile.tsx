import {useRouter} from "expo-router";
import JoinEnsemble from "@/components/join-ensemble";

export default function ProfileModalScreen() {
    const router = useRouter();

    return (
        <JoinEnsemble onSuccess={() => router.back()} />
    );
}
