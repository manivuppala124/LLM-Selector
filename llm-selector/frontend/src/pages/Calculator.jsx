import { useState, useEffect } from "react";
import { Calculator as CalcIcon, Loader2, DollarSign } from "lucide-react";
import { getModels, calculate } from "../api/models";

function fmt(n, decimals = 4) {
  if (n === undefined || n === null) return "—";
  if (n === 0) return "$0.00";
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  return `$${Number(n).toFixed(decimals)}`;
}

export default function Calculator() {
  const [models,   setModels]   = useState([]);
  const [modelId,  setModelId]  = useState("");
  const [inputTok, setInputTok] = useState(1000);
  const [outputTok,setOutputTok]= useState(500);
  const [daily,    setDaily]    = useState(1000);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    getModels({ limit: 500 })
      .then((r) => {
        const sorted = r.data.models
          .filter((m) => m.input_price > 0 || m.output_price > 0)
          .sort((a, b) => a.name.localeCompare(b.name));
        setModels(sorted);
        if (sorted.length) setModelId(sorted[0].id);
        else setError("No billable models available yet. Please run Sync Models from Dashboard.");
      })
      .catch(() => setError("Failed to load models. Is the backend running?"))
      .finally(() => setFetching(false));
  }, []);

  const handleCalc = async () => {
    if (!modelId) {
      setError("Please select a model.");
      return;
    }
    const inTok = Number(inputTok);
    const outTok = Number(outputTok);
    const dailyReq = Number(daily);
    if (!Number.isFinite(inTok) || inTok < 1 || !Number.isInteger(inTok)) {
      setError("Input tokens must be a whole number greater than 0.");
      return;
    }
    if (!Number.isFinite(outTok) || outTok < 1 || !Number.isInteger(outTok)) {
      setError("Output tokens must be a whole number greater than 0.");
      return;
    }
    if (!Number.isFinite(dailyReq) || dailyReq < 1 || !Number.isInteger(dailyReq)) {
      setError("Daily requests must be a whole number greater than 0.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await calculate({
        model_id:       modelId,
        input_tokens:   inTok,
        output_tokens:  outTok,
        daily_requests: dailyReq,
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalcIcon size={22} className="text-purple-400" /> Cost Calculator
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Estimate your monthly LLM spend.</p>
      </div>

      <div className="card space-y-5">
        {/* Model select */}
        <div>
          <label className="label">Model</label>
          {fetching ? (
            <div className="input flex items-center gap-2 text-gray-500">
              <Loader2 size={14} className="animate-spin" /> Loading models…
            </div>
          ) : models.length === 0 ? (
            <div className="input text-gray-500">
              No priced models found. Sync model data and try again.
            </div>
          ) : (
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="input"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
              ))}
            </select>
          )}
        </div>

        {/* Token inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Input tokens / request</label>
            <input type="number" min="1" value={inputTok}
              onChange={(e) => setInputTok(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Output tokens / request</label>
            <input type="number" min="1" value={outputTok}
              onChange={(e) => setOutputTok(e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Daily requests</label>
          <input type="number" min="1" value={daily}
            onChange={(e) => setDaily(e.target.value)} className="input" />
          <p className="text-xs text-gray-500 mt-1">
            Monthly = daily × 30 days
          </p>
        </div>

        {/* Preset buttons */}
        <div>
          <p className="label">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Chatbot",     i: 500,  o: 300,  d: 500  },
              { label: "Code review", i: 2000, o: 800,  d: 200  },
              { label: "Batch jobs",  i: 1000, o: 500,  d: 5000 },
              { label: "Enterprise",  i: 3000, o: 1500, d: 20000},
            ].map(({ label, i, o, d }) => (
              <button
                key={label}
                onClick={() => { setInputTok(i); setOutputTok(o); setDaily(d); }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button onClick={handleCalc} disabled={loading || !modelId || models.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 size={15} className="animate-spin" />}
          Calculate
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign size={18} className="text-green-400" />
            Cost Breakdown — {result.model_name}
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <CostBox label="Per Request"  value={fmt(result.cost_per_request, 6)} sub="one call" color="blue"   />
            <CostBox label="Daily"        value={fmt(result.daily_cost, 4)}       sub={`${result.daily_requests.toLocaleString()} req/day`} color="purple" />
            <CostBox label="Monthly"      value={fmt(result.monthly_cost, 2)}     sub="30 days"  color="green"  />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-sm space-y-2">
            <Row label="Input price"  value={`${fmt(result.input_price_per_1m)}/1M tokens`} />
            <Row label="Output price" value={`${fmt(result.output_price_per_1m)}/1M tokens`} />
            <Row label="Per request"  value={`${result.input_tokens.toLocaleString()} in + ${result.output_tokens.toLocaleString()} out`} />
            <Row label="Daily volume" value={`${result.daily_requests.toLocaleString()} requests`} />
          </div>
        </div>
      )}
    </div>
  );
}

function CostBox({ label, value, sub, color }) {
  const cls = {
    blue:   "border-blue-800 bg-blue-900/20 text-blue-300",
    purple: "border-purple-800 bg-purple-900/20 text-purple-300",
    green:  "border-green-800 bg-green-900/20 text-green-300",
  }[color];

  return (
    <div className={`rounded-xl border p-4 text-center ${cls}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide mt-1 opacity-80">{label}</div>
      <div className="text-xs opacity-60 mt-0.5">{sub}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  );
}
