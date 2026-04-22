import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Calculator, History, RefreshCw, Loader2, ChevronRight, FlaskConical, Scale } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useFormStore } from "../store/formStore";
import { getHistory, syncAll } from "../api/models";

const CARDS = [
  {
    icon: Zap, color: "blue", title: "Get Recommendations",
    desc: "Answer 5 quick questions and get your top 3 LLM picks with full explanations.",
    action: "/requirements", cta: "Start Analysis",
  },
  {
    icon: Calculator, color: "purple", title: "Cost Calculator",
    desc: "Estimate your monthly spend based on token usage and request volume.",
    action: "/calculator", cta: "Calculate Cost",
  },
  {
    icon: FlaskConical, color: "cyan", title: "Prompt Lab",
    desc: "Run a live prompt against one or more models and inspect output, latency, and cost.",
    action: "/prompt-lab", cta: "Test Prompt",
  },
  {
    icon: Scale, color: "emerald", title: "Compare Models",
    desc: "Pick 2-5 models and compare quality, speed, context, value, and feature support.",
    action: "/compare", cta: "Start Comparison",
  },
];

const COLOR = {
  blue:   "bg-blue-600/10 text-blue-400 border-blue-800",
  purple: "bg-purple-600/10 text-purple-400 border-purple-800",
  cyan:   "bg-cyan-600/10 text-cyan-400 border-cyan-800",
  emerald: "bg-emerald-600/10 text-emerald-400 border-emerald-800",
};

export default function Dashboard() {
  const navigate  = useNavigate();
  const email     = useAuthStore((s) => s.email);
  const resetForm = useFormStore((s) => s.reset);

  const [history, setHistory] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    getHistory().then((r) => setHistory(r.data.history)).catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const { data } = await syncAll();
      setSyncMsg(`Synced ${data.openrouter?.synced ?? 0} models from OpenRouter, updated ${data.aa?.updated ?? 0} with benchmarks.`);
    } catch (e) {
      setSyncMsg(e.response?.data?.detail || "Sync failed. Is the backend running?");
    } finally {
      setSyncing(false);
    }
  };

  const startNew = () => {
    resetForm();
    navigate("/requirements");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{email ? `, ${email.split("@")[0]}` : ""}
          </h1>
          <p className="text-gray-400 mt-1">Find the perfect LLM for your next project.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {syncing ? "Syncing…" : "Sync Models"}
          </button>
          <button onClick={startNew} className="btn-primary flex items-center gap-2 text-sm">
            <Zap size={14} />
            New Analysis
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`rounded-lg px-4 py-3 text-sm border ${
          syncMsg.includes("failed") || syncMsg.includes("Error")
            ? "bg-red-900/20 border-red-800 text-red-400"
            : "bg-green-900/20 border-green-800 text-green-400"
        }`}>
          {syncMsg}
        </div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map(({ icon: Icon, color, title, desc, action, cta }) => (
          <div key={title} className="card hover:border-gray-700 transition-colors group cursor-pointer" onClick={() => navigate(action)}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border mb-4 ${COLOR[color]}`}>
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-white mb-1.5">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
            <button className="flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
              {cta} <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            Recent Analyses
          </h2>
          <div className="space-y-3">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-blue-900/40 text-blue-300 border border-blue-800 capitalize">
                      {h.requirements?.use_case}
                    </span>
                    {h.requirements?.budget != null && (
                      <span className="badge bg-gray-800 text-gray-400 border border-gray-700">
                        Budget ${h.requirements.budget}/1M
                      </span>
                    )}
                    <span className="badge bg-gray-800 text-gray-400 border border-gray-700">
                      Speed/Quality: {h.requirements?.speed_vs_quality}
                    </span>
                    {h.requirements?.latency_requirement && (
                      <span className="badge bg-gray-800 text-gray-400 border border-gray-700">
                        Latency: {h.requirements.latency_requirement}
                      </span>
                    )}
                    {h.requirements?.privacy_requirement && (
                      <span className="badge bg-gray-800 text-gray-400 border border-gray-700">
                        Privacy: {h.requirements.privacy_requirement}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {h.results?.slice(0, 3).map((r) => (
                    <span key={r.model_id} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                      {r.model_name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="card text-center py-12">
          <Zap size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No analyses yet</p>
          <p className="text-gray-600 text-sm mt-1">Run your first analysis to see results here</p>
          <button onClick={startNew} className="btn-primary mt-4 text-sm">Start Analysis</button>
        </div>
      )}
    </div>
  );
}
