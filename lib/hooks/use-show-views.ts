import AsyncStorage from "@react-native-async-storage/async-storage";
import {useCallback, useEffect, useSyncExternalStore} from "react";
import {ShowData} from "@/lib/hooks/use-show-data";

export interface ViewSection {
    name: string;
    description: string;
    visible: boolean;
}

export interface DrillView {
    id: string;
    name: string;
    sections: ViewSection[];
    soloPerformerDot: boolean;
}

export interface PerformerInfo {
    label: string;
    symbol: string;
    performer: string;
}

export const makeDefaultSections = (performers: PerformerInfo[]): ViewSection[] => {
    const uniqueSymbols = performers.map(p => p.symbol)
        .filter((s, index, self) => self.indexOf(s) === index)
        .sort((a, b) => a.localeCompare(b));

    return uniqueSymbols.map(symbol => ({
        name: symbol,
        description: `${symbol} (${performers.filter(p => p.symbol === symbol).slice(0, 2).map(p => `${p.performer} ${p.label}`).join(', ')}, ...)`,
        visible: true,
    }));
}

const makeDefaultView = (performers: PerformerInfo[]): DrillView => ({
    id: 'default',
    name: 'Default',
    sections: makeDefaultSections(performers),
    soloPerformerDot: false,
});

type ShowViewsState = {
    // null until the stored views finish loading
    views: DrillView[] | null;
    activeViewId: string | null;
};

type StoreEntry = {
    state: ShowViewsState;
    listeners: Set<() => void>;
    loadPromise: Promise<void> | null;
    subscribe: (listener: () => void) => () => void;
};

// module-level store so every consumer of a show's views shares the same live
// state: edits made in the configure-view modal apply to the field immediately
const stores = new Map<string, StoreEntry>();

const EMPTY_STATE: ShowViewsState = {views: null, activeViewId: null};
const noopSubscribe = () => () => {};

const getStoreEntry = (showId: string): StoreEntry => {
    const existing = stores.get(showId);
    if (existing) return existing;
    const entry: StoreEntry = {
        state: EMPTY_STATE,
        listeners: new Set(),
        loadPromise: null,
        subscribe: () => () => {},
    };
    entry.subscribe = (listener) => {
        entry.listeners.add(listener);
        return () => entry.listeners.delete(listener);
    };
    stores.set(showId, entry);
    return entry;
};

const emit = (entry: StoreEntry) => {
    entry.listeners.forEach(listener => listener());
};

const persist = (showId: string, state: ShowViewsState) => {
    if (!state.views) return;
    AsyncStorage.setItem(`show_${showId}_views`, JSON.stringify(state.views));
    if (state.activeViewId) {
        AsyncStorage.setItem(`show_${showId}_active_view`, state.activeViewId);
    }
};

const setStoreState = (showId: string, updater: (prev: ShowViewsState) => ShowViewsState) => {
    const entry = stores.get(showId);
    if (!entry) return;
    entry.state = updater(entry.state);
    emit(entry);
    persist(showId, entry.state);
};

const ensureLoaded = (entry: StoreEntry, showId: string, showData: ShowData) => {
    if (entry.loadPromise) return;
    entry.loadPromise = (async () => {
        const performers = showData.getPerformers();
        let state: ShowViewsState;
        try {
            const [storedViews, storedActiveView] = await Promise.all([
                AsyncStorage.getItem(`show_${showId}_views`),
                AsyncStorage.getItem(`show_${showId}_active_view`),
            ]);
            const views: DrillView[] = storedViews ? JSON.parse(storedViews) : [makeDefaultView(performers)];
            state = {views, activeViewId: storedActiveView ?? views[0]?.id ?? null};
        } catch {
            state = {views: [makeDefaultView(performers)], activeViewId: 'default'};
        }
        entry.state = state;
        emit(entry);
    })();
};

// drop both the persisted views and the in-memory store, e.g. when a new
// version of the show is downloaded
export const clearShowViews = async (showId: string | number) => {
    const id = String(showId);
    stores.delete(id);
    await Promise.all([
        AsyncStorage.removeItem(`show_${id}_views`),
        AsyncStorage.removeItem(`show_${id}_active_view`),
    ]);
};

export const useShowViews = (showId: string | number | undefined, showData: ShowData | null) => {
    // normalize the id so consumers passing the route param (string) and
    // showData.getId() (bigint number from supabase) share one store entry
    const storeId = showId === undefined ? undefined : String(showId);
    const entry = storeId ? getStoreEntry(storeId) : null;

    const state = useSyncExternalStore(
        entry ? entry.subscribe : noopSubscribe,
        entry ? () => entry.state : () => EMPTY_STATE,
        () => EMPTY_STATE,
    );

    useEffect(() => {
        if (!entry || !storeId || !showData) return;
        ensureLoaded(entry, storeId, showData);
    }, [entry, storeId, showData]);

    const updateView = useCallback((viewId: string, updater: (view: DrillView) => DrillView) => {
        if (!storeId) return;
        setStoreState(storeId, prev => ({
            ...prev,
            views: prev.views?.map(view => view.id === viewId ? updater(view) : view) ?? null,
        }));
    }, [storeId]);

    const deleteView = useCallback((viewId: string) => {
        if (!storeId) return;
        setStoreState(storeId, prev => {
            if (!prev.views) return prev;
            const views = prev.views.filter(view => view.id !== viewId);
            const activeViewId = prev.activeViewId === viewId ? (views[0]?.id ?? null) : prev.activeViewId;
            return {...prev, views, activeViewId};
        });
    }, [storeId]);

    const addView = useCallback(() => {
        if (!storeId || !showData) return;
        setStoreState(storeId, prev => {
            const views = prev.views ?? [];
            return {
                ...prev,
                views: [...views, {
                    id: `view-${Date.now()}`,
                    name: `View ${views.length + 1}`,
                    sections: makeDefaultSections(showData.getPerformers()),
                    soloPerformerDot: false,
                }],
            };
        });
    }, [storeId, showData]);

    const setActiveViewId = useCallback((viewId: string | null) => {
        if (!storeId) return;
        setStoreState(storeId, prev => ({...prev, activeViewId: viewId}));
    }, [storeId]);

    return {
        views: state.views,
        activeViewId: state.activeViewId,
        updateView,
        deleteView,
        addView,
        setActiveViewId,
    };
};
