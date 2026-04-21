import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, CheckCircle2, XCircle, AlertCircle, Info, ChevronDown, ChevronUp, Zap, DollarSign, Brain, Layers, Timer } from "lucide-react";
import { clsx } from "clsx";
import { useFormStore } from "../store/formStore";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const RANK_STYLE = {
  1: "border-yellow-500/50 bg-yellow-500/5",
  2: "border-gray-500/50 bg-gray-500/5",
  3: "border-orange-700/50 bg-orange-700/5",
};

const RANK_BADGE = {
  1: "bg-yellow-500/20 text-yellow-300 border-yellow-600",
  2: "bg-gray-500/20 text-gray-300 border-gray-600",
  3: "bg-orange-700/20 text-orange-300 border-orange-700",
};

const RANK_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

const MATCH_COLOR = {
  green:  "bg-green-900/30 text-green-400 border-green-800",
  blue:   "bg-blue-900/30 text-blue-400 border-blue-800",
  yellow: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
};

function CheckItem({ check }) {
  const cfg = {
    pass: { icon: CheckCircle2, cls: "text-green-400" },
    fail: { icon: XCircle,      cls: "text-red-400" },
    warn: { icon: AlertCircle,  cls: "text-yellow-400" },
    info: { icon: Info,         cls: "text-blue-400" },
  }[check.status] || { icon: Info, cls: "text-gray-400" };

  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} className={cfg.cls} />
      <span className="text-gray-300">{check.label}</span>
    </div>
  );
}

function ContribBar({ label, value, icon: Icon, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-1 text-gray-400"><Icon size={12} />{label}</span>
        <span className={`font-semibold ${color}`}>{value.toFixed(1)} pts</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all`}
          style={{
            width: `${Math.min(value, 100)}%`,
            background:
              color === "text-blue-400"
                ? "#3b82f6"
                : color === "text-green-400"
                ? "#22c55e"
                : color === "text-purple-400"
                ? "#a855f7"
                : color === "text-pink-400"
                ? "#f472b6"
                : "#f59e0b",
          }}
        />
      </div>
    </div>
  );
}

function ModelCard({ result, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  const { rank, model_name, provider, overall_score, match_label, match_color,
          why_ranked, checks, contributions, model_data } = result;

  return (
    <div className={clsx("rounded-xl border p-5 transition-all", RANK_STYLE[rank])}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{RANK_MEDAL[rank]}</span>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{model_name}</h3>
            <p className="text-gray-500 text-sm capitalize">{provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx("badge border text-xs", MATCH_COLOR[match_color])}>
            {match_label}
          </span>
          <span className={clsx("badge border text-sm font-bold", RANK_BADGE[rank])}>
            {overall_score}/100
          </span>
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Stat icon={DollarSign} label="Cost/1M" value={model_data.blended_per_1m > 0 ? `$${model_data.blended_per_1m}` : "Free"} />
        <Stat icon={Zap}        label="Speed"   value={`${model_data.tokens_per_second} t/s`} />
        <Stat icon={Layers}     label="Context" value={fmtCtx(model_data.context_length)} />
        <Stat icon={Brain}      label="Quality" value={model_data.intelligence_index} />
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-4 transition-colors"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-5 border-t border-gray-800 pt-4">
          {/* Why ranked */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Why ranked #{rank}</p>
            <p className="text-sm text-gray-200 leading-relaxed">{why_ranked}</p>
          </div>

          {/* Score breakdown */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Score Breakdown</p>
            <div className="space-y-2">
              <ContribBar label="Quality"  value={contributions.quality}  icon={Brain}       color="text-blue-400" />
              <ContribBar label="Speed"    value={contributions.speed}    icon={Zap}         color="text-green-400" />
              <ContribBar label="Latency"  value={contributions.latency || 0} icon={Timer}   color="text-pink-400" />
              <ContribBar label="Cost"     value={contributions.cost}     icon={DollarSign}  color="text-purple-400" />
              <ContribBar label="Context"  value={contributions.context}  icon={Layers}      color="text-yellow-400" />
            </div>
          </div>

          {/* Match checklist */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Match Checklist</p>
            <div className="space-y-1.5">
              {checks.map((c, i) => <CheckItem key={i} check={c} />)}
            </div>
          </div>

          {/* Model flags */}
          <div className="flex flex-wrap gap-2">
            {model_data.is_open_source       && <Tag label="Open Source" />}
            {model_data.is_multimodal         && <Tag label="Multimodal" />}
            {model_data.supports_function_calling && <Tag label="Function Calling" />}
            {model_data.supports_json_mode    && <Tag label="JSON Mode" />}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-2.5 text-center">
      <Icon size={13} className="text-gray-500 mx-auto mb-1" />
      <div className="text-white font-semibold text-sm">{value}</div>
      <div className="text-gray-600 text-xs">{label}</div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span className="badge bg-gray-800 text-gray-400 border border-gray-700 text-xs">{label}</span>
  );
}

function fmtCtx(n) {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${Math.round(n / 1000)}K`;
  return String(n);
}

export default function Results() {
  const navigate = useNavigate();
  const { results, user_summary, use_case, reset } = useFormStore();

  if (!results) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No results yet.</p>
        <button className="btn-primary mt-4" onClick={() => navigate("/requirements")}>
          Run Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy size={22} className="text-yellow-400" /> Top Recommendations
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Based on your requirements</p>
      </div>

      {/* User summary */}
      <div className="card bg-blue-950/30 border-blue-900/50">
        <p className="text-xs text-blue-400 uppercase tracking-wide mb-2 font-semibold">Your Requirements</p>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{user_summary}</pre>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((r, i) => (
          <ModelCard key={r.model_id} result={r} index={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => { reset(); navigate("/requirements"); }} className="btn-secondary text-sm">
          New Analysis
        </button>
        <button
          onClick={() => navigate("/prompt-lab", { state: { preselectedModelIds: results.slice(0, 3).map((r) => r.model_id) } })}
          className="btn-secondary text-sm"
        >
          Test Prompt on Top Models
        </button>
        <button onClick={() => navigate("/calculator")} className="btn-secondary text-sm">
          Calculate Costs
        </button>
      </div>
    </div>
  );
}
