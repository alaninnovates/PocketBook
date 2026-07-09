import {PropsWithChildren, useState} from "react";
import {ShowContext} from "@/lib/hooks/use-show-context";

export default function ShowProvider({children}: PropsWithChildren) {
    const [currentCount, setCurrentCount] = useState(0);
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

    return (
        <ShowContext.Provider value={{
            currentCount,
            setCurrentCount,
            selectedInstrument,
            setSelectedInstrument,
        }}>
            {children}
        </ShowContext.Provider>
    );
}