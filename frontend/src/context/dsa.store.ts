import { create } from 'zustand';

interface DSAProgress {
  sheetName: string;
  total: number;
  solved: number;
  progress: number;
}

interface DSAStore {
  selectedSheet: string;
  progress: Record<string, DSAProgress>;
  currentProblem: any | null;
  
  setSelectedSheet: (sheet: string) => void;
  setProgress: (sheet: string, data: DSAProgress) => void;
  setCurrentProblem: (problem: any) => void;
}

export const useDSAStore = create<DSAStore>((set) => ({
  selectedSheet: 'blind-75',
  progress: {},
  currentProblem: null,

  setSelectedSheet: (sheet) => set({ selectedSheet: sheet }),
  
  setProgress: (sheet, data) =>
    set((state) => ({
      progress: { ...state.progress, [sheet]: data },
    })),

  setCurrentProblem: (problem) => set({ currentProblem: problem }),
}));
