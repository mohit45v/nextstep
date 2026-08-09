"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CompanyTestPack } from "@/data/aptitudeData";
import type { ExamResults } from "@/types";

/**
 * Holds the in-flight exam across route changes.
 *
 * Previously these lived in `app/page.tsx` useState, which only worked because
 * every screen was one component. Now that /aptitude/exam and /aptitude/review
 * are real routes, the selected pack and the results need a provider that sits
 * above both of them in the layout.
 *
 * This is deliberately in-memory: a hard refresh mid-exam clears it and the
 * pages fall back to a "pick a test" state. Persisting attempts to the database
 * is a later phase.
 */
interface AptitudeSessionValue {
  selectedExamPack: CompanyTestPack | null;
  setSelectedExamPack: (pack: CompanyTestPack | null) => void;
  lastExamResults: ExamResults | null;
  setLastExamResults: (results: ExamResults | null) => void;
}

const AptitudeSessionContext = createContext<AptitudeSessionValue | null>(null);

export function AptitudeSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedExamPack, setSelectedExamPack] = useState<CompanyTestPack | null>(
    null,
  );
  const [lastExamResults, setLastExamResults] = useState<ExamResults | null>(null);

  const value = useMemo(
    () => ({
      selectedExamPack,
      setSelectedExamPack,
      lastExamResults,
      setLastExamResults,
    }),
    [selectedExamPack, lastExamResults],
  );

  return (
    <AptitudeSessionContext value={value}>{children}</AptitudeSessionContext>
  );
}

export function useAptitudeSession() {
  const context = useContext(AptitudeSessionContext);
  if (!context) {
    throw new Error(
      "useAptitudeSession must be used inside <AptitudeSessionProvider>",
    );
  }
  return context;
}
