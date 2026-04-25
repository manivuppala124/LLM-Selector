// import { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ExternalLink, Loader2, Plus, X } from "lucide-react";
// import {
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import { compareModels, getModels } from "../api/models";

// const MODEL_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6"];

// function toNumber(value, fallback = 0) {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : fallback;
// }

// function normalizeByRange(values) {
//   const min = Math.min(...values);
//   const max = Math.max(...values);
//   if (max === min) return values.map(() => 100);
//   return values.map((v) => ((v - min) / (max - min)) * 100);
// }

// function normalizeMetric(values, { higherIsBetter }) {
//   const norm = normalizeByRange(values);
//   if (higherIsBetter) return norm;
//   return norm.map((v) => 100 - v);
// }

// function median(values, fallback) {
//   const nums = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
//   if (nums.length === 0) return fallback;
//   const mid = Math.floor(nums.length / 2);
//   return nums.length % 2 === 1 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
// }

// function fillMissing(values, fallback) {
//   const med = median(values, fallback);
//   return values.map((v) => (Number.isFinite(v) ? v : med));
// }

// function clamp01to100(n) {
//   if (!Number.isFinite(n)) return 0;
//   return Math.max(0, Math.min(100, n));
// }

// function formatCtx(n) {
//   const value = toNumber(n, 0);
//   if (!value) return "—";
//   if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
//   if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
//   return String(value);
// }

// function formatPricePer1M(value) {
//   const n = toNumber(value, 0);
//   if (n <= 0) return "Free";
//   return `$${n.toFixed(4)}`;
// }

// function formatMonthlyCost(value) {
//   return `$${toNumber(value, 0).toFixed(2)} /month`;
// }

// function yesNo(value) {
//   return value ? "✅" : "—";
// }

// export default function CompareModels() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const initialModelIds = useMemo(
//     () => (Array.isArray(location.state?.modelIds) ? location.state.modelIds.slice(0, 5) : []),
//     [location.state?.modelIds]
//   );
//   const initialModelIdsKey = useMemo(() => initialModelIds.join("|"), [initialModelIds]);
//   const hasAutoLoaded = useRef(false);

//   const [allModels, setAllModels] = useState([]);
//   const [selectedModelIds, setSelectedModelIds] = useState(initialModelIds);
//   const [search, setSearch] = useState("");
//   const [loadingModels, setLoadingModels] = useState(true);
//   const [models, setModels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [monthlyTokens, setMonthlyTokens] = useState(1_000_000);

//   useEffect(() => {
//     setSelectedModelIds(initialModelIds);
//     hasAutoLoaded.current = false;
//   }, [initialModelIdsKey]);

//   useEffect(() => {
//     const loadAllModels = async () => {
//       const batch = 500;
//       let skip = 0;
//       let total = Infinity;
//       const collected = [];
//       while (skip < total) {
//         const r = await getModels({ limit: batch, skip });
//         const page = r.data.models || [];
//         total = Number(r.data.total || page.length);
//         collected.push(...page);
//         skip += page.length;
//         if (page.length === 0) break;
//       }
//       return collected;
//     };

//     loadAllModels()
//       .then((fetched) => {
//         const sorted = fetched.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
//         setAllModels(sorted);
//       })
//       .catch(() => setError("Failed to load models list."))
//       .finally(() => setLoadingModels(false));
//   }, []);

//   const selectedModelIdsKey = useMemo(() => selectedModelIds.join("|"), [selectedModelIds]);

//   const handleCompare = async () => {
//     if (selectedModelIds.length < 2 || selectedModelIds.length > 5) {
//       setError("Select 2 to 5 models to compare.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     try {
//       const { data } = await compareModels(selectedModelIds);
//       setModels(data.models || []);
//     } catch (e) {
//       setError(e.response?.data?.detail || "Failed to load model comparison.");
//       setModels([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasAutoLoaded.current) return;
//     if (initialModelIds.length < 2) return;
//     if (selectedModelIdsKey !== initialModelIdsKey) return;

