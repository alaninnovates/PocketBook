import {Directory, File, Paths} from "expo-file-system";
import {Platform} from "react-native";
import {supabase} from "@/lib/supabase";

// lazy so the (unsupported) web bundle never touches the file system
let showAudioDir: Directory | null = null;
const getShowAudioDir = (): Directory => {
    if (!showAudioDir) {
        showAudioDir = new Directory(Paths.document, "audio");
    }
    return showAudioDir;
};

export const getShowAudioFile = (showId: string | number): File =>
    new File(getShowAudioDir(), `${showId}.mp3`);

// Downloads `audio/<orgId>/<showId>.mp3` from the audio storage bucket to the
// app's document directory so it can be played offline alongside the drill.
// Best-effort: returns null when the bucket has no audio for this show.
export const downloadShowAudio = async (orgId: string | number, showId: string | number): Promise<File | null> => {
    if (Platform.OS === "web") return null;
    try {
        const audioDir = getShowAudioDir();
        if (!audioDir.exists) {
            audioDir.create({intermediates: true, idempotent: true});
        }
        console.log('downloading show audio:', `${orgId}/${showId}.mp3`);
        const {data, error} = await supabase.storage
            .from("audio")
            .download(`${orgId}/${showId}.mp3`);
        if (error || !data) {
            console.warn("unable to download show audio:", error?.message ?? "no data");
            return null;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(data);
        });
        const file = getShowAudioFile(showId);
        if (!file.exists) {
            file.create({intermediates: true});
        }
        file.write(base64, {encoding: "base64"});
        return file;
    } catch (err) {
        console.warn("unable to download show audio:", err);
        return null;
    }
};
