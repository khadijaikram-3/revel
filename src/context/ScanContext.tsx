import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ScanData } from '../types/scan';

interface ScanContextValue {
  scanData: ScanData | null;
  setScanData: (data: ScanData | null) => void;
  lastScanId: string | null;
  setLastScanId: (id: string | null) => void;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [lastScanId, setLastScanId] = useState<string | null>(null);

  return (
    <ScanContext.Provider value={{ scanData, setScanData, lastScanId, setLastScanId }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
