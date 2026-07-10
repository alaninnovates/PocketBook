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
            return (this.dot_data as Pyware3DAFile).cast.castMembers.map(m => ({
                label: m.label,
                symbol: m.name.at(0)!,
                performer: m.name
            }));
        }
        return [];
    }

    public getSets(): SetMetadata[] {
        if (this.upload_type === 'pocketbook') {
            return [];
        } else if (this.upload_type === '3da') {
            let currentSet = (this.dot_data as Pyware3DAFile).generalInfo.firstSet - 1;
            let currentLetter = 65; // 'A'
            return (this.dot_data as Pyware3DAFile).productionTab.productionTabEntries.map(entry => {
                if (entry.tabType === 0) {
                    currentSet++;
                    currentLetter = 65;
                }
                return {
                    name: currentSet.toString() + (entry.tabType === 1 ? String.fromCharCode(currentLetter++) : ''),
                    counts: entry.count,
                    measures: entry.measures,
                    subset: entry.tabType === 1,
                    title: entry.title,
                    notes: [
                        entry.note1,
                        entry.note2,
                        entry.note3,
                        entry.note4,
                        entry.note5,
                    ]
                }
            })
        }
        return [];
    }

    public getTotalCounts(): number {
        if (this.upload_type === 'pocketbook') {
            return 0;
        } else if (this.upload_type === '3da') {
            return (this.dot_data as Pyware3DAFile).pages.arrayLength;
        }
        return 0;
    }

    public getSetIndexAtCount(count: number): number | null {
        if (this.upload_type === 'pocketbook') {
            return null;
        } else if (this.upload_type === '3da') {
            const pTabEntries = (this.dot_data as Pyware3DAFile).productionTab.productionTabEntries;
            // find first ptab entry where count is less than or equal to the count
            for (let i = 0; i < pTabEntries.length; i++) {
                if (count <= pTabEntries[i].count) {
                    return i;
                }
            }
        }
        return null;
    }

    public getCountAtSetIndex(setIndex: number): number | null {
        if (this.upload_type === 'pocketbook') {
            return null;
        } else if (this.upload_type === '3da') {
            // console.log('set index:', setIndex);
            return (this.dot_data as Pyware3DAFile).productionTab.productionTabEntries[setIndex]?.count;
        }
        return null;
    }

    private getPywarePerformerIdForLabel(label: string): number | null {
        if (this.upload_type === 'pocketbook') {
            return null;
        } else if (this.upload_type === '3da') {
            const performer = (this.dot_data as Pyware3DAFile).cast.castMembers.find(m => m.name === label);
            if (performer) {
                return performer.id;
            } else {
                return null;
            }
        }
        return null;
    }

    // count: zero-indexed
    public getCoordAtCount(count: number, label: string): Coordinate {
        if (this.upload_type === 'pocketbook') {
            return {x: 0, y: 0};
        } else if (this.upload_type === '3da') {
            // console.log('total counts:', this.getTotalCounts());
            // console.log('count:', count, 'label:', label);
            const performerId = this.getPywarePerformerIdForLabel(label);
            // console.log('performerId:', performerId);
            const position = (this.dot_data as Pyware3DAFile).pages.pages[count].performerPositionList.positions.find(p => p.id === performerId);
            return {
                x: position?.x!,
                y: position?.y!,
            }
        }
        return {x: 0, y: 0};
    }

    public getCoordsForPerformer(label: string) {
        return this.getSets().map(set => ({
            coord: this.getCoordAtCount(set.counts, label),
            set
        }));
    }

    public getPerformerCoordsForCount(count: number) {
        return this.getPerformers().map((performer) => ({
            coord: this.getCoordAtCount(count, performer.performer),
            performer
        }));
    }

    // public getGridData(): {
    //     lines: GridLine[];
    // } {
    //     return {};
    // }
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
    dot_data: Pyware3DAFile;
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