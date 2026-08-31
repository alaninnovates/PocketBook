import {Button, Dialog, Portal, Text} from "react-native-paper";
import {useState} from "react";
import {restart, useStallionUpdate} from "react-native-stallion";

export default function UpdatePrompt() {
    const {isRestartRequired, newReleaseBundle} = useStallionUpdate();
    const [dismissedBundleId, setDismissedBundleId] = useState<string | null>(null);

    const isMandatory = newReleaseBundle?.isMandatory ?? false;
    const visible = Boolean(
        isRestartRequired &&
        newReleaseBundle &&
        (isMandatory || dismissedBundleId !== newReleaseBundle.id) &&
        process.env.NODE_ENV !== "development"
    );

    const dismiss = () => setDismissedBundleId(newReleaseBundle?.id ?? null);

    return (
        <Portal>
            <Dialog visible={visible} dismissable={!isMandatory} onDismiss={dismiss}>
                <Dialog.Icon icon="update"/>
                <Dialog.Title>Update Available</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">
                        {newReleaseBundle?.releaseNote ||
                            `Version ${newReleaseBundle?.version ?? ""} is ready to install.`}
                        {isMandatory ? " This update is required." : ""}
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    {!isMandatory && (
                        <Button onPress={dismiss}>
                            Later
                        </Button>
                    )}
                    <Button mode="contained" onPress={restart}>
                        Restart Now
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}