//     hasAutoLoaded.current = true;
//     handleCompare();
//   }, [initialModelIds.length, initialModelIdsKey, selectedModelIdsKey]);

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     return allModels.filter((m) => {
//       if (selectedModelIds.includes(m.id)) return false;
//       if (!q) return true;
//       return (
//         (m.name || "").toLowerCase().includes(q) ||
//         (m.provider || "").toLowerCase().includes(q) ||
//         (m.id || "").toLowerCase().includes(q)
//       );
//     });
//   }, [allModels, search, selectedModelIds]);

//   const addModel = (id) => {
//     if (selectedModelIds.length >= 5) return;
//     setSelectedModelIds((prev) => [...prev, id]);
//   };

//   const removeModel = (id) => {
//     setSelectedModelIds((prev) => prev.filter((m) => m !== id));
//   };

//   const selectedModelsMeta = useMemo(
//     () => selectedModelIds.map((id) => allModels.find((m) => m.id === id) || { id, name: id, provider: "unknown" }),
//     [allModels, selectedModelIds]
//   );

//   const chartData = useMemo(() => {
//     if (models.length === 0) return [];

//     // Use real provider/AA fields when present; if a field is missing for a model,
//     // fill it with the group's median so the radar doesn't collapse to 0 for that model.
//     const qualityRaw = fillMissing(
//       models.map((m) => {
//         const a = toNumber(m.intelligence_index, NaN);
//         const b = toNumber(m.coding_index, NaN);
//         const c = toNumber(m.agentic_index, NaN);
//         const best = Math.max(a, b, c);
//         return Number.isFinite(best) ? best : NaN;
//       }),
//       60
//     );

//     const speedRaw = fillMissing(models.map((m) => toNumber(m.tokens_per_second, NaN)), 60);
//     const latencyRaw = fillMissing(models.map((m) => toNumber(m.ttft, NaN)), 500);
//     const contextRaw = fillMissing(
//       models.map((m) => {
//         const ctx = toNumber(m.context_length, NaN);
//         return Number.isFinite(ctx) && ctx > 0 ? Math.log(ctx) : NaN;
//       }),
//       Math.log(4096)
//     );
//     const costRaw = fillMissing(
//       models.map((m) => {
//         const c = toNumber(m.blended_per_1m, NaN);
//         // Cost may be 0 for free models; that's valid.
//         return Number.isFinite(c) ? c : NaN;
//       }),
//       2
//     );

//     const qualityNorm = normalizeMetric(qualityRaw, { higherIsBetter: true });
//     const speedNorm = normalizeMetric(speedRaw, { higherIsBetter: true });
//     const latencyNorm = normalizeMetric(latencyRaw, { higherIsBetter: false }); // lower TTFT is better
//     const contextNorm = normalizeMetric(contextRaw, { higherIsBetter: true });
//     const costNorm = normalizeMetric(costRaw, { higherIsBetter: false }); // cheaper is better

//     return models.map((m, idx) => ({
//       // IMPORTANT: Recharts radar series uses dataKey strings; if two models share the
//       // same display name, their values will collide and one series can appear as 0.
//       // Use model id as the series key and keep name just for display.
//       key: m.id,
//       label: m.name || m.id,
//       Quality: Number(clamp01to100(qualityNorm[idx]).toFixed(1)),
//       Speed: Number(clamp01to100(speedNorm[idx]).toFixed(1)),
//       Latency: Number(clamp01to100(latencyNorm[idx]).toFixed(1)),
//       Context: Number(clamp01to100(contextNorm[idx]).toFixed(1)),
//       Cost: Number(clamp01to100(costNorm[idx]).toFixed(1)),
//       color: MODEL_COLORS[idx % MODEL_COLORS.length],
//       provider: m.provider || "unknown",
//     }));
//   }, [models]);

//   const chartDimensions = ["Quality", "Speed", "Latency", "Context", "Cost"];

//   return (
//     <div className="max-w-6xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-white">Compare Models</h1>
//         <p className="text-gray-400 mt-1 text-sm">Side-by-side comparison of quality, speed, context, value, and capabilities.</p>
//       </div>

//       <div className="card space-y-4">
//         <div className="flex items-center justify-between gap-3 flex-wrap">
//           <h2 className="text-white font-semibold">Select Models (2-5)</h2>
//           <div className="flex items-center gap-2">
//             <button onClick={() => navigate("/dashboard")} className="btn-secondary text-sm">
//               Back to Dashboard
//             </button>
//             <button
//               onClick={handleCompare}
//               disabled={loading || selectedModelIds.length < 2}
//               className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading && <Loader2 size={14} className="animate-spin" />}
//               Compare Models
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           {selectedModelsMeta.map((m) => (
//             <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-blue-900/20 border-blue-800 text-blue-300">
//               <span>{m.name}</span>
//               <button onClick={() => removeModel(m.id)}><X size={12} /></button>
//             </div>
//           ))}
//         </div>

//         {selectedModelIds.length < 5 && (
//           <>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="input"
//               placeholder="Search models by name, provider, or id..."
//             />
//             <div className="max-h-56 overflow-y-auto space-y-1">
//               {loadingModels ? (
//                 <div className="text-sm text-gray-500 flex items-center gap-2">
//                   <Loader2 size={14} className="animate-spin" /> Loading models...
//                 </div>
//               ) : (
//                 filtered.slice(0, 100).map((m) => (
//                   <button
//                     key={m.id}
//                     onClick={() => addModel(m.id)}
//                     className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
//                   >
//                     <span className="text-gray-200 text-left">
//                       {m.name}
//                       <span className="text-gray-500 text-xs ml-2 capitalize">{m.provider || "unknown"}</span>
//                     </span>
//                     <span className="text-cyan-400 text-xs flex items-center gap-1">
//                       <Plus size={12} /> Add
//                     </span>
//                   </button>
//                 ))
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {loading && (
//         <div className="card flex items-center gap-2 text-gray-300">
//           <Loader2 size={16} className="animate-spin" />
//           Loading comparison...
//         </div>
//       )}

//       {error && (
//         <div className="card border-red-900/60 bg-red-950/20 text-red-300 text-sm">
//           {error}
//         </div>
//       )}

//       {!loading && !error && models.length === 0 && (
//         <div className="card text-sm text-gray-400">
//           Select at least 2 models and click <span className="text-gray-200 font-medium">Compare Models</span>.
//         </div>
//       )}

//       {!loading && !error && models.length > 0 && (
//         <>
//           <div className="card space-y-4">
//             <h2 className="text-lg font-semibold text-white">Performance Diamond</h2>
//             <div className="h-96">
//               <ResponsiveContainer width="100%" height="100%">
//                 <RadarChart outerRadius="70%" data={chartDimensions.map((d) => {
//                   const row = { metric: d };
//                   chartData.forEach((m) => {
//                     row[m.key] = m[d];
//                   });
//                   return row;
//                 })}>
//                   <PolarGrid stroke="#374151" />
//                   <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
//                   <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} />
//                   {chartData.map((m, idx) => (
//                     <Radar
//                       key={m.key}
//                       name={m.label}
//                       dataKey={m.key}
//                       stroke={MODEL_COLORS[idx % MODEL_COLORS.length]}
//                       fill={MODEL_COLORS[idx % MODEL_COLORS.length]}
//                       fillOpacity={0.14}
//                       strokeWidth={2}
//                     />
//                   ))}
//                   <Tooltip />
//                 </RadarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               {chartData.map((m, idx) => (
//                 <div key={m.key} className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2">
//                   <span
//                     className="inline-block h-2.5 w-2.5 rounded-full"
//                     style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
//                   />
//                   <span className="text-sm text-gray-200">{m.label}</span>
//                   <span className="text-xs text-gray-500 capitalize">{m.provider}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="card">
//             <h2 className="text-lg font-semibold text-white mb-4">Detailed Specifications</h2>
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-800">
//                     <th className="text-left text-gray-400 font-medium py-3 pr-4">Metric</th>
//                     {models.map((m) => (
//                       <th key={m.id} className="text-left text-gray-200 font-medium py-3 pr-6 min-w-56 align-top">
//                         <div className="space-y-1">
//                           <div>{m.name}</div>
//                           <div className="text-xs text-gray-500 capitalize">{m.provider || "unknown"}</div>
//                           <a
//                             href={`https://openrouter.ai/models/${encodeURIComponent(m.id)}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
//                           >
//                             OpenRouter page <ExternalLink size={12} />
//                           </a>
//                         </div>
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Quality index</td>
//                     {models.map((m) => <td key={`${m.id}-q`} className="py-3 pr-6 text-gray-200">{toNumber(m.intelligence_index, 0) || "—"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Coding index</td>
//                     {models.map((m) => <td key={`${m.id}-c`} className="py-3 pr-6 text-gray-200">{toNumber(m.coding_index, 0) || "—"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Agentic index</td>
//                     {models.map((m) => <td key={`${m.id}-a`} className="py-3 pr-6 text-gray-200">{toNumber(m.agentic_index, 0) || "—"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Price per 1M</td>
//                     {models.map((m) => <td key={`${m.id}-p`} className="py-3 pr-6 text-gray-200">{formatPricePer1M(m.blended_per_1m)}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Output speed</td>
//                     {models.map((m) => <td key={`${m.id}-s`} className="py-3 pr-6 text-gray-200">{toNumber(m.tokens_per_second, 0) ? `${toNumber(m.tokens_per_second)} t/s` : "—"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Context window</td>
//                     {models.map((m) => <td key={`${m.id}-ctx`} className="py-3 pr-6 text-gray-200">{formatCtx(m.context_length)}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Latency (TTFT)</td>
//                     {models.map((m) => <td key={`${m.id}-t`} className="py-3 pr-6 text-gray-200">{toNumber(m.ttft, 0) ? `${toNumber(m.ttft)} ms` : "—"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Provider</td>
//                     {models.map((m) => <td key={`${m.id}-prov`} className="py-3 pr-6 text-gray-200 capitalize">{m.provider || "unknown"}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Open source</td>
//                     {models.map((m) => <td key={`${m.id}-os`} className="py-3 pr-6 text-gray-200">{yesNo(m.is_open_source)}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Multimodal</td>
//                     {models.map((m) => <td key={`${m.id}-mm`} className="py-3 pr-6 text-gray-200">{yesNo(m.is_multimodal)}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">Function calling</td>
//                     {models.map((m) => <td key={`${m.id}-fc`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_function_calling)}</td>)}
//                   </tr>
//                   <tr className="border-b border-gray-900">
//                     <td className="py-3 pr-4 text-gray-400">JSON mode</td>
//                     {models.map((m) => <td key={`${m.id}-jm`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_json_mode)}</td>)}
//                   </tr>
//                   <tr>
//                     <td className="py-3 pr-4 text-gray-400">Fine-tuning</td>
//                     {models.map((m) => <td key={`${m.id}-ft`} className="py-3 pr-6 text-gray-200">{yesNo(m.supports_fine_tuning)}</td>)}
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="card space-y-4">
//             <div className="flex items-center justify-between flex-wrap gap-3">
//               <h2 className="text-lg font-semibold text-white">Monthly Cost Estimator</h2>
//               <label className="text-sm text-gray-400 flex items-center gap-2">
//                 Monthly tokens
//                 <input
//                   type="number"
//                   min={1}
//                   value={monthlyTokens}
//                   onChange={(e) => setMonthlyTokens(toNumber(e.target.value, 1_000_000))}
//                   className="input w-48"
//                 />
//               </label>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//               {models.map((m, idx) => {
//                 const monthlyCost = (toNumber(monthlyTokens, 0) / 1_000_000) * toNumber(m.blended_per_1m, 0);
//                 return (
//                   <div
//                     key={m.id}
//                     className="rounded-xl border bg-gray-900/50 p-4"
//                     style={{ borderColor: `${MODEL_COLORS[idx % MODEL_COLORS.length]}66` }}
//                   >
//                     <p className="text-white font-semibold">{m.name}</p>
//                     <p className="text-xs text-gray-500 capitalize mt-0.5">{m.provider || "unknown"}</p>
//                     <p className="text-lg font-bold mt-3" style={{ color: MODEL_COLORS[idx % MODEL_COLORS.length] }}>
//                       {formatMonthlyCost(monthlyCost)}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, Plus, X, TrendingUp, Zap, DollarSign, Award } from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { compareModels, getModels } from "../api/models";

const MODEL_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6"];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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

  // --- BENCHMARK BAR CHART DATA (real fields) ---
  const benchmarkBarData = useMemo(() => {
    if (models.length === 0) return [];
    return [
      {
        metric: "Intelligence",
        ...Object.fromEntries(models.map((m, i) => [m.name || m.id, toNumber(m.intelligence_index, 0) || null])),
      },
      {
        metric: "Coding",
        ...Object.fromEntries(models.map((m, i) => [m.name || m.id, toNumber(m.coding_index, 0) || null])),
      },
      {
        metric: "Agentic",
        ...Object.fromEntries(models.map((m, i) => [m.name || m.id, toNumber(m.agentic_index, 0) || null])),
      },
    ];
  }, [models]);

  // --- SPEED BAR CHART (tokens/sec, horizontal) ---
  const speedBarData = useMemo(() => {
    if (models.length === 0) return [];
    return models
      .map((m, idx) => ({
        name: m.name || m.id,
        tps: toNumber(m.tokens_per_second, 0),
        ttft: toNumber(m.ttft, 0),
        color: MODEL_COLORS[idx % MODEL_COLORS.length],
      }))
      .filter((d) => d.tps > 0 || d.ttft > 0);
  }, [models]);

  // Score cards — derive winner per dimension
  const winners = useMemo(() => {
    if (models.length === 0) return {};
    return {
      quality: models.reduce((best, m) =>
        Math.max(toNumber(m.intelligence_index, 0), toNumber(m.coding_index, 0), toNumber(m.agentic_index, 0)) >
        Math.max(toNumber(best.intelligence_index, 0), toNumber(best.coding_index, 0), toNumber(best.agentic_index, 0))
          ? m
          : best
      ),
      speed: models.reduce((best, m) => (toNumber(m.tokens_per_second, 0) > toNumber(best.tokens_per_second, 0) ? m : best)),
      latency: models.reduce((best, m) => {
        const a = toNumber(m.ttft, Infinity);
        const b = toNumber(best.ttft, Infinity);
        return a > 0 && a < b ? m : best;
      }),
      cost: models.reduce((best, m) => {
        const a = toNumber(m.blended_per_1m, Infinity);
        const b = toNumber(best.blended_per_1m, Infinity);
        return a >= 0 && a < b ? m : best;
      }),
    };
  }, [models]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compare Models</h1>
        <p className="text-gray-400 mt-1 text-sm">Side-by-side comparison of quality, speed, context, value, and capabilities.</p>
      </div>

      {/* Model selector */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-white font-semibold">Select Models (2–5)</h2>
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
          {selectedModelsMeta.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
              style={{
                backgroundColor: `${MODEL_COLORS[idx % MODEL_COLORS.length]}15`,
                borderColor: `${MODEL_COLORS[idx % MODEL_COLORS.length]}55`,
                color: MODEL_COLORS[idx % MODEL_COLORS.length],
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
              />
              <span>{m.name}</span>
              <button onClick={() => removeModel(m.id)} className="opacity-60 hover:opacity-100">
                <X size={12} />
              </button>
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
          <Loader2 size={16} className="animate-spin" /> Loading comparison...
        </div>
      )}
      {error && (
        <div className="card border-red-900/60 bg-red-950/20 text-red-300 text-sm">{error}</div>
      )}
      {!loading && !error && models.length === 0 && (
        <div className="card text-sm text-gray-400">
          Select at least 2 models and click <span className="text-gray-200 font-medium">Compare Models</span>.
        </div>
      )}

      {!loading && !error && models.length > 0 && (
        <>
          {/* ── WINNER SCORECARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Best Quality", icon: <Award size={16} />, model: winners.quality, sub: "Highest benchmark index" },
              { label: "Fastest Output", icon: <Zap size={16} />, model: winners.speed, sub: `${toNumber(winners.speed?.tokens_per_second, 0)} t/s` },
              { label: "Lowest Latency", icon: <TrendingUp size={16} />, model: winners.latency, sub: toNumber(winners.latency?.ttft, 0) ? `${toNumber(winners.latency.ttft)} ms TTFT` : "N/A" },
              { label: "Most Affordable", icon: <DollarSign size={16} />, model: winners.cost, sub: formatPricePer1M(winners.cost?.blended_per_1m) + " /1M" },
            ].map(({ label, icon, model, sub }, i) => {
              const idx = models.findIndex((m) => m.id === model?.id);
              const color = MODEL_COLORS[idx % MODEL_COLORS.length];
              return (
                <div
                  key={label}
                  className="rounded-xl border bg-gray-900/60 p-4"
                  style={{ borderColor: `${color}44` }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color }}>
                    {icon}
                    <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-white font-semibold text-sm leading-tight">{model?.name || "—"}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              );
            })}
          </div>

          {/* ── BENCHMARK BARS ── */}
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold text-white">Benchmark Indices</h2>
            <p className="text-xs text-gray-500">Raw intelligence, coding, and agentic index scores from provider data.</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkBarData} barCategoryGap="25%" barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="metric" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#e5e7eb" }}
                    cursor={{ fill: "#ffffff08" }}
                  />
                  <Legend formatter={(v) => <span style={{ color: "#d1d5db", fontSize: 12 }}>{v}</span>} />
                  {models.map((m, idx) => (
                    <Bar
                      key={m.id}
                      dataKey={m.name || m.id}
                      fill={MODEL_COLORS[idx % MODEL_COLORS.length]}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={40}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SPEED & LATENCY HORIZONTAL BARS ── */}
          {speedBarData.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Tokens per second */}
              <div className="card space-y-3">
                <h2 className="text-lg font-semibold text-white">Output Speed</h2>
                <p className="text-xs text-gray-500">Tokens per second — higher is better.</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speedBarData} layout="vertical" barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                      <XAxis type="number" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} unit=" t/s" />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                        cursor={{ fill: "#ffffff08" }}
                        formatter={(v) => [`${v} t/s`, "Speed"]}
                      />
                      <Bar dataKey="tps" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {speedBarData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                        <LabelList dataKey="tps" position="right" style={{ fill: "#9ca3af", fontSize: 11 }} formatter={(v) => v > 0 ? `${v}` : ""} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TTFT latency */}
              <div className="card space-y-3">
                <h2 className="text-lg font-semibold text-white">Time to First Token</h2>
                <p className="text-xs text-gray-500">TTFT in milliseconds — lower is better.</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speedBarData.filter((d) => d.ttft > 0)} layout="vertical" barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                      <XAxis type="number" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} unit=" ms" />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                        cursor={{ fill: "#ffffff08" }}
                        formatter={(v) => [`${v} ms`, "TTFT"]}
                      />
                      <Bar dataKey="ttft" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {speedBarData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                        <LabelList dataKey="ttft" position="right" style={{ fill: "#9ca3af", fontSize: 11 }} formatter={(v) => v > 0 ? `${v}` : ""} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── DETAILED SPECS TABLE ── */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Detailed Specifications</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 font-medium py-3 pr-4">Metric</th>
                    {models.map((m, idx) => (
                      <th key={m.id} className="text-left text-gray-200 font-medium py-3 pr-6 min-w-56 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
                            />
                            {m.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize pl-4">{m.provider || "unknown"}</div>
                          <a
                            href={`https://openrouter.ai/models/${encodeURIComponent(m.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 pl-4"
                          >
                            OpenRouter <ExternalLink size={12} />
                          </a>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Quality index", render: (m) => toNumber(m.intelligence_index, 0) || "—" },
                    { label: "Coding index", render: (m) => toNumber(m.coding_index, 0) || "—" },
                    { label: "Agentic index", render: (m) => toNumber(m.agentic_index, 0) || "—" },
                    { label: "Price per 1M", render: (m) => formatPricePer1M(m.blended_per_1m) },
                    { label: "Output speed", render: (m) => toNumber(m.tokens_per_second, 0) ? `${toNumber(m.tokens_per_second)} t/s` : "—" },
                    { label: "Context window", render: (m) => formatCtx(m.context_length) },
                    { label: "Latency (TTFT)", render: (m) => toNumber(m.ttft, 0) ? `${toNumber(m.ttft)} ms` : "—" },
                    { label: "Provider", render: (m) => <span className="capitalize">{m.provider || "unknown"}</span> },
                    { label: "Open source", render: (m) => yesNo(m.is_open_source) },
                    { label: "Multimodal", render: (m) => yesNo(m.is_multimodal) },
                    { label: "Function calling", render: (m) => yesNo(m.supports_function_calling) },
                    { label: "JSON mode", render: (m) => yesNo(m.supports_json_mode) },
                    { label: "Fine-tuning", render: (m) => yesNo(m.supports_fine_tuning) },
                  ].map(({ label, render }, rowIdx) => (
                    <tr key={label} className={rowIdx < 12 ? "border-b border-gray-900" : ""}>
                      <td className="py-3 pr-4 text-gray-400">{label}</td>
                      {models.map((m) => (
                        <td key={`${m.id}-${label}`} className="py-3 pr-6 text-gray-200">{render(m)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── MONTHLY COST ESTIMATOR ── */}
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

            {/* Bar chart for cost comparison */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={models.map((m, idx) => ({
                    name: m.name || m.id,
                    cost: Number(((toNumber(monthlyTokens, 0) / 1_000_000) * toNumber(m.blended_per_1m, 0)).toFixed(2)),
                    color: MODEL_COLORS[idx % MODEL_COLORS.length],
                  }))}
                  barCategoryGap="35%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "#ffffff08" }}
                    formatter={(v) => [`$${v}`, "Monthly cost"]}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={56}>
                    {models.map((m, idx) => (
                      <Cell key={idx} fill={MODEL_COLORS[idx % MODEL_COLORS.length]} />
                    ))}
                    <LabelList dataKey="cost" position="top" style={{ fill: "#9ca3af", fontSize: 11 }} formatter={(v) => `$${v}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
                      />
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{m.provider || "unknown"}</p>
                    <p className="text-lg font-bold mt-3" style={{ color: MODEL_COLORS[idx % MODEL_COLORS.length] }}>
                      {formatMonthlyCost(monthlyCost)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatPricePer1M(m.blended_per_1m)} per 1M tokens</p>
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