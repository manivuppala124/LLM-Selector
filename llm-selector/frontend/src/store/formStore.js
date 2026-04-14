import { create } from "zustand";

const DEFAULT = {
  step: 1,
  use_case: "",
  budget: null,
  speed_vs_quality: 50,
  required_features: [],
  min_context: 0,
  results: null,
  user_summary: "",
};

export const useFormStore = create((set) => ({
  ...DEFAULT,
  setField: (key, value) => set({ [key]: value }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setResults: (results, user_summary) => set({ results, user_summary }),
  reset: () => set(DEFAULT),
}));
