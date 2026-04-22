import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, Plus, X } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { compareModels, getModels } from "../api/models";

const MODEL_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6"];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeByRange(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 100);
  return values.map((v) => ((v - min) / (max - min)) * 100);
}

function formatCtx(n) {
  const value = toNumber(n, 0);
  if (!value) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function formatPricePer1M(value) {
  const n = toNumber(value, 0);
  if (n <= 0) return "Free";
  return `$${n.toFixed(4)}`;
}

function formatMonthlyCost(value) {
  return `$${toNumber(value, 0).toFixed(2)} /month`;
}

function yesNo(value) {
  return value ? "✅" : "—";
}

export default function CompareModels() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialModelIds = useMemo(
    () => (Array.isArray(location.state?.modelIds) ? location.state.modelIds.slice(0, 5) : []),
    [location.state?.modelIds]
  );
  const initialModelIdsKey = useMemo(() => initialModelIds.join("|"), [initialModelIds]);
  const hasAutoLoaded = useRef(false);

  const [allModels, setAllModels] = useState([]);
  const [selectedModelIds, setSelectedModelIds] = useState(initialModelIds);
  const [search, setSearch] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [monthlyTokens, setMonthlyTokens] = useState(1_000_000);

  useEffect(() => {
    setSelectedModelIds(initialModelIds);
    hasAutoLoaded.current = false;
  }, [initialModelIdsKey]);

  useEffect(() => {
    const loadAllModels = async () => {
      const batch = 500;
      let skip = 0;
      let total = Infinity;
      const collected = [];
      while (skip < total) {
        const r = await getModels({ limit: batch, skip });
        const page = r.data.models || [];
        total = Number(r.data.total || page.length);
        collected.push(...page);
        skip += page.length;
        if (page.length === 0) break;
      }
      return collected;
    };

    loadAllModels()
      .then((fetched) => {
        const sorted = fetched.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
        setAllModels(sorted);
      })
      .catch(() => setError("Failed to load models list."))
      .finally(() => setLoadingModels(false));
  }, []);

  const selectedModelIdsKey = useMemo(() => selectedModelIds.join("|"), [selectedModelIds]);

  const handleCompare = async () => {
    if (selectedModelIds.length < 2 || selectedModelIds.length > 5) {
      setError("Select 2 to 5 models to compare.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await compareModels(selectedModelIds);
      setModels(data.models || []);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load model comparison.");
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAutoLoaded.current) return;
    if (initialModelIds.length < 2) return;
    if (selectedModelIdsKey !== initialModelIdsKey) return;

    hasAutoLoaded.current = true;
    handleCompare();
  }, [initialModelIds.length, initialModelIdsKey, selectedModelIdsKey]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allModels.filter((m) => {
      if (selectedModelIds.includes(m.id)) return false;
      if (!q) return true;
      return (
        (m.name || "").toLowerCase().includes(q) ||
        (m.provider || "").toLowerCase().includes(q) ||
        (m.id || "").toLowerCase().includes(q)
      );
    });
  }, [allModels, search, selectedModelIds]);

  const addModel = (id) => {
    if (selectedModelIds.length >= 5) return;
    setSelectedModelIds((prev) => [...prev, id]);
  };

  const removeModel = (id) => {
    setSelectedModelIds((prev) => prev.filter((m) => m !== id));
  };

  const selectedModelsMeta = useMemo(
    () => selectedModelIds.map((id) => allModels.find((m) => m.id === id) || { id, name: id, provider: "unknown" }),
    [allModels, selectedModelIds]
  );

  const chartData = useMemo(() => {
    if (models.length === 0) return [];

    const qualityRaw = models.map((m) => toNumber(m.intelligence_index, toNumber(m.coding_index, 60)));
    const speedRaw = models.map((m) => toNumber(m.tokens_per_second, 50));
    const contextRaw = models.map((m) => Math.log(toNumber(m.context_length, 4096)));
    const valueRaw = models.map((m) => {
      const costPer1m = toNumber(m.blended_per_1m, 0);
      return costPer1m > 0 ? 1 / costPer1m : 1;
    });

    const qualityNorm = normalizeByRange(qualityRaw);
    const speedNorm = normalizeByRange(speedRaw);
    const contextNorm = normalizeByRange(contextRaw);
    const valueNorm = normalizeByRange(valueRaw);

    return models.map((m, idx) => ({
      name: m.name || m.id,
      Quality: Number(qualityNorm[idx].toFixed(1)),
      Speed: Number(speedNorm[idx].toFixed(1)),
      Context: Number(contextNorm[idx].toFixed(1)),
      Value: Number(valueNorm[idx].toFixed(1)),
      color: MODEL_COLORS[idx % MODEL_COLORS.length],
      provider: m.provider || "unknown",
    }));
  }, [models]);

  const chartDimensions = ["Quality", "Speed", "Context", "Value"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compare Models</h1>
        <p className="text-gray-400 mt-1 text-sm">Side-by-side comparison of quality, speed, context, value, and capabilities.</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-white font-semibold">Select Models (2-5)</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")} className="btn-secondary text-sm">
              Back to Dashboard
            </button>
            <button
              onClick={handleCompare}
              disabled={loading || selectedModelIds.length < 2}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Compare Models
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedModelsMeta.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-blue-900/20 border-blue-800 text-blue-300">
              <span>{m.name}</span>
              <button onClick={() => removeModel(m.id)}><X size={12} /></button>
            </div>
          ))}
        </div>

        {selectedModelIds.length < 5 && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              placeholder="Search models by name, provider, or id..."
            />
            <div className="max-h-56 overflow-y-auto space-y-1">
              {loadingModels ? (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Loading models...
                </div>
              ) : (
                filtered.slice(0, 100).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addModel(m.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
                  >
                    <span className="text-gray-200 text-left">
                      {m.name}
                      <span className="text-gray-500 text-xs ml-2 capitalize">{m.provider || "unknown"}</span>
                    </span>
                    <span className="text-cyan-400 text-xs flex items-center gap-1">
                      <Plus size={12} /> Add
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {loading && (
        <div className="card flex items-center gap-2 text-gray-300">
          <Loader2 size={16} className="animate-spin" />
          Loading comparison...
        </div>
      )}

      {error && (
        <div className="card border-red-900/60 bg-red-950/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && models.length === 0 && (
        <div className="card text-sm text-gray-400">
          Select at least 2 models and click <span className="text-gray-200 font-medium">Compare Models</span>.
        </div>
      )}

      {!loading && !error && models.length > 0 && (
        <>
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">Performance Diamond</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={chartDimensions.map((d) => {
                  const row = { metric: d };
                  chartData.forEach((m) => {
                    row[m.name] = m[d];
                  });
                  return row;
                })}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  {chartData.map((m, idx) => (
                    <Radar
                      key={m.name}
                      name={m.name}
                      dataKey={m.name}
                      stroke={MODEL_COLORS[idx % MODEL_COLORS.length]}
                      fill={MODEL_COLORS[idx % MODEL_COLORS.length]}
                      fillOpacity={0.14}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3">
              {chartData.map((m, idx) => (
                <div key={m.name} className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
                  />
                  <span className="text-sm text-gray-200">{m.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{m.provider}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Detailed Specifications</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 font-medium py-3 pr-4">Metric</th>
                    {models.map((m) => (
                      <th key={m.id} className="text-left text-gray-200 font-medium py-3 pr-6 min-w-56 align-top">
                        <div className="space-y-1">
                          <div>{m.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{m.provider || "unknown"}</div>
                          <a
                            href={`https://openrouter.ai/models/${encodeURIComponent(m.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            OpenRouter page <ExternalLink size={12} />
                          </a>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Quality index</td>
                    {models.map((m) => <td key={`${m.id}-q`} className="py-3 pr-6 text-gray-200">{toNumber(m.intelligence_index, 0) || "—"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Coding index</td>
                    {models.map((m) => <td key={`${m.id}-c`} className="py-3 pr-6 text-gray-200">{toNumber(m.coding_index, 0) || "—"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Agentic index</td>
                    {models.map((m) => <td key={`${m.id}-a`} className="py-3 pr-6 text-gray-200">{toNumber(m.agentic_index, 0) || "—"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Price per 1M</td>
                    {models.map((m) => <td key={`${m.id}-p`} className="py-3 pr-6 text-gray-200">{formatPricePer1M(m.blended_per_1m)}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Output speed</td>
                    {models.map((m) => <td key={`${m.id}-s`} className="py-3 pr-6 text-gray-200">{toNumber(m.tokens_per_second, 0) ? `${toNumber(m.tokens_per_second)} t/s` : "—"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Context window</td>
                    {models.map((m) => <td key={`${m.id}-ctx`} className="py-3 pr-6 text-gray-200">{formatCtx(m.context_length)}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Latency (TTFT)</td>
                    {models.map((m) => <td key={`${m.id}-t`} className="py-3 pr-6 text-gray-200">{toNumber(m.ttft, 0) ? `${toNumber(m.ttft)} ms` : "—"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Provider</td>
                    {models.map((m) => <td key={`${m.id}-prov`} className="py-3 pr-6 text-gray-200 capitalize">{m.provider || "unknown"}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Open source</td>
                    {models.map((m) => <td key={`${m.id}-os`} className="py-3 pr-6 text-gray-200">{yesNo(m.is_open_source)}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Multimodal</td>
                    {models.map((m) => <td key={`${m.id}-mm`} className="py-3 pr-6 text-gray-200">{yesNo(m.is_multimodal)}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">Function calling</td>
                    {models.map((m) => <td key={`${m.id}-fc`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_function_calling)}</td>)}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-gray-400">JSON mode</td>
                    {models.map((m) => <td key={`${m.id}-jm`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_json_mode)}</td>)}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-400">Fine-tuning</td>
                    {models.map((m) => <td key={`${m.id}-ft`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_fine_tuning)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-white">Monthly Cost Estimator</h2>
              <label className="text-sm text-gray-400 flex items-center gap-2">
                Monthly tokens
                <input
                  type="number"
                  min={1}
                  value={monthlyTokens}
                  onChange={(e) => setMonthlyTokens(toNumber(e.target.value, 1_000_000))}
                  className="input w-48"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {models.map((m, idx) => {
                const monthlyCost = (toNumber(monthlyTokens, 0) / 1_000_000) * toNumber(m.blended_per_1m, 0);
                return (
                  <div
                    key={m.id}
                    className="rounded-xl border bg-gray-900/50 p-4"
                    style={{ borderColor: `${MODEL_COLORS[idx % MODEL_COLORS.length]}66` }}
                  >
                    <p className="text-white font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{m.provider || "unknown"}</p>
                    <p className="text-lg font-bold mt-3" style={{ color: MODEL_COLORS[idx % MODEL_COLORS.length] }}>
                      {formatMonthlyCost(monthlyCost)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
