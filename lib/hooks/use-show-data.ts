import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {DotData, TempoData} from "@/lib/types";
import {parsePyware3DAFile} from "pyware-parser";

type Pyware3DAFile = ReturnType<typeof parsePyware3DAFile>;

export interface Count {
    number: number;
    time: number; // (seconds)
}

export interface Coordinate {
    // center is (0, 0)
    // right is positive x, down is positive y
    x: number;
    y: number;
}

export interface SetMetadata {
    name: string;
    counts: number;
    measures: string;
    subset: boolean;
    title: string;
    notes: string[];
}

export enum GridLineType {
    DivisionLine = 'divisionLine',
    SubDivisionLine = 'subDivisionLine',
    MajorHash = 'majorHash',
    MinorHash = 'minorHash'
}

export interface GridLine {
    direction: 'horizontal' | 'vertical';
    type: GridLineType;
    position: number;
    label: string;
    showMarker: boolean;
}

export class ShowData {
    private id: string
    private name: string
    private created_at: string
    private updated_at: string
    private dot_data: DotData | Pyware3DAFile;
    private tempo_data: TempoData | object
    private upload_type: 'pocketbook' | '3da'

    constructor(data: ShowDataPocketbook | ShowDataPyware) {
        this.id = data.id;
        this.name = data.name;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.dot_data = data.dot_data;
        this.tempo_data = data.tempo_data;
        this.upload_type = data.upload_type;
    }

    public getPerformers(): {
        label: string;
        symbol: string;
        performer: string;
    }[] {
        if (this.upload_type === 'pocketbook') {
            return [];
        } else if (this.upload_type === '3da') {
            return [];
        }
        return [];
    }

    public getSets(): SetMetadata[] {
        if (this.upload_type === 'pocketbook') {
            return [];
        } else if (this.upload_type === '3da') {
            return [];
        }
        return [];
    }

    public getTotalCounts(): number {}

    public getCounts(): Count[] {
        if (this.upload_type === 'pocketbook') {
            return [];
        } else if (this.upload_type === '3da') {
            return [];
        }
        return [];
    }

    public getSetAtCount(count: number): SetMetadata | null {
        if (this.upload_type === 'pocketbook') {
            return {};
        } else if (this.upload_type === '3da') {
            return {};
        }
        return null;
    }

    public getSetIndexAtCount(count: number): number | null {
        if (this.upload_type === 'pocketbook') {
            return null;
        } else if (this.upload_type === '3da') {
            return null;
        }
        return null;
    }

    public getCountAtSetIndex(setIndex: number): number | null {
        if (this.upload_type === 'pocketbook') {
            return null;
        } else if (this.upload_type === '3da') {
            return null;
        }
        return null;
    }


    private getPywarePerformerIdForLabel(label: string): number | null {
        if (this.upload_type === '3da') {
            const performer = (this.dot_data as Pyware3DAFile).cast.castMembers.find(m => m.label === label);
            if (performer) {
                return performer.id;
            } else {
                return null;
            }
        }
        return null;
    }

    public getSetAtCount(count: number): SetMetadata | null {}

    // count: zero-indexed
    public getCoordAtCount(count: number, label: string): Coordinate {
        if (this.upload_type === 'pocketbook') {
            return {};
        } else if (this.upload_type === '3da') {
            const performerId = this.getPywarePerformerIdForLabel(label);
            const position = (this.dot_data as Pyware3DAFile).pages.pages[count].performerPositionList.positions.find(p => p.id === performerId);
            return {
                x: position?.x!,
                y: position?.y!,
            }
        }
        return null;
    }

    public getCoordsForPerformer(label: string) {
        const setsWithCounts: (SetMetadata & {totalCounts: number})[] = [];
        for (const set of this.getSets()) {
            const totalCounts = setsWithCounts.reduce((sum, s) => sum + s.counts, 0) + set.counts;
            setsWithCounts.push({
                ...set,
                totalCounts
            });
        }

        return setsWithCounts.map(({totalCounts, ...meta}) => ({
            coord: this.getCoordAtCount(totalCounts, label),
            totalCounts,
            set: meta
        }));
    }

    public getPerformerCoordsForCount(count: number) {
        return this.getPerformers().map((performer) => ({
            coord: this.getCoordAtCount(count, performer.label),
            performer
        }));
    }

    public getGridData(): {
        lines: GridLine[];
    } {
        return {};
    }
}

interface ShowDataBase {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ShowDataPocketbook extends ShowDataBase {
    dot_data: DotData;
    tempo_data: TempoData;
    upload_type: 'pocketbook';
}

export interface ShowDataPyware extends ShowDataBase {
    dot_data: object;
    tempo_data: Pyware3DAFile;
    upload_type: '3da';
}

export const useShowData = (id: string, useCached = false) => {
    const router = useRouter();
    const [showData, setShowData] = useState<ShowData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDataFromAsyncStorage = async () => {
            const storedShow = await AsyncStorage.getItem(`show_${id}`);
            if (storedShow) {
                setShowData(new ShowData(JSON.parse(storedShow)));
                return true;
            } else {
                return false;
            }
        }

        const fetchShowData = async () => {
            const {data, error} = await supabase
                .from('shows')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('err fetching show data:', error);
                if (error.message === 'TypeError: Network request failed') {
                    if (!(await fetchDataFromAsyncStorage())) {
                        router.push('/shows');
                    }
                }
            } else {
                setShowData(new ShowData(data));
            }
            setLoading(false);
        }
        if (useCached) {
            fetchDataFromAsyncStorage();
            setLoading(false);
        } else {
            fetchShowData();
        }
    }, [id]);

    return {showData, loading};
}