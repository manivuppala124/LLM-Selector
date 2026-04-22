import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, MessageSquare, Bot, BarChart2, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useFormStore } from "../store/formStore";
import { recommend } from "../api/models";

// ─── Step 1: Task Type ───────────────────────────────────────────────────────
const TASK_TYPES = [
  { id: "coding",   icon: Code2,         label: "Coding Assistant",    desc: "Code generation, review, debugging" },
  { id: "chat",     icon: MessageSquare, label: "Chat / Support Bot",  desc: "User-facing chatbots and support flows" },
  { id: "analysis", icon: BarChart2,     label: "RAG / QA & Analysis", desc: "Question answering over docs, data analysis" },
  { id: "agentic",  icon: Bot,           label: "Agents / Tools",      desc: "Tool-calling agents, workflows, automations" },
  { id: "general",  icon: Sparkles,      label: "Content Generation",  desc: "Blogs, marketing copy, creative writing" },
  { id: "other",    icon: Sparkles,      label: "Other / Mixed",       desc: "Mixed or experimental use cases" },
];

const MODALITIES = [
  { id: "text",  label: "Text",  desc: "Plain text prompts and responses" },
  { id: "code",  label: "Code",  desc: "Primarily code as input/output" },
  { id: "image", label: "Image", desc: "Images or screenshots as input" },
  { id: "audio", label: "Audio", desc: "Speech or audio as input" },
  { id: "video", label: "Video", desc: "Video frames / scenes as input" },
];

const FEATURES = [
  { id: "function_calling", label: "Function Calling", desc: "Tool / function use" },
  { id: "json_mode",        label: "JSON Mode",         desc: "Structured JSON output" },
];

const CONTEXT_OPTIONS = [
  { value: 0,      label: "Any" },
  { value: 8000,   label: "8K" },
  { value: 16000,  label: "16K" },
  { value: 32000,  label: "32K" },
  { value: 64000,  label: "64K" },
  { value: 128000, label: "128K" },
  { value: 200000, label: "200K+" },
];

const SIMPLE_OPTIONS = {
  input_data_type: ["text", "code", "image", "audio", "video"],
  output_format: ["text", "json", "schema", "tool_call"],
  accuracy_requirement: ["low", "medium", "high"],
  reasoning_complexity: ["simple", "medium", "complex"],
  latency_requirement: ["real-time", "interactive", "batch"],
  reliability_requirement: ["low", "medium", "high"],
};

