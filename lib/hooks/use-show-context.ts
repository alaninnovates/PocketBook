import React, {createContext, useContext} from 'react'

export type ShowData = {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    selectedInstrument: string | null;
    setSelectedInstrument: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ShowContext = createContext<ShowData>({
    currentIndex: 0,
    setCurrentIndex: () => {},
    selectedInstrument: null,
    setSelectedInstrument: () => {},
})

export const useShowContext = () => useContext(ShowContext);