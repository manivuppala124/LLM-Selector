import { useState, useEffect } from "react";
import { GitCompare, Plus, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { getModels, compare } from "../api/models";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const METRIC_LABELS = {
  blended_1m:        { label: "Blended Cost",    unit: "$/1M",    lower: true  },
  context_length:    { label: "Context Length",  unit: "tokens",  lower: false },
  tokens_per_second: { label: "Speed",           unit: "tok/s",   lower: false },
  ttft_ms:           { label: "Latency (TTFT)",  unit: "ms",      lower: true  },
  intelligence_index:{ label: "Intelligence",    unit: "index",   lower: false },
  coding_index:      { label: "Coding",          unit: "index",   lower: false },
  agentic_index:     { label: "Agentic",         unit: "index",   lower: false },
};

const BOOL_METRICS = ["function_calling", "json_mode", "multimodal", "open_source"];
const BOOL_LABELS  = {
  function_calling: "Function Calling",
  json_mode:        "JSON Mode",
  multimodal:       "Multimodal",
  open_source:      "Open Source",
};

const COLORS = ["#3b82f6", "#a855f7", "#22c55e"];

function best(key, values, lower) {
  const nums = Object.entries(values).map(([id, v]) => ({ id, v: Number(v) }));
  if (lower) return nums.reduce((a, b) => (b.v < a.v ? b : a)).id;
  return nums.reduce((a, b) => (b.v > a.v ? b : a)).id;
}

export default function Compare() {
  const [allModels, setAllModels]   = useState([]);
  const [selected,  setSelected]    = useState([]);
  const [search,    setSearch]      = useState("");
  const [result,    setResult]      = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [fetching,  setFetching]    = useState(true);
  const [error,     setError]       = useState("");

  useEffect(() => {
    getModels({ limit: 300 })
      .then((r) => setAllModels(r.data.models.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setError("Failed to load models"))
      .finally(() => setFetching(false));
  }, []);

  const filtered = allModels.filter(
    (m) =>
      !selected.includes(m.id) &&
      (m.name.toLowerCase().includes(search.toLowerCase()) ||
       m.provider.toLowerCase().includes(search.toLowerCase()))
  );

  const addModel = (id) => {
    if (selected.length < 3) setSelected([...selected, id]);
  };

  const removeModel = (id) => {
    setSelected(selected.filter((s) => s !== id));
    setResult(null);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await compare(selected);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const chartData = result
    ? ["intelligence_index", "coding_index", "agentic_index", "tokens_per_second"].map((key) => ({
        name: METRIC_LABELS[key]?.label || key,
        ...result.models.reduce((acc, m) => ({ ...acc, [m.name]: result.comparison[key]?.[m.id] ?? 0 }), {}),
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCompare size={22} className="text-green-400" /> Model Comparison
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Select 2–3 models for a side-by-side breakdown.</p>
      </div>

      {/* Model picker */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {selected.map((id, i) => {
            const m = allModels.find((x) => x.id === id);
            return (
              <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: COLORS[i] + "80", background: COLORS[i] + "10", color: COLORS[i] }}>
                <span>{m?.name ?? id}</span>
                <button onClick={() => removeModel(id)}><X size={12} /></button>
              </div>
            );
          })}
          {selected.length < 3 && (
            <span className="text-xs text-gray-600">
              {selected.length === 0 ? "Select 2–3 models below" : `Add ${3 - selected.length} more`}
            </span>
          )}
        </div>

        {selected.length < 3 && (
          <>
            <input
              type="text"
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
            <div className="max-h-52 overflow-y-auto space-y-1">
              {fetching ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              ) : filtered.slice(0, 30).map((m) => (
                <button
                  key={m.id}
                  onClick={() => addModel(m.id)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-left transition-colors"
                >
                  <span className="text-gray-200">{m.name}</span>
                  <span className="flex items-center gap-1 text-blue-400 text-xs">
                    <Plus size={12} /> Add
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <button
          onClick={handleCompare}
          disabled={selected.length < 2 || loading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Compare
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Performance Overview</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#f9fafb" }}
                />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                {result.models.map((m, i) => (
                  <Bar key={m.id} dataKey={m.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Numeric table */}
          <div className="card overflow-x-auto">
            <h2 className="text-base font-semibold text-white mb-4">Full Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Metric</th>
                  {result.models.map((m, i) => (
                    <th key={m.id} className="text-right pb-3 px-3 font-semibold" style={{ color: COLORS[i] }}>
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {Object.entries(METRIC_LABELS).map(([key, { label, unit, lower }]) => {
                  const vals = result.comparison[key];
                  if (!vals) return null;
                  const bestId = best(key, vals, lower);
                  return (
                    <tr key={key}>
                      <td className="py-3 pr-4 text-gray-400">{label} <span className="text-gray-600 text-xs">({unit})</span></td>
                      {result.models.map((m) => {
                        const v = vals[m.id];
                        const isBest = m.id === bestId;
                        const display = key === "context_length"
                          ? (v >= 1000 ? `${Math.round(v/1000)}K` : v)
                          : (typeof v === "number" && v > 0 ? v.toLocaleString() : v ?? "—");
                        return (
                          <td key={m.id} className={clsx("py-3 px-3 text-right font-medium", isBest ? "text-green-400" : "text-gray-200")}>
                            {display}
                            {isBest && <span className="ml-1 text-xs">★</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Boolean rows */}
                {BOOL_METRICS.map((key) => {
                  const vals = result.comparison[key];
                  if (!vals) return null;
                  return (
                    <tr key={key}>
                      <td className="py-3 pr-4 text-gray-400">{BOOL_LABELS[key]}</td>
                      {result.models.map((m) => (
                        <td key={m.id} className="py-3 px-3 text-right">
                          {vals[m.id]
                            ? <CheckCircle2 size={15} className="text-green-400 ml-auto" />
                            : <XCircle     size={15} className="text-red-500  ml-auto" />}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
