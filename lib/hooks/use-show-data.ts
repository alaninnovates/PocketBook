import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {parsePyware3DAFile, parsePywareSNCFile} from "pyware-parser";

type Pyware3DAFile = ReturnType<typeof parsePyware3DAFile>;
type PywareSNCFile = ReturnType<typeof parsePywareSNCFile>;

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
    MinorHash = 'minorHash',
    YardTick = 'yardTick'
}

export interface GridLine {
    direction: 'horizontal' | 'vertical';
    type: GridLineType;
    position: number;
    label: string;
    showMarker: boolean;
}

export enum Unit {
    Yards,
    Meters,
    Feet
}

export enum MeasureDirection {
    Inward,
    Outward
}

export interface FieldMetadata {
    units: Unit;
    dimensions: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    divisions: {
        topBottom: {
            steps: number;
            perUnit: number;
        }
        leftRight: {
            steps: number;
            perUnit: number;
        }
    };
    measureDirection: MeasureDirection;
    markers: {
        front: {
            distance: number;
            size: number;
        };
        back: {
            distance: number;
            flipOrientation: boolean;
        };
    }
}

export class ShowData {
    private id: string
    private name: string
    private created_at: string
    private updated_at: string
    private dot_data: Pyware3DAFile;
    private tempo_data: PywareSNCFile;
    private upload_type: '3da'

    constructor(data: ShowDataPyware) {
        this.id = data.id;
        this.name = data.name;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.dot_data = data.dot_data;
        this.tempo_data = data.tempo_data;
        this.upload_type = data.upload_type;
    }

    public getId(): string {
        return this.id;
    }

    public getUpdatedAt(): Date {
        return new Date(this.updated_at);
    }

    public getPerformers(): {
        label: string;
        symbol: string;
        performer: string;
    }[] {
        if (this.upload_type === '3da') {
            return (this.dot_data as Pyware3DAFile).cast.castMembers.map(m => ({
                label: m.label,
                symbol: m.name.at(0)!,
                performer: m.name
            }));
        }
        return [];
    }

    public getSets(): SetMetadata[] {
        if (this.upload_type === '3da') {
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
        if (this.upload_type === '3da') {
            return (this.dot_data as Pyware3DAFile).pages.arrayLength;
        }
        return 0;
    }

    public getSetIndexAtCount(count: number): number | null {
        if (this.upload_type === '3da') {
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
        if (this.upload_type === '3da') {
            // console.log('set index:', setIndex);
            return (this.dot_data as Pyware3DAFile).productionTab.productionTabEntries[setIndex]?.count;
        }
        return null;
    }

    private getPywarePerformerIdForLabel(label: string): number | null {
        if (this.upload_type === '3da') {
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
        if (this.upload_type === '3da') {
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

    public getFieldMetadata(): FieldMetadata {
        if (this.upload_type === '3da') {
            const gridData = (this.dot_data as Pyware3DAFile).gridPattern.gridData;
            return {
                units: gridData.unit.type,
                dimensions: {
                    left: gridData.border.left,
                    right: gridData.border.right,
                    top: gridData.border.top,
                    bottom: gridData.border.bottom
                },
                divisions: {
                    topBottom: {
                        steps: gridData.grid.topBottom.steps,
                        perUnit: gridData.grid.topBottom.perUnit
                    },
                    leftRight: {
                        steps: gridData.grid.leftRight.steps,
                        perUnit: gridData.grid.leftRight.perUnit
                    }
                },
                measureDirection: gridData.unit.direction,
                markers: {
                    front: {
                        distance: gridData.frontMarker.distance,
                        size: gridData.frontMarker.size
                    },
                    back: {
                        distance: gridData.backMarker.distance,
                        flipOrientation: gridData.backMarker.flipOrientation
                    }
                }
            }
        }
        return {
            dimensions: {bottom: 0, left: 0, right: 0, top: 0},
            divisions: {leftRight: {perUnit: 0, steps: 0}, topBottom: {perUnit: 0, steps: 0}},
            markers: {back: {distance: 0, flipOrientation: false}, front: {distance: 0, size: 0}},
            measureDirection: MeasureDirection.Inward,
            units: Unit.Yards
        }
    }

    public getGridData(): {
        lines: GridLine[];
    } {
        if (this.upload_type === '3da') {
            const gridData = (this.dot_data as Pyware3DAFile).gridPattern.gridData;
            const lines: GridLine[] = [];
            gridData.horizontalGridLines.forEach(line => {
                lines.push({
                    direction: 'horizontal',
                    type: line.type,
                    position: line.distance,
                    label: line.label || '',
                    showMarker: line.showMarker || false
                });
            });
            gridData.verticalGridLines.forEach(line => {
                lines.push({
                    direction: 'vertical',
                    type: line.type,
                    position: line.distance,
                    label: line.label || '',
                    showMarker: line.showMarker || false
                });
            });
            return {lines};
        }
        return {lines: []};
    }

    public getTempoData(): PywareSNCFile | null {
        if (this.upload_type === '3da') {
            return this.tempo_data;
        }
        return null;
    }

    // time in seconds, starting at the time of startCount + time
    public getCurrentCountForTime(startCount: number, time: number): number {
        if (this.upload_type === '3da') {
            const tempoData = this.getTempoData();
            if (tempoData) {
                const startTime = tempoData.timestamps[startCount] || 0;
                const targetTime = startTime + time;
                for (let i = startCount; i < tempoData.timestamps.length; i++) {
                    if (tempoData.timestamps[i] >= targetTime) {
                        return i;
                    }
                }
            }
        }
        return 0;
    }

    public getTimeForCount(count: number): number {
        if (this.upload_type === '3da') {
            const tempoData = this.getTempoData();
            if (tempoData) {
                return tempoData.timestamps[count] || 0;
            }
        }
        return 0;
    }

    public getAnimationBPM(): number {
        if (this.upload_type === '3da') {
            return this.dot_data.generalInfo.animationFixedTempoBPM;
        }
        return 120;
    }
}

interface ShowDataBase {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ShowDataPyware extends ShowDataBase {
    dot_data: Pyware3DAFile;
    tempo_data: PywareSNCFile;
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