// Step progress bar
function Steps({ current }) {
  const steps = ["Use Case", "Budget", "Speed/Quality", "Features", "Workload", "Review"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className={clsx(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            i + 1 < current  ? "bg-blue-600 text-white" :
            i + 1 === current ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-950" :
                               "bg-gray-800 text-gray-500"
          )}>
            {i + 1 < current ? "✓" : i + 1}
          </div>
          <span className={clsx("text-xs hidden sm:block", i + 1 === current ? "text-blue-300" : "text-gray-600")}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={clsx("h-px flex-1", i + 1 < current ? "bg-blue-600" : "bg-gray-800")} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RequirementsForm() {
  const navigate = useNavigate();
  const {
    step, use_case, budget, speed_vs_quality, required_features, min_context,
    input_data_type, input_size_avg_tokens, input_size_max_tokens, output_format, output_length,
    accuracy_requirement, reasoning_complexity, latency_requirement, throughput_requirement,
    reliability_requirement, fine_tuning_requirement, rag_usage, domain_specificity,
    setField, nextStep, prevStep, setResults,
  } = useFormStore();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const toggleFeature = (id) => {
    const current = required_features;
    setField(
      "required_features",
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await recommend({
        use_case,
        budget: budget === "" || budget === null ? null : Number(budget),
        speed_vs_quality,
        required_features,
        min_context,
        input_data_type: input_data_type || null,
        input_size_avg_tokens: input_size_avg_tokens ? Number(input_size_avg_tokens) : null,
        input_size_max_tokens: input_size_max_tokens ? Number(input_size_max_tokens) : null,
        output_format: output_format || null,
        output_length: output_length ? Number(output_length) : null,
        accuracy_requirement: accuracy_requirement || null,
        reasoning_complexity: reasoning_complexity || null,
        latency_requirement: latency_requirement || null,
        throughput_requirement: throughput_requirement ? Number(throughput_requirement) : null,
        reliability_requirement: reliability_requirement || null,
        fine_tuning_requirement,
        rag_usage,
        domain_specificity: domain_specificity || null,
      });
      setResults(data.results, data.user_summary);
      navigate("/results");
    } catch (e) {
      setError(e.response?.data?.detail || "Request failed. Make sure the backend is running and models are synced.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Find Your LLM</h1>
        <p className="text-gray-400 mt-1 text-sm">Answer a few questions to get personalised recommendations.</p>
      </div>

      <Steps current={step} />

      <div className="card min-h-[320px] flex flex-col">
        {/* ── Step 1: Task Type + Modality ───────────────────────────────── */}
        {step === 1 && (
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">What are you building?</h2>
              <p className="text-sm text-gray-400 mb-4">Choose the primary type of task.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TASK_TYPES.map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id + label}
                    type="button"
                    onClick={() => setField("use_case", id)}
                    className={clsx(
                      "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                      use_case === id
                        ? "bg-blue-600/10 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    )}
                  >
                    <Icon size={18} className={use_case === id ? "text-blue-400" : "text-gray-500"} />
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">What modality do you need?</h3>
              <p className="text-xs text-gray-400 mb-3">
                This helps us decide whether you need multimodal models (vision / audio / video).
              </p>
              <div className="flex flex-wrap gap-2">
                {MODALITIES.map(({ id, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setField("input_data_type", id)}
                    className={clsx(
                      "px-3 py-2 rounded-lg border text-left text-xs transition-colors",
                      input_data_type === id
                        ? "bg-blue-600/10 border-blue-500 text-blue-300"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    )}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Budget ─────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex-1 space-y-5">
            <h2 className="text-lg font-semibold text-white">What's your budget?</h2>
            <p className="text-sm text-gray-400">Set a maximum cost per 1M blended tokens. Leave blank for no limit.</p>
            <div>
              <label className="label">Max cost ($/1M tokens)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 5  — or leave blank for no limit"
                className="input"
                value={budget ?? ""}
                onChange={(e) => setField("budget", e.target.value === "" ? null : e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 2, 10, 30].map((v) => (
                <button
                  key={v}
                  onClick={() => setField("budget", v)}
                  className={clsx(
                    "py-2 rounded-lg text-sm border transition-colors",
                    Number(budget) === v
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  ${v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setField("budget", null)}
              className={clsx(
                "w-full py-2 rounded-lg text-sm border transition-colors",
                budget === null
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
              )}
            >
              No limit
            </button>
          </div>
        )}

        {/* ── Step 3: Speed vs Quality ───────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex-1 space-y-6">
            <h2 className="text-lg font-semibold text-white">Speed vs. Quality</h2>
            <p className="text-sm text-gray-400">Drag the slider to set your priority.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Fastest</span>
                <span>Balanced</span>
                <span>Highest Quality</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={speed_vs_quality}
                onChange={(e) => setField("speed_vs_quality", Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-400">{speed_vs_quality}</span>
                <span className="text-gray-500 text-sm ml-1">/ 100</span>
                <p className="text-xs text-gray-500 mt-1">
                  {speed_vs_quality < 30
                    ? "Prioritising speed — fastest models ranked higher"
                    : speed_vs_quality > 70
                    ? "Prioritising quality — best benchmark scores ranked higher"
                    : "Balanced — equal weight on speed and quality"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Features + Context ─────────────────────────────────────── */}
        {step === 4 && (
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Required Features</h2>
              <div className="space-y-2">
                {FEATURES.map(({ id, label, desc }) => {
                  const checked = required_features.includes(id);
                  return (
                    <label
                      key={id}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        checked ? "bg-blue-600/10 border-blue-600" : "bg-gray-800 border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(id)}
                        className="accent-blue-500 w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-200">{label}</div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-3">Minimum Context Window</h2>
              <div className="flex flex-wrap gap-2">
                {CONTEXT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setField("min_context", value)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                      min_context === value
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Review ─────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="flex-1 space-y-5">
            <h2 className="text-lg font-semibold text-white">Workload Details</h2>
            <p className="text-sm text-gray-400">These inputs help refine context, cost and quality trade-offs.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label="Input Data Type" value={input_data_type} onChange={(v) => setField("input_data_type", v)} options={SIMPLE_OPTIONS.input_data_type} />
              <SelectField label="Output Format" value={output_format} onChange={(v) => setField("output_format", v)} options={SIMPLE_OPTIONS.output_format} />
              <SelectField label="Accuracy Need" value={accuracy_requirement} onChange={(v) => setField("accuracy_requirement", v)} options={SIMPLE_OPTIONS.accuracy_requirement} />
              <SelectField label="Reasoning Complexity" value={reasoning_complexity} onChange={(v) => setField("reasoning_complexity", v)} options={SIMPLE_OPTIONS.reasoning_complexity} />
              <SelectField label="Latency Profile" value={latency_requirement} onChange={(v) => setField("latency_requirement", v)} options={SIMPLE_OPTIONS.latency_requirement} />
              <SelectField label="Reliability Need" value={reliability_requirement} onChange={(v) => setField("reliability_requirement", v)} options={SIMPLE_OPTIONS.reliability_requirement} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Avg Input Tokens" value={input_size_avg_tokens} onChange={(v) => setField("input_size_avg_tokens", v)} />
              <InputField label="Max Input Tokens" value={input_size_max_tokens} onChange={(v) => setField("input_size_max_tokens", v)} />
              <InputField label="Expected Output Tokens" value={output_length} onChange={(v) => setField("output_length", v)} />
              <InputField label="Throughput (req/min)" value={throughput_requirement} onChange={(v) => setField("throughput_requirement", v)} />
            </div>

            <div>
              <label className="label">Domain Focus (optional)</label>
              <input
                className="input"
                placeholder="e.g. coding, legal, finance, support"
                value={domain_specificity}
                onChange={(e) => setField("domain_specificity", e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <BooleanToggle
                label="Need Fine-Tuning Support"
                checked={fine_tuning_requirement}
                onToggle={() => setField("fine_tuning_requirement", !fine_tuning_requirement)}
              />
              <BooleanToggle
                label="RAG / Tool Usage"
                checked={rag_usage}
                onToggle={() => setField("rag_usage", !rag_usage)}
              />
            </div>
          </div>
        )}

        {/* ── Step 6: Review ─────────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="flex-1 space-y-4">
            <h2 className="text-lg font-semibold text-white">Review & Submit</h2>
            <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
              <Row label="Use Case"     value={use_case} />
              <Row label="Budget"       value={budget != null ? `$${budget}/1M tokens` : "No limit"} />
              <Row label="Speed/Quality" value={`${speed_vs_quality}/100 ${speed_vs_quality < 30 ? "(speed-first)" : speed_vs_quality > 70 ? "(quality-first)" : "(balanced)"}`} />
              <Row label="Features"     value={required_features.length ? required_features.join(", ") : "None required"} />
              <Row label="Min Context"  value={min_context ? `${min_context.toLocaleString()} tokens` : "Any"} />
              <Row label="Input Type"   value={input_data_type || "Not set"} />
              <Row label="Output Format" value={output_format || "Not set"} />
              <Row label="Accuracy / Reasoning" value={`${accuracy_requirement || "n/a"} / ${reasoning_complexity || "n/a"}`} />
              <Row label="Latency / Throughput" value={`${latency_requirement || "n/a"} / ${throughput_requirement || "n/a"}`} />
              <Row label="Fine-tuning / RAG" value={`${fine_tuning_requirement ? "yes" : "no"} / ${rag_usage ? "yes" : "no"}`} />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Finding matches…" : "Get Recommendations"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-800">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Back
          </button>

          {step < 6 && (
            <button
              onClick={nextStep}
              disabled={step === 1 && (!use_case || !input_data_type)}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              Next <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value || ""} onChange={(e) => onChange(e.target.value || "")}>
        <option value="">Not set</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        min="0"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}

function BooleanToggle({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "text-left rounded-lg border px-3 py-2 text-sm transition-colors",
        checked ? "bg-blue-600/10 border-blue-500 text-blue-300" : "bg-gray-800 border-gray-700 text-gray-300"
      )}
    >
      {label}: <span className="font-semibold">{checked ? "Enabled" : "Disabled"}</span>
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium capitalize text-right">{value}</span>
    </div>
  );
}
