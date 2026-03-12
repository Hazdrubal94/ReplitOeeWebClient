import React, { createContext, useContext, useState } from "react";

interface CurrentReportContextType {
    reportId: string | null;
    setReportId: (id: string | null) => void;
}

const CurrentReportContext = createContext<CurrentReportContextType | undefined>(undefined);

export function CurrentReportProvider({ children }: { children: React.ReactNode }) {
    const [reportId, setReportId] = useState<string | null>(null);

    return (
        <CurrentReportContext.Provider value={{ reportId, setReportId }}>
            {children}
        </CurrentReportContext.Provider>
    );
}

export function useCurrentReport() {
    const context = useContext(CurrentReportContext);
    if (context === undefined) {
        throw new Error("useCurrentReport must be used within CurrentReportProvider");
    }
    return context;
}
