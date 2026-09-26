import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useNetInfo} from '@react-native-community/netinfo';
import {setNetworkMode, triggerProbeIfOffline, useNetworkStatus} from '@/lib/network-status';

// Mounted once at the root; keeps the global network mode in sync with the
// device's connection state. NetInfo only ever flips the mode offline or
// triggers a probe — going back online is decided by real request results.
export default function NetworkMonitor() {
    const {isConnected, isInternetReachable} = useNetInfo();
    const {isOffline} = useNetworkStatus();

    useEffect(() => {
        if (isConnected === false) {
            setNetworkMode('offline', 'netinfo: no connection'); // null = unknown, ignore
        } else if (isConnected === true && isOffline) {
            triggerProbeIfOffline(); // reconnect or reachability flip -> probe
        }
        // isInternetReachable is deliberately not authoritative.
    }, [isConnected, isInternetReachable, isOffline]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') triggerProbeIfOffline();
        });
        return () => subscription.remove();
    }, []);

    return null;
}
