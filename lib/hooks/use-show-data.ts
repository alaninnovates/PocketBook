import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {DotData, TempoData} from "@/lib/types";

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
    private dot_data: DotData | object
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

    public getCounts(): Count[] {
        if (this.upload_type === 'pocketbook') {
            return [];
        } else if (this.upload_type === '3da') {
            return [];
        }
        return [];
    }

    public getCoordAtCount(set: string, label: string, count: number): Coordinate {
    }

    public getCoordForPerformer(set: string, label: string): Coordinate {
    }

    public getCoordsForPerformer(label: string) {
        return this.getSets().map(({name}) => this.getCoordForPerformer(name, label));
    }

    public getPerformerCoordsForSet(set: string) {
        return this.getPerformers().map((performer) => ({
            coord: this.getCoordForPerformer(set, performer.label),
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
    tempo_data: object;
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