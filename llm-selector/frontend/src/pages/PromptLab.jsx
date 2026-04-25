import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FlaskConical, Loader2, Plus, X } from "lucide-react";
import { getModels, runPromptLab, getPromptLabHistory } from "../api/models";

const EXAMPLE_PROMPTS = [
  "You are evaluating models for a production support assistant. Use ONLY the policy below.\n\nPolicy:\n- Refund allowed within 30 days of delivery.\n- Subscription plans can be canceled anytime, but no prorated refund after billing date.\n- Hardware accessories have 1-year replacement warranty for manufacturing defects only.\n- Enterprise contracts require account-manager approval for credits.\n\nCustomer question:\n\"I bought headphones 45 days ago and the left ear stopped working. I also forgot to cancel my subscription 3 days after renewal. Can I get both refunds today?\"\n\nReturn EXACTLY this JSON schema:\n{\n  \"final_answer\": \"string\",\n  \"decision\": {\n    \"headphones_refund\": \"approve|deny|needs_more_info\",\n    \"subscription_refund\": \"approve|deny|needs_more_info\"\n  },\n  \"policy_citations\": [\"quote exact policy lines used\"],\n  \"risk_flags\": [\"possible misunderstanding or compliance risk\"],\n  \"confidence\": 0\n}\nDo not add markdown.",
  "You are given an incident timeline.\n\nTimeline:\n09:02 deploy v2.8.1\n09:07 error rate rises from 0.3% to 8.9%\n09:11 checkout API p95 latency jumps from 280ms to 3100ms\n09:14 database CPU 96%, connection pool saturation alerts fire\n09:20 rollback started\n09:27 error rate returns to baseline\n\nTask:\n1) Provide 5 bullet summary.\n2) Provide immediate actions for engineering, support, and product.\n3) Provide a root-cause hypothesis and two alternative hypotheses.\n4) Provide a 24-hour verification plan.\n\nFormat strictly as:\nSUMMARY:\n- ...\nACTIONS:\n- engineering: ...\n- support: ...\n- product: ...\nHYPOTHESES:\n- primary: ...\n- alternative_1: ...\n- alternative_2: ...\nVERIFY_24H:\n- ...",
  "Debug and patch task.\n\nPython function:\n```python\ndef next_palindrome(digits):\n    n = int(''.join(map(str, digits)))\n    while True:\n        n += 1\n        if str(n) == str(n)[::-1]:\n            return list(map(int, str(n)))\n```\n\nFailing tests:\n- input [1,2,9,3,2,1] expected [1,3,0,0,3,1] got [1,2,9,9,2,1]\n- input [9,9,9] expected [1,0,0,1] got timeout\n- input [0,0,7] expected validation error got [0,0,8]\n\nReturn exactly 3 sections:\n1) ROOT_CAUSE (max 120 words)\n2) PATCH (unified diff)\n3) SIDE_EFFECTS (3 bullet points)\nNo extra sections.",
  "Convert this unstructured business requirement into strict JSON.\n\nRequirement text:\n\"We need to launch an AI onboarding assistant for SMB customers by 30 Sep 2026. Budget cap is $300,000 all-in. The assistant must integrate with our existing CRM and support English + Spanish at launch. Assume current auth and billing services can be reused. Major risks are weak prompt quality, legal review delays, and low adoption by sales reps. Success means: reduce onboarding ticket volume by 25% within 60 days, CSAT >= 4.4/5, and median first-response time under 2 minutes.\"\n\nReturn ONLY valid JSON with this schema:\n{\n  \"goal\": \"string\",\n  \"constraints\": [\"string\"],\n  \"assumptions\": [\"string\"],\n  \"risks\": [\"string\"],\n  \"success_metrics\": [\"string\"]\n}\nNo markdown, no commentary.",
];

const EXAMPLE_SYSTEM_PROMPTS = [
  "You are a strict enterprise assistant. Follow instructions exactly, avoid speculation, and state assumptions explicitly when required.",
  "You are a senior software engineer reviewer. Be concise, prioritize correctness, and output actionable results over explanations.",
  "You are a JSON-only assistant. Always return valid JSON. Never use markdown, code fences, or additional commentary.",
  "You are a policy-compliance copilot. Use only provided policy context, cite relevant policy lines, and clearly flag uncertain cases.",
];

function formatCost(value) {
  const n = Number(value || 0);
  return `$${n.toFixed(6)}`;
}

export default function PromptLab() {
  const location = useLocation();
  const preselected = location.state?.preselectedModelIds || [];

  const [allModels, setAllModels] = useState([]);
  const [selectedModelIds, setSelectedModelIds] = useState([]);
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [loadingModels, setLoadingModels] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initial = Array.isArray(preselected) ? preselected.slice(0, 5) : [];
    if (initial.length > 0) {
      setSelectedModelIds(initial);
    }
  }, [preselected]);

  useEffect(() => {
    const loadAllModels = async () => {
      const batch = 500;
      let skip = 0;
      let total = Infinity;
      const collected = [];

      while (skip < total) {
        const r = await getModels({ limit: batch, skip });
        const models = r.data.models || [];
        total = Number(r.data.total || models.length);
        collected.push(...models);
        skip += models.length;
        if (models.length === 0) break;
      }

      return collected;
    };

    loadAllModels()
      .then((models) => {
        const sorted = models.sort((a, b) => a.name.localeCompare(b.name));
        setAllModels(sorted);
      })
      .catch(() => setError("Failed to load models"))
      .finally(() => setLoadingModels(false));

    getPromptLabHistory({ limit: 10 })
      .then((r) => setHistory(r.data.history || []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return allModels.filter(
      (m) =>
        !selectedModelIds.includes(m.id) &&
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.provider || "").toLowerCase().includes(search.toLowerCase()))
    );
  }, [allModels, search, selectedModelIds]);

  const addModel = (id) => {
    if (selectedModelIds.length >= 5) return;
    setSelectedModelIds((prev) => [...prev, id]);
  };

  const removeModel = (id) => {
    setSelectedModelIds((prev) => prev.filter((m) => m !== id));
  };

  const handleRun = async () => {
    setError("");
    setResults([]);
    setActiveHistoryId(null);
    if (!prompt.trim()) {
      setError("Prompt is required");
      return;
    }
    if (selectedModelIds.length < 1) {
      setError("Select at least one model");
      return;
    }

    setRunning(true);
    try {
      const { data } = await runPromptLab({
        model_ids: selectedModelIds,
        prompt,
        system_prompt: systemPrompt,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
      });
      setResults(data.results || []);
      getPromptLabHistory({ limit: 10 })
        .then((r) => setHistory(r.data.history || []))
        .catch(() => {});
    } catch (e) {
      setError(e.response?.data?.detail || "Prompt run failed");
    } finally {
      setRunning(false);
    }
  };

  const loadFromHistory = (entry) => {
    setError("");
    setActiveHistoryId(entry.session_id);
    setSelectedModelIds(entry.request?.model_ids || []);
    setPrompt(entry.request?.prompt || "");
    setSystemPrompt(entry.request?.system_prompt || "");
    setTemperature(entry.request?.temperature ?? 0.7);
    setMaxTokens(entry.request?.max_tokens ?? 512);
    setResults(entry.results || []);
    // bring the results section into view
    requestAnimationFrame(() => {
      document.getElementById("prompt-lab-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical size={22} className="text-cyan-400" /> Prompt Lab
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Test the same prompt across selected models and compare outputs, latency, and cost.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-white font-semibold">Run Configuration</h2>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedModelIds.map((id) => {
              const model = allModels.find((m) => m.id === id);
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-blue-900/20 border-blue-800 text-blue-300">
                  <span>{model?.name || id}</span>
                  <button onClick={() => removeModel(id)}><X size={12} /></button>
                </div>
              );
            })}
          </div>

          {selectedModelIds.length < 5 && (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                placeholder="Search models to add..."
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {loadingModels ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading models...
                  </div>
                ) : (
                  filtered.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => addModel(m.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
                    >
                      <span className="text-gray-200">{m.name}</span>
                      <span className="text-cyan-400 text-xs flex items-center gap-1">
                        <Plus size={12} /> Add
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input min-h-44"
            placeholder="Enter user prompt..."
          />
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Example Prompts</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  title="Click to use this prompt"
                >
                  Example {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="input min-h-20"
            placeholder="Optional system prompt..."
          />
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Example System Prompts</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SYSTEM_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSystemPrompt(sample)}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  title="Click to use this system prompt"
                >
                  System {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-400">
              Temperature
              <input
                type="number"
                className="input mt-1"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-400">
              Max Tokens
              <input
                type="number"
                className="input mt-1"
                min={1}
                max={4096}
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button onClick={handleRun} disabled={running} className="btn-primary w-full flex items-center justify-center gap-2">
            {running && <Loader2 size={15} className="animate-spin" />}
            Run Prompt Test
          </button>
        </div>

        <div className="card space-y-4">
          <h2 className="text-white font-semibold">Recent Prompt Tests</h2>
          {history.length === 0 && <p className="text-sm text-gray-500">No prompt test history yet.</p>}
          {history.map((entry) => (
            <button
              key={entry.session_id}
              type="button"
              onClick={() => loadFromHistory(entry)}
              className={[
                "w-full text-left rounded-lg border px-3 py-2 transition-colors",
                activeHistoryId === entry.session_id
                  ? "border-cyan-700 bg-cyan-900/10"
                  : "border-gray-800 bg-gray-900/50 hover:bg-gray-800/60",
              ].join(" ")}
            >
              <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString()}</p>
              <p className="text-sm text-gray-300 mt-1 line-clamp-2">{entry.request?.prompt}</p>
              <p className="text-xs text-gray-500 mt-1">
                Models: {entry.request?.model_ids?.length || 0} | Success: {(entry.results || []).filter((r) => r.status === "success").length}
              </p>
              <p className="text-xs text-cyan-400 mt-2">Click to view results</p>
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 id="prompt-lab-results" className="text-white font-semibold">
            {activeHistoryId ? "History Results" : "Run Results"}
          </h2>
          {results.map((r) => (
            <div key={r.model_id} className="card">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-white font-semibold">{r.model_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{r.provider}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`badge border ${r.status === "success" ? "bg-green-900/30 text-green-400 border-green-800" : "bg-red-900/30 text-red-400 border-red-800"}`}>
                    {r.status}
                  </span>
                  <span className="badge bg-gray-800 text-gray-300 border border-gray-700">{r.latency_ms} ms</span>
                  <span className="badge bg-gray-800 text-gray-300 border border-gray-700">{r.total_tokens} tokens</span>
                  <span className="badge bg-gray-800 text-gray-300 border border-gray-700">{formatCost(r.estimated_cost)}</span>
                </div>
              </div>

              {r.status === "error" ? (
                <p className="text-sm text-red-400 mt-3">{r.error_message || "Unknown model error"}</p>
              ) : (
                <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">{r.output_text || "(Empty response)"}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
