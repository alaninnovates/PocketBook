import React, {createContext, useContext} from 'react'

export type ShowData = {
    currentCount: number;
    setCurrentCount: React.Dispatch<React.SetStateAction<number>>;
    selectedInstrument: string | null;
    setSelectedInstrument: React.Dispatch<React.SetStateAction<string | null>>;
    defaultInstrument: string | null;
    setDefaultInstrument: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ShowContext = createContext<ShowData>({
    currentCount: 0,
    setCurrentCount: () => {},
    selectedInstrument: null,
    setSelectedInstrument: () => {},
    defaultInstrument: null,
    setDefaultInstrument: () => {},
})

export const useShowContext = () => useContext(ShowContext);