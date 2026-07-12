import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {DotData, TempoData} from "@/lib/types";
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
    private dot_data: DotData | Pyware3DAFile;
    private tempo_data: TempoData | PywareSNCFile;
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
    /*

  "gridPattern": {
    "gridPatternHeader": "GRD1",
    "sectionSizeBytes": 1325,
    "field_4929": 2,
    "size": 89,
    "gridData": {
      "horizontalGridLines": [
        {
          "type": "divisionLine",
          "distance": -27.083334,
          "showMarker": false,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 26.25,
          "showMarker": false,
          "label": ""
        },
        {
          "type": "subDivisionLine",
          "distance": -8.75
        },
        {
          "type": "subDivisionLine",
          "distance": 23.75
        },
        {
          "type": "subDivisionLine",
          "distance": 13.75
        },
        {
          "type": "subDivisionLine",
          "distance": -21.25
        },
        {
          "type": "subDivisionLine",
          "distance": -18.75
        },
        {
          "type": "subDivisionLine",
          "distance": -16.25
        },
        {
          "type": "subDivisionLine",
          "distance": -13.75
        },
        {
          "type": "subDivisionLine",
          "distance": -11.25
        },
        {
          "type": "subDivisionLine",
          "distance": -6.25
        },
        {
          "type": "subDivisionLine",
          "distance": -3.75
        },
        {
          "type": "subDivisionLine",
          "distance": -1.25
        },
        {
          "type": "subDivisionLine",
          "distance": 1.25
        },
        {
          "type": "subDivisionLine",
          "distance": 3.75
        },
        {
          "type": "subDivisionLine",
          "distance": 6.25
        },
        {
          "type": "subDivisionLine",
          "distance": 16.25
        },
        {
          "type": "subDivisionLine",
          "distance": 18.75
        },
        {
          "type": "subDivisionLine",
          "distance": 21.25
        },
        {
          "type": "subDivisionLine",
          "distance": 11.25
        },
        {
          "type": "subDivisionLine",
          "distance": -23.75
        },
        {
          "type": "subDivisionLine",
          "distance": 8.75
        },
        {
          "type": "yardTick",
          "distance": -10
        },
        {
          "type": "yardTick",
          "distance": -26.458334
        },
        {
          "type": "majorHash",
          "distance": -9.666667,
          "label": ""
        },
        {
          "type": "majorHash",
          "distance": 8.75,
          "label": ""
        },
        {
          "type": "yardTick",
          "distance": 25.625
        },
        {
          "type": "yardTick",
          "distance": 9
        }
      ],
      "verticalGridLines": [
        {
          "type": "divisionLine",
          "distance": -50,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -45,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -40,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -35,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -30,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -25,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -20,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -15,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -10,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": -5,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 0,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 5,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 10,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 15,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 20,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 25,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 30,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 35,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 40,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 45,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "divisionLine",
          "distance": 50,
          "showMarker": true,
          "label": ""
        },
        {
          "type": "subDivisionLine",
          "distance": -47.5
        },
        {
          "type": "subDivisionLine",
          "distance": -42.5
        },
        {
          "type": "subDivisionLine",
          "distance": -37.5
        },
        {
          "type": "subDivisionLine",
          "distance": -32.5
        },
        {
          "type": "subDivisionLine",
          "distance": -27.5
        },
        {
          "type": "subDivisionLine",
          "distance": -22.5
        },
        {
          "type": "subDivisionLine",
          "distance": -17.5
        },
        {
          "type": "subDivisionLine",
          "distance": -12.5
        },
        {
          "type": "subDivisionLine",
          "distance": -7.5
        },
        {
          "type": "subDivisionLine",
          "distance": -2.5
        },
        {
          "type": "subDivisionLine",
          "distance": 2.5
        },
        {
          "type": "subDivisionLine",
          "distance": 7.5
        },
        {
          "type": "subDivisionLine",
          "distance": 12.5
        },
        {
          "type": "subDivisionLine",
          "distance": 17.5
        },
        {
          "type": "subDivisionLine",
          "distance": 22.5
        },
        {
          "type": "subDivisionLine",
          "distance": 27.5
        },
        {
          "type": "subDivisionLine",
          "distance": 32.5
        },
        {
          "type": "subDivisionLine",
          "distance": 37.5
        },
        {
          "type": "subDivisionLine",
          "distance": 42.5
        },
        {
          "type": "subDivisionLine",
          "distance": 47.5
        }
      ],
      "version": "0 0",
      "title": "/Users/timothymcafee/Documents/Pyware 3D/Layouts/True HS Grid.grd",
      "unit": {
        "type": 0,
        "direction": 0
      },
      "grid": {
        "topBottom": {
          "steps": 8,
          "perUnit": 5
        },
        "leftRight": {
          "steps": 8,
          "perUnit": 5
        },
        "style": 1,
        "resolution": 1,
        "gridLineColor": {
          "r": 200,
          "g": 255,
          "b": 255
        }
      },
      "perspectiveBackgroundColor": {
        "r": 240,
        "g": 240,
        "b": 240
      },
      "perspectiveLineColor": {
        "r": 255,
        "g": 255,
        "b": 255
      },
      "standColors": {
        "homeStandColor": {
          "r": 0,
          "g": 96,
          "b": 96
        },
        "visitorStandColor": {
          "r": 96,
          "g": 0,
          "b": 96
        }
      },
      "measureFromStageFront": true,
      "border": {
        "left": -50,
        "top": -27.083334,
        "right": 50,
        "bottom": 26.25,
        "backgroundColor": {
          "r": 255,
          "g": 255,
          "b": 255
        }
      },
      "majorLineColor": {
        "r": 64,
        "g": 64,
        "b": 64
      },
      "minorLineColor": {
        "r": 88,
        "g": 190,
        "b": 215
      },
      "hashLineColor": {
        "r": 64,
        "g": 64,
        "b": 64
      },
      "frontMarker": {
        "unknownValue": -2,
        "distance": 8.039847,
        "size": 2,
        "color": {
          "r": 192,
          "g": 192,
          "b": 192
        }
      },
      "backMarker": {
        "distance": 8.039847,
        "flipOrientation": true
      },
      "groundPath": "",
      "venue": "9001",
      "sky": "11001",
      "markingFont": "dialog",
      "lineWeights": {
        "sideline": 1.25,
        "endzone": 1.25,
        "divisionLine": 1.25,
        "subDivisionLine": 1.1,
        "stepGrid": 2,
        "hashAndTick": 1
      }
    }
  },
     */
    public getFieldMetadata(): FieldMetadata {
        if (this.upload_type === 'pocketbook') {

        } else if (this.upload_type === '3da') {
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
        return {}
    }

    public getGridData(): {
        lines: GridLine[];
    } {
        if (this.upload_type === 'pocketbook') {
            return {lines: []};
        } else if (this.upload_type === '3da') {
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