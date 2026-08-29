import {useSyncExternalStore} from 'react';
import {onTransportResult, TransportResult} from '@/lib/network-fetch';
import {supabase} from '@/lib/supabase';

// Global network mode: 'offline' covers both no connection and poor wifi.
// Poor wifi is treated as offline so every screen serves cached data instead
// of hanging on slow requests.

export type NetworkMode = 'online' | 'offline';

export const SLOW_STREAK_TO_OFFLINE = 2;
export const PROBE_INTERVAL_MS = 25_000;

let mode: NetworkMode = 'online';
let slowStreak = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};
const getSnapshot = () => mode;

export const getNetworkMode = () => mode;

export const useNetworkStatus = () => {
    const currentMode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return {mode: currentMode, isOffline: currentMode === 'offline'};
};

let probeTimer: ReturnType<typeof setInterval> | null = null;
let probeInFlight = false;

const startProbing = () => {
    if (probeTimer) return;
    probeTimer = setInterval(triggerProbeIfOffline, PROBE_INTERVAL_MS);
};

const stopProbing = () => {
    if (probeTimer) {
        clearInterval(probeTimer);
        probeTimer = null;
    }
};

// Lightweight request while offline; its result is discarded — the fetch
// wrapper's transport report ("fast" completion) is what flips us back online.
// (PostgrestBuilder is a PromiseLike, so no .catch/.finally — use then's two callbacks.)
export const triggerProbeIfOffline = () => {
    if (mode !== 'offline' || probeInFlight) return;
    probeInFlight = true;
    supabase.from('shows').select('id').limit(1)
        .then(
            () => {
                probeInFlight = false;
            },
            () => {
                probeInFlight = false;
            },
        );
};

export const setNetworkMode = (next: NetworkMode, reason: string) => {
    if (next === mode) return;
    mode = next;
    console.log(`network mode -> ${next} (${reason})`);
    if (next === 'offline') {
        slowStreak = 0;
        startProbing();
        try {
            supabase.auth.stopAutoRefresh();
        } catch {}
    } else {
        stopProbing();
        try {
            supabase.auth.startAutoRefresh();
        } catch {}
    }
    listeners.forEach((listener) => listener());
};

// state machine: online -> offline on timeout/transport error or a streak of
// slow completions; offline -> online only on a fast completed request.
// Note: Fast Refresh may re-add this observer; the handler is idempotent.
onTransportResult((result: TransportResult) => {
    if (result === 'timeout' || result === 'error') {
        setNetworkMode('offline', `transport: ${result}`);
    } else if (result === 'slow') {
        slowStreak++;
        if (slowStreak >= SLOW_STREAK_TO_OFFLINE) {
            setNetworkMode('offline', 'consecutive slow requests');
        }
    } else {
        // fast
        slowStreak = 0;
        if (mode === 'offline') {
            setNetworkMode('online', 'fast request completed');
        }
    }
});
