import { create } from "zustand";

const DEFAULT = {
  step: 1,
  use_case: "",
  budget: null,
  speed_vs_quality: 50,
  required_features: [],
  min_context: 0,
  input_data_type: "",
  input_size_avg_tokens: null,
  input_size_max_tokens: null,
  output_format: "",
  output_length: null,
  accuracy_requirement: "",
  reasoning_complexity: "",
  latency_requirement: "",
  throughput_requirement: null,
  reliability_requirement: "",
  fine_tuning_requirement: false,
  rag_usage: false,
  domain_specificity: "",
  privacy_requirement: "",
  deployment_constraints: [],
  integration_constraints: [],
  results: null,
  user_summary: "",
};

export const useFormStore = create((set) => ({
  ...DEFAULT,
  setField: (key, value) => set({ [key]: value }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 6) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setResults: (results, user_summary) => set({ results, user_summary }),
  reset: () => set(DEFAULT),
}));
