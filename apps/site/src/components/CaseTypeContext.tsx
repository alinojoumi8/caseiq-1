'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CaseId } from '@/content/examples';

interface CaseTypeValue {
  /** The case type the visitor chose with a hero chip, or null if they never chose. Intake step 1 reads this. */
  picked: CaseId | null;
  setPicked: (id: CaseId) => void;
}

const Ctx = createContext<CaseTypeValue | null>(null);

/** Holds the hero chip choice in React state. It is never written to the URL, storage or analytics. */
export function CaseTypeProvider({ children }: { children: ReactNode }) {
  const [picked, setPicked] = useState<CaseId | null>(null);
  const value = useMemo(() => ({ picked, setPicked }), [picked]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaseType(): CaseTypeValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCaseType must be used inside CaseTypeProvider');
  return v;
}
