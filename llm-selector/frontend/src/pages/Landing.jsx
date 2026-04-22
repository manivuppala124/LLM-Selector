// import { useState, useEffect, useRef } from "react";

// /* ─── data ─────────────────────────────────────────────── */
// const features = [
//   {
//     id: "recommend",
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="3"/>
//         <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
//       </svg>
//     ),
//     title: "Smart Recommend",
//     tag: "Most popular",
//     desc: "7-step wizard scores every model across quality, speed, cost, and latency — returns ranked top-3 with full explainability and per-dimension contribution breakdown.",
//     color: "#8B7CF8",
//     glow: "rgba(139,124,248,0.18)",
//     detail: ["Hard eligibility filters", "Dynamic weight engine", "Score contribution breakdown"],
//   },
//   {
//     id: "lab",
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
//       </svg>
//     ),
//     title: "Prompt Lab",
//     tag: "A/B testing",
//     desc: "Fire identical prompts at up to 5 models at once. Compare outputs, latency, token counts, and cost side-by-side in a single view.",
//     color: "#2DD4BF",
//     glow: "rgba(45,212,191,0.15)",
//     detail: ["Up to 5 parallel models", "Real latency & token data", "Persistent run history"],
//   },
//   {
//     id: "calc",
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <rect x="4" y="2" width="16" height="20" rx="2"/>
//         <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
//         <line x1="8" y1="14" x2="11" y2="14"/><line x1="8" y1="18" x2="11" y2="18"/>
//         <line x1="14" y1="14" x2="16" y2="14"/><line x1="14" y1="18" x2="16" y2="18"/>
//       </svg>
//     ),
//     title: "Cost Calculator",
//     tag: "Budget planning",
//     desc: "Enter token volume and request count. Get instant per-request, daily, and 30-day cost projections with quick presets for common workloads.",
//     color: "#F59E0B",
//     glow: "rgba(245,158,11,0.15)",
//     detail: ["Per-request precision", "Daily & monthly rollups", "Workload presets"],
//   },
// ];

// const stats = [
//   { value: "200+", label: "Models indexed" },
//   { value: "5", label: "Scoring dimensions" },
//   { value: "3", label: "Core tools" },
//   { value: "0", label: "Vendor bias" },
// ];

// const steps = [
//   {
//     n: "01",
//     title: "Describe your workload",
//     body: "Select use case, input modality, context window, quality constraints, and deployment requirements.",
//     color: "#8B7CF8",
//   },
//   {
//     n: "02",
//     title: "Set budget & tradeoffs",
//     body: "Define your cost ceiling, speed-vs-quality preference, required feature flags, and privacy constraints.",
//     color: "#2DD4BF",
//   },
//   {
//     n: "03",
//     title: "Get ranked results",
//     body: "Deterministic scoring engine returns top-3 with match labels, why-ranked sentences, and contribution scores.",
//     color: "#F59E0B",
//   },
// ];

// const ticker = [
//   "GPT-4o · $5 / 1M tokens",
//   "Claude 3.5 Sonnet · $3 / 1M tokens",
//   "Gemini 1.5 Pro · $3.5 / 1M tokens",
//   "Llama 3.1 405B · $2.7 / 1M tokens",
//   "Mistral Large · $4 / 1M tokens",
//   "Qwen 2.5 72B · $1.2 / 1M tokens",
//   "DeepSeek V3 · $0.9 / 1M tokens",
//   "Command R+ · $3 / 1M tokens",
// ];

// const testimonials = [
//   { quote: "Saved us days of spreadsheet analysis. Recommended Claude Sonnet over GPT-4o for our use case and the reasoning was spot on.", name: "Arjun M.", role: "ML Engineer" },
//   { quote: "Prompt Lab alone is worth it — finally an apples-to-apples comparison without writing test harnesses myself.", name: "Priya S.", role: "Product Lead" },
//   { quote: "The cost calculator showed our monthly bill would drop 40% switching providers. We switched the next day.", name: "Daniel K.", role: "Startup CTO" },
// ];

// /* ─── hooks ─────────────────────────────────────────────── */
// function useInView(threshold = 0.12) {
//   const ref = useRef();
//   const [inView, setInView] = useState(false);
//   useEffect(() => {
//     const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, []);
//   return [ref, inView];
// }

// function Reveal({ children, delay = 0, y = 28, style = {} }) {
//   const [ref, inView] = useInView();
//   return (
//     <div ref={ref} style={{
//       opacity: inView ? 1 : 0,
//       transform: inView ? "translateY(0)" : `translateY(${y}px)`,
//       transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
//       ...style,
//     }}>
//       {children}
//     </div>
//   );
// }

// /* ── mini mock card ── */
// function MockRankCard({ rank, name, score, color, delay }) {
//   const [ref, inView] = useInView(0.05);
//   return (
//     <div ref={ref} style={{
//       opacity: inView ? 1 : 0,
//       transform: inView ? "translateX(0)" : "translateX(16px)",
//       transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
//       background: rank === 1 ? `${color}0c` : "rgba(0,0,0,.18)",
//       border: rank === 1 ? `1px solid ${color}30` : "1px solid rgba(255,255,255,.06)",
//       borderRadius: 10,
//       padding: "11px 14px",
//       display: "flex",
//       alignItems: "center",
//       gap: 10,
//     }}>
//       <div style={{ width: 26, height: 26, borderRadius: 7, background: rank === 1 ? color : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: rank === 1 ? "#fff" : "#4A4860", flexShrink: 0 }}>#{rank}</div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ fontSize: 12.5, fontWeight: 500, color: "#D0CDE0", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
//         <div style={{ height: 3.5, background: "rgba(255,255,255,.06)", borderRadius: 3 }}>
//           <div style={{ height: "100%", width: inView ? `${score}%` : "0%", background: rank === 1 ? color : "rgba(255,255,255,.18)", borderRadius: 3, transition: "width 1.3s cubic-bezier(.22,1,.36,1) .2s" }} />
//         </div>
//       </div>
//       <div style={{ fontSize: 12, fontWeight: 600, color: rank === 1 ? color : "#4A4860", flexShrink: 0 }}>{score}</div>
//     </div>
//   );
// }

// /* ─── main ──────────────────────────────────────────────── */
// export default function LandingPage() {
//   const [scrolled, setScrolled] = useState(false);
//   const [hoveredFeature, setHoveredFeature] = useState(null);
//   const [tickerPaused, setTickerPaused] = useState(false);
//   const [activeTestimonial, setActiveTestimonial] = useState(0);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 48);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4500);
//     return () => clearInterval(t);
//   }, []);

//   const goLogin = () => { window.location.href = "/login"; };
//   const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

//   return (
//     <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#070810", color: "#EAE8F2", minHeight: "100vh", overflowX: "hidden" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0;}
//         ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0b12}::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px}
//         .nl{color:#64627A;font-size:14px;font-weight:400;text-decoration:none;transition:color .2s;cursor:pointer;background:none;border:none;font-family:inherit;}
//         .nl:hover{color:#EAE8F2;}
//         .bp{background:linear-gradient(135deg,#7C6AF4,#A78BFA);color:#fff;border:none;padding:12px 26px;border-radius:10px;font-size:14.5px;font-weight:500;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:inherit;letter-spacing:-.01em;}
//         .bp:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(124,106,244,.38);}
//         .bp:active{transform:translateY(0);}
//         .bg{background:transparent;color:#64627A;border:1px solid rgba(255,255,255,.1);padding:11px 22px;border-radius:10px;font-size:14px;font-weight:400;cursor:pointer;transition:all .2s;font-family:inherit;}
//         .bg:hover{color:#EAE8F2;border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.03);}
//         .pill{display:inline-flex;align-items:center;gap:5px;background:rgba(139,124,248,.09);border:1px solid rgba(139,124,248,.22);color:#9A8EF0;font-size:11.5px;font-weight:500;padding:4px 12px;border-radius:100px;letter-spacing:.01em;}
//         .fc{border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:30px;background:rgba(255,255,255,.015);transition:border-color .3s,transform .3s,background .3s;}
//         .fc:hover{background:rgba(255,255,255,.028);transform:translateY(-3px);}
//         .ticker-wrap{overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent);}
//         .ticker-inner{display:inline-flex;animation:ticker 32s linear infinite;}
//         .ticker-inner.paused{animation-play-state:paused;}
//         @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes pulseGlow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
//         @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
//         @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
//         @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
//         .hbadge{animation:fadeUp .55s ease .05s both}
//         .hh1{animation:fadeUp .6s ease .2s both}
//         .hsub{animation:fadeUp .6s ease .35s both}
//         .hact{animation:fadeUp .6s ease .5s both}
//         .htrust{animation:fadeUp .6s ease .6s both}
//         .hstats{animation:fadeUp .55s ease .72s both}
//         .grad-text{background:linear-gradient(110deg,#A78BFA 0%,#7C6AF4 35%,#2DD4BF 70%,#A78BFA 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 7s ease infinite;}
//         .orb{position:absolute;border-radius:50%;pointer-events:none;}
//         .scroll-dot{animation:bobble 1.8s ease infinite;}
//         .t-enter{animation:slideUp .4s cubic-bezier(.22,1,.36,1) both;}
//         .check{width:15px;height:15px;border-radius:50%;background:rgba(139,124,248,.12);border:1px solid rgba(139,124,248,.22);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
//       `}</style>

//       {/* ──────────── Navbar ──────────── */}
//       <nav style={{
//         position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
//         background: scrolled ? "rgba(7,8,16,.94)" : "transparent",
//         backdropFilter: scrolled ? "blur(22px)" : "none",
//         borderBottom: scrolled ? "1px solid rgba(255,255,255,.07)" : "1px solid transparent",
//         transition: "all .35s ease",
//       }}>
//         <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//             <div style={{ width: 33, height: 33, borderRadius: 9, background: "linear-gradient(135deg,#7C6AF4,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(124,106,244,.45)" }}>
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
//             </div>
//             <span style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: "-.4px" }}>LLM Selector</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
//             <button className="nl" onClick={() => scrollTo("features")}>Features</button>
//             <button className="nl" onClick={() => scrollTo("how")}>How it works</button>
//             <button className="nl" onClick={() => scrollTo("testimonials")}>Reviews</button>
//             <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
//             <button className="nl" onClick={goLogin}>Sign in</button>
//             <button className="bp" style={{ padding: "9px 20px", fontSize: 13 }} onClick={goLogin}>Start free →</button>
//           </div>
//         </div>
//       </nav>

//       {/* ──────────── Hero ──────────── */}
//       <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "140px 24px 110px", textAlign: "center", overflow: "hidden" }}>
//         {/* orbs */}
//         <div className="orb" style={{ width: 800, height: 800, top: "-15%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(124,106,244,.12) 0%, transparent 65%)" }} />
//         <div className="orb" style={{ width: 380, height: 380, top: "28%", left: "3%", background: "radial-gradient(circle, rgba(45,212,191,.09) 0%, transparent 70%)" }} />
//         <div className="orb" style={{ width: 300, height: 300, top: "18%", right: "3%", background: "radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)" }} />

//         {/* dot grid */}
//         <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.038) 1px, transparent 1px)", backgroundSize: "30px 30px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, black 15%, transparent 72%)", pointerEvents: "none" }} />

//         {/* rotating ring */}
//         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, height: 520, border: "1px solid rgba(139,124,248,.06)", borderRadius: "50%", animation: "spinSlow 50s linear infinite", pointerEvents: "none" }}>
//           <div style={{ position: "absolute", top: -5, left: "50%", width: 10, height: 10, borderRadius: "50%", background: "#8B7CF8", transform: "translateX(-50%)", boxShadow: "0 0 14px 3px rgba(139,124,248,.6)" }} />
//           <div style={{ position: "absolute", bottom: -5, left: "50%", width: 6, height: 6, borderRadius: "50%", background: "#2DD4BF", transform: "translateX(-50%)", boxShadow: "0 0 10px 2px rgba(45,212,191,.5)" }} />
//         </div>
//         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 360, height: 360, border: "1px solid rgba(255,255,255,.03)", borderRadius: "50%", animation: "spinSlow 30s linear infinite reverse", pointerEvents: "none" }} />

//         <div style={{ position: "relative", maxWidth: 840, zIndex: 2 }}>
//           <div className="hbadge" style={{ marginBottom: 28 }}>
//             <span className="pill">
//               <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B7CF8", display: "inline-block", animation: "pulseGlow 2s ease infinite" }} />
//               Deterministic · Explainable · Vendor-neutral
//             </span>
//           </div>

//           <h1 className="hh1" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(44px, 7.5vw, 84px)", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-3px", marginBottom: 30, color: "#EDE9F8" }}>
//             The smartest way<br />to{" "}
//             <em className="grad-text" style={{ fontStyle: "italic" }}>pick your LLM</em>
//           </h1>

//           <p className="hsub" style={{ fontSize: "clamp(15px, 2vw, 18.5px)", color: "#64627A", lineHeight: 1.78, fontWeight: 300, maxWidth: 560, margin: "0 auto 44px", letterSpacing: "-.01em" }}>
//             Stop reading benchmarks. Describe your requirements — budget, speed, quality, use case — and we'll rank the best model with transparent, reproducible logic.
//           </p>

//           <div className="hact" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
//             <button className="bp" style={{ fontSize: 16, padding: "15px 44px", borderRadius: 12 }} onClick={goLogin}>
//               Get my recommendation →
//             </button>
//             <button className="bg" style={{ borderRadius: 12 }} onClick={() => scrollTo("features")}>
//               Explore tools
//             </button>
//           </div>

//           <div className="htrust" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
//             {["No credit card", "200+ models", "Free to start"].map(t => (
//               <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#46445A" }}>
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B7CF8" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
//                 {t}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* stats bar */}
//         <div className="hstats" style={{ position: "relative", zIndex: 2, display: "flex", marginTop: 84, border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,.016)", backdropFilter: "blur(14px)" }}>
//           {stats.map((s, i) => (
//             <div key={i} style={{ padding: "22px 52px", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none", textAlign: "center", minWidth: 140 }}>
//               <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, color: "#EAE8F2", marginBottom: 5, letterSpacing: "-1.2px" }}>{s.value}</div>
//               <div style={{ fontSize: 11, color: "#46445A", fontWeight: 400, letterSpacing: ".05em", textTransform: "uppercase" }}>{s.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* scroll cue */}
//         <div style={{ position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.3 }}>
//           <div style={{ width: 22, height: 36, border: "1px solid rgba(255,255,255,.3)", borderRadius: 11, display: "flex", justifyContent: "center", padding: "5px 0" }}>
//             <div className="scroll-dot" style={{ width: 3, height: 7, borderRadius: 2, background: "#EAE8F2" }} />
//           </div>
//         </div>
//       </section>

//       {/* ──────────── Ticker ──────────── */}
//       <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "13px 0", background: "rgba(255,255,255,.01)" }}
//         onMouseEnter={() => setTickerPaused(true)} onMouseLeave={() => setTickerPaused(false)}>
//         <div className="ticker-wrap">
//           <div className={`ticker-inner${tickerPaused ? " paused" : ""}`} style={{ whiteSpace: "nowrap" }}>
//             {[...ticker, ...ticker].map((item, i) => (
//               <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 30px", fontSize: 12.5, color: "#46445A", fontWeight: 400 }}>
//                 <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#2E2C40", display: "inline-block", flexShrink: 0 }} />
//                 {item}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ──────────── Features bento ──────────── */}
//       <section id="features" style={{ padding: "110px max(24px, calc((100vw - 1160px)/2))" }}>
//         <Reveal>
//           <div style={{ textAlign: "center", marginBottom: 72 }}>
//             <span className="pill" style={{ marginBottom: 18, display: "inline-flex" }}>Three core tools</span>
//             <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 400, letterSpacing: "-2px", color: "#EAE8F2", marginTop: 14, marginBottom: 18, lineHeight: 1.08 }}>
//               One platform.<br />Every decision.
//             </h2>
//             <p style={{ color: "#46445A", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.82, fontWeight: 300 }}>
//               Each tool is independently powerful. Used together they eliminate guesswork from your entire model selection workflow.
//             </p>
//           </div>
//         </Reveal>

//         {/* Bento: recommend spans 2 cols, lab and calc stack in col 3 */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 14 }}>

//           {/* ── Recommend: big ── */}
//           <Reveal delay={0} style={{ gridColumn: "1 / 3", gridRow: "1 / 3" }}>
//             <div className="fc" style={{ height: "100%", position: "relative", overflow: "hidden", borderColor: hoveredFeature === 0 ? `${features[0].color}28` : "rgba(255,255,255,.06)" }}
//               onMouseEnter={() => setHoveredFeature(0)} onMouseLeave={() => setHoveredFeature(null)}>
//               <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", background: features[0].glow, filter: "blur(60px)", transition: "opacity .4s", opacity: hoveredFeature === 0 ? 1 : 0.35, pointerEvents: "none" }} />

//               <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//                   <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[0].color}14`, border: `1px solid ${features[0].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[0].color }}>{features[0].icon}</div>
//                   <div>
//                     <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", letterSpacing: "-.3px" }}>{features[0].title}</div>
//                     <div style={{ fontSize: 11, color: features[0].color, fontWeight: 500, marginTop: 2, opacity: .7 }}>{features[0].tag}</div>
//                   </div>
//                 </div>
//                 <span style={{ fontSize: 10.5, padding: "4px 11px", borderRadius: 100, background: `${features[0].color}10`, color: features[0].color, border: `1px solid ${features[0].color}22`, fontWeight: 500 }}>Most popular</span>
//               </div>

//               <p style={{ fontSize: 15, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 28, maxWidth: 460 }}>{features[0].desc}</p>

//               {/* mock output */}
//               <div style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "16px 16px 14px" }}>
//                 <div style={{ fontSize: 10.5, color: "#38364C", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Sample ranking output</div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                   <MockRankCard rank={1} name="Claude 3.5 Sonnet" score={92} color="#8B7CF8" delay={0.1} />
//                   <MockRankCard rank={2} name="GPT-4o" score={84} color="#8B7CF8" delay={0.2} />
//                   <MockRankCard rank={3} name="Gemini 1.5 Pro" score={77} color="#8B7CF8" delay={0.3} />
//                 </div>
//               </div>

//               <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
//                 {features[0].detail.map(d => (
//                   <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5A5870", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", padding: "5px 12px", borderRadius: 8 }}>
//                     <span className="check"><svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#8B7CF8" strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg></span>
//                     {d}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </Reveal>

//           {/* ── Prompt Lab ── */}
//           <Reveal delay={0.1} style={{ gridColumn: "3", gridRow: "1" }}>
//             <div className="fc" style={{ position: "relative", overflow: "hidden", borderColor: hoveredFeature === 1 ? `${features[1].color}28` : "rgba(255,255,255,.06)" }}
//               onMouseEnter={() => setHoveredFeature(1)} onMouseLeave={() => setHoveredFeature(null)}>
//               <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: features[1].glow, filter: "blur(50px)", pointerEvents: "none" }} />
//               <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[1].color}14`, border: `1px solid ${features[1].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[1].color, marginBottom: 16 }}>{features[1].icon}</div>
//               <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", marginBottom: 4, letterSpacing: "-.3px" }}>{features[1].title}</div>
//               <div style={{ fontSize: 11, color: features[1].color, fontWeight: 500, marginBottom: 14, opacity: .7 }}>{features[1].tag}</div>
//               <p style={{ fontSize: 14, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 22 }}>{features[1].desc}</p>
//               {/* comparison rows */}
//               <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//                 {[{ m: "GPT-4o", ms: "820ms", tok: "312t", c: "$0.005" }, { m: "Sonnet 3.5", ms: "540ms", tok: "298t", c: "$0.003" }, { m: "Gemini Pro", ms: "1.1s", tok: "325t", c: "$0.004" }].map((r, i) => (
//                   <div key={i} style={{ background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 9, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
//                     <span style={{ fontSize: 12.5, fontWeight: 500, color: "#C0BDD0", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.m}</span>
//                     <span style={{ fontSize: 11, color: "#38364C" }}>{r.ms}</span>
//                     <span style={{ fontSize: 11, color: "#38364C" }}>{r.tok}</span>
//                     <span style={{ fontSize: 11.5, color: features[1].color, fontWeight: 600 }}>{r.c}</span>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
//                 {features[1].detail.map(d => (
//                   <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5A5870" }}>
//                     <span className="check"><svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={features[1].color} strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg></span>
//                     {d}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Reveal>

//           {/* ── Cost Calculator ── */}
//           <Reveal delay={0.18} style={{ gridColumn: "3", gridRow: "2" }}>
//             <div className="fc" style={{ position: "relative", overflow: "hidden", borderColor: hoveredFeature === 2 ? `${features[2].color}28` : "rgba(255,255,255,.06)" }}
//               onMouseEnter={() => setHoveredFeature(2)} onMouseLeave={() => setHoveredFeature(null)}>
//               <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: features[2].glow, filter: "blur(50px)", pointerEvents: "none" }} />
//               <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[2].color}14`, border: `1px solid ${features[2].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[2].color, marginBottom: 16 }}>{features[2].icon}</div>
//               <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", marginBottom: 4, letterSpacing: "-.3px" }}>{features[2].title}</div>
//               <div style={{ fontSize: 11, color: features[2].color, fontWeight: 500, marginBottom: 14, opacity: .7 }}>{features[2].tag}</div>
//               <p style={{ fontSize: 14, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 22 }}>{features[2].desc}</p>
//               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                 {[{ l: "Per request", v: "$0.0024", hi: false }, { l: "Daily · 1k req", v: "$2.40", hi: false }, { l: "Monthly total", v: "$72.00", hi: true }].map((c, i) => (
//                   <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.hi ? `${features[2].color}0a` : "rgba(0,0,0,.18)", border: `1px solid ${c.hi ? features[2].color + "25" : "rgba(255,255,255,.06)"}`, borderRadius: 10, padding: "12px 16px" }}>
//                     <span style={{ fontSize: 12.5, color: "#46445A", fontWeight: 400 }}>{c.l}</span>
//                     <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: c.hi ? features[2].color : "#A8A6BA", letterSpacing: "-.5px" }}>{c.v}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* ──────────── How it works ──────────── */}
//       <section id="how" style={{ padding: "100px max(24px, calc((100vw - 1160px)/2))" }}>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>
//           <Reveal>
//             <span className="pill" style={{ marginBottom: 22, display: "inline-flex" }}>How it works</span>
//             <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400, letterSpacing: "-1.8px", color: "#EAE8F2", marginBottom: 20, lineHeight: 1.08, marginTop: 14 }}>
//               Requirements in.<br />
//               <em style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(110deg,#A78BFA,#2DD4BF)", WebkitBackgroundClip: "text" }}>Best model</em> out.
//             </h2>
//             <p style={{ color: "#46445A", fontSize: 15.5, lineHeight: 1.82, fontWeight: 300, maxWidth: 400, marginBottom: 38 }}>
//               No black-box magic. Every ranking is backed by math you can inspect — dimension scores, applied weights, and plain-language explanations for each decision.
//             </p>
//             <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//               <button className="bp" onClick={goLogin}>Try the wizard →</button>
//               <button className="bg" onClick={() => scrollTo("features")}>See all tools</button>
//             </div>
//           </Reveal>

//           <div>
//             {steps.map((step, i) => (
//               <Reveal key={i} delay={i * 0.1}>
//                 <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
//                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
//                     <div style={{ width: 46, height: 46, borderRadius: 13, border: `1px solid ${step.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: step.color, background: `${step.color}0a`, letterSpacing: ".02em" }}>{step.n}</div>
//                     {i < steps.length - 1 && <div style={{ width: 1.5, height: 54, background: `linear-gradient(to bottom, ${step.color}35, transparent)`, marginTop: 4 }} />}
//                   </div>
//                   <div style={{ paddingTop: 10, marginBottom: i < steps.length - 1 ? 0 : 0 }}>
//                     <h4 style={{ fontSize: 16, fontWeight: 500, color: "#C8C6D8", marginBottom: 9, letterSpacing: "-.25px" }}>{step.title}</h4>
//                     <p style={{ fontSize: 14, color: "#46445A", lineHeight: 1.78, fontWeight: 300, marginBottom: i < steps.length - 1 ? 36 : 0 }}>{step.body}</p>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ──────────── Testimonials ──────────── */}
//       <section id="testimonials" style={{ padding: "100px max(24px, calc((100vw - 1160px)/2))" }}>
//         <Reveal>
//           <div style={{ textAlign: "center", marginBottom: 56 }}>
//             <span className="pill" style={{ marginBottom: 18, display: "inline-flex" }}>What people say</span>
//             <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 400, letterSpacing: "-1.8px", color: "#EAE8F2", marginTop: 14 }}>
//               Decisions made with confidence
//             </h2>
//           </div>
//         </Reveal>

//         <Reveal delay={0.1}>
//           <div style={{ maxWidth: 680, margin: "0 auto" }}>
//             <div key={activeTestimonial} className="t-enter" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22, padding: "48px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
//               <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 350, height: 200, background: "radial-gradient(rgba(139,124,248,.07), transparent 70%)", pointerEvents: "none" }} />
//               <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 64, lineHeight: .8, color: "rgba(139,124,248,.2)", marginBottom: 12 }}>"</div>
//               <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(17px, 2.5vw, 22px)", color: "#C0BDD2", lineHeight: 1.68, fontWeight: 400, letterSpacing: "-.4px", marginBottom: 36 }}>
//                 {testimonials[activeTestimonial].quote}
//               </p>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
//                 <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7C6AF4,#2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff" }}>
//                   {testimonials[activeTestimonial].name[0]}
//                 </div>
//                 <div style={{ textAlign: "left" }}>
//                   <div style={{ fontSize: 14, fontWeight: 500, color: "#A8A6BA" }}>{testimonials[activeTestimonial].name}</div>
//                   <div style={{ fontSize: 12, color: "#3E3C52" }}>{testimonials[activeTestimonial].role}</div>
//                 </div>
//               </div>
//             </div>
//             <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
//               {testimonials.map((_, i) => (
//                 <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? 22 : 6, height: 6, borderRadius: 3, background: i === activeTestimonial ? "#8B7CF8" : "rgba(255,255,255,.12)", border: "none", cursor: "pointer", transition: "all .35s ease", padding: 0 }} />
//               ))}
//             </div>
//           </div>
//         </Reveal>
//       </section>

//       {/* ──────────── CTA ──────────── */}
//       <section style={{ padding: "0 max(24px, calc((100vw - 1160px)/2)) 120px" }}>
//         <Reveal>
//           <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, border: "1px solid rgba(139,124,248,.18)", padding: "96px 64px", textAlign: "center", background: "rgba(139,124,248,.035)" }}>
//             <div style={{ position: "absolute", top: 0, left: 0, width: 130, height: 130, border: "1px solid rgba(139,124,248,.1)", borderRadius: "0 0 130px 0", pointerEvents: "none" }} />
//             <div style={{ position: "absolute", bottom: 0, right: 0, width: 130, height: 130, border: "1px solid rgba(45,212,191,.08)", borderRadius: "130px 0 0 0", pointerEvents: "none" }} />
//             <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(139,124,248,.055) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black, transparent)", pointerEvents: "none" }} />
//             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, background: "radial-gradient(rgba(139,124,248,.08), transparent 70%)", pointerEvents: "none" }} />

//             <div style={{ position: "relative" }}>
//               <span className="pill" style={{ marginBottom: 22, display: "inline-flex" }}>Get started today</span>
//               <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 400, letterSpacing: "-2.2px", color: "#EAE8F2", marginBottom: 20, lineHeight: 1.06, marginTop: 14 }}>
//                 Choose your model.<br />
//                 <em className="grad-text">Ship with confidence.</em>
//               </h2>
//               <p style={{ color: "#46445A", fontSize: 17, marginBottom: 44, fontWeight: 300, maxWidth: 460, margin: "0 auto 44px", lineHeight: 1.78 }}>
//                 Hundreds of developers and teams use LLM Selector to make faster, smarter model decisions every day.
//               </p>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
//                 <button className="bp" style={{ fontSize: 16, padding: "16px 52px", borderRadius: 12 }} onClick={goLogin}>
//                   Create free account →
//                 </button>
//                 <button className="bg" style={{ borderRadius: 12 }} onClick={() => scrollTo("how")}>See how it works</button>
//               </div>
//             </div>
//           </div>
//         </Reveal>
//       </section>

//       {/* ──────────── Footer ──────────── */}
//       <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "44px max(24px, calc((100vw - 1160px)/2))" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#7C6AF4,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
//             </div>
//             <span style={{ fontSize: 14, fontWeight: 500, color: "#2E2C40" }}>LLM Selector</span>
//             <span style={{ fontSize: 12, color: "#22202E", marginLeft: 4 }}>© 2025</span>
//           </div>
//           <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
//             {["Features", "How it works", "Pricing", "Docs", "Sign in"].map(l => (
//               <button key={l} className="nl" style={{ fontSize: 13 }}
//                 onClick={l === "Sign in" ? goLogin : l === "Features" ? () => scrollTo("features") : l === "How it works" ? () => scrollTo("how") : undefined}>
//                 {l}
//               </button>
//             ))}
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";

/* ─── data ─────────────────────────────────────────────── */
const features = [
  {
    id: "recommend",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    title: "Smart Recommend",
    tag: "Most popular",
    desc: "7-step wizard scores every model across quality, speed, cost, and latency — returns ranked top-3 with full explainability and per-dimension contribution breakdown.",
    color: "#8B7CF8",
    glow: "rgba(139,124,248,0.18)",
    detail: ["Hard eligibility filters", "Dynamic weight engine", "Score contribution breakdown"],
  },
  {
    id: "lab",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
    title: "Prompt Lab",
    tag: "Prompt Testing",
    desc: "Fire identical prompts at up to 5 models at once. Compare outputs, latency, token counts, and cost side-by-side in a single view.",
    color: "#2DD4BF",
    glow: "rgba(45,212,191,0.15)",
    detail: ["Up to 5 parallel models", "Real latency & token data", "Persistent run history"],
  },
  {
    id: "calc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="11" y2="14" /><line x1="8" y1="18" x2="11" y2="18" />
        <line x1="14" y1="14" x2="16" y2="14" /><line x1="14" y1="18" x2="16" y2="18" />
      </svg>
    ),
    title: "Cost Calculator",
    tag: "Budget planning",
    desc: "Enter token volume and request count. Get instant per-request, daily, and 30-day cost projections with quick presets for common workloads.",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.15)",
    detail: ["Per-request precision", "Daily & monthly rollups", "Workload presets"],
  },
  {
    id: "compare",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Compare Models",
    tag: "Side-by-side",
    desc: "Select 2–5 models and see a full spec breakdown: performance radar, benchmark scores, cost, context window, and capability flags — all in one view.",
    color: "#F472B6",
    glow: "rgba(244,114,182,0.15)",
    detail: ["Performance radar chart", "Benchmark scores", "Monthly cost estimator"],
  },
];

const stats = [
  { value: "200+", label: "Models indexed" },
  { value: "5", label: "Scoring dimensions" },
  { value: "4", label: "Core tools" },
  { value: "0", label: "Vendor bias" },
];

const steps = [
  {
    n: "01",
    title: "Describe your workload",
    body: "Select use case, input modality, context window, quality constraints, and deployment requirements.",
    color: "#8B7CF8",
  },
  {
    n: "02",
    title: "Set budget & tradeoffs",
    body: "Define your cost ceiling, speed-vs-quality preference, required feature flags, and privacy constraints.",
    color: "#2DD4BF",
  },
  {
    n: "03",
    title: "Get ranked results",
    body: "Deterministic scoring engine returns top-3 with match labels, why-ranked sentences, and contribution scores.",
    color: "#F59E0B",
  },
  {
    n: "04",
    title: "Compare & decide",
    body: "Drill into the top picks side-by-side with radar charts, spec tables, and a live monthly cost estimator.",
    color: "#F472B6",
  },
];

const ticker = [
  "GPT-4o · $5 / 1M tokens",
  "Claude 3.5 Sonnet · $3 / 1M tokens",
  "Gemini 1.5 Pro · $3.5 / 1M tokens",
  "Llama 3.1 405B · $2.7 / 1M tokens",
  "Mistral Large · $4 / 1M tokens",
  "Qwen 2.5 72B · $1.2 / 1M tokens",
  "DeepSeek V3 · $0.9 / 1M tokens",
  "Command R+ · $3 / 1M tokens",
];

const testimonials = [
  { quote: "Saved us days of spreadsheet analysis. Recommended Claude Sonnet over GPT-4o for our use case and the reasoning was spot on.", name: "Arjun M.", role: "ML Engineer" },
  { quote: "Prompt Lab alone is worth it — finally an apples-to-apples comparison without writing test harnesses myself.", name: "Priya S.", role: "Product Lead" },
  { quote: "The cost calculator showed our monthly bill would drop 40% switching providers. We switched the next day.", name: "Daniel K.", role: "Startup CTO" },
];

/* ─── Compare models mock data ─────────────────────────── */
const ALL_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", intelligence_index: 88, coding_index: 85, agentic_index: 82, tokens_per_second: 90, ttft: 0.45, context_length: 128000, blended_per_1m: 5.0, open_source: false, multimodal: true, function_calling: true, json_mode: true, fine_tuning: false },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", intelligence_index: 92, coding_index: 91, agentic_index: 88, tokens_per_second: 80, ttft: 0.38, context_length: 200000, blended_per_1m: 3.0, open_source: false, multimodal: true, function_calling: true, json_mode: true, fine_tuning: false },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", intelligence_index: 83, coding_index: 80, agentic_index: 78, tokens_per_second: 70, ttft: 0.52, context_length: 1000000, blended_per_1m: 3.5, open_source: false, multimodal: true, function_calling: true, json_mode: true, fine_tuning: false },
  { id: "meta-llama/llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta", intelligence_index: 80, coding_index: 79, agentic_index: 74, tokens_per_second: 45, ttft: 0.71, context_length: 131072, blended_per_1m: 2.7, open_source: true, multimodal: false, function_calling: true, json_mode: true, fine_tuning: true },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", intelligence_index: 78, coding_index: 77, agentic_index: 72, tokens_per_second: 75, ttft: 0.42, context_length: 32768, blended_per_1m: 4.0, open_source: false, multimodal: false, function_calling: true, json_mode: true, fine_tuning: false },
  { id: "qwen/qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "Alibaba", intelligence_index: 76, coding_index: 82, agentic_index: 70, tokens_per_second: 60, ttft: 0.55, context_length: 131072, blended_per_1m: 1.2, open_source: true, multimodal: false, function_calling: true, json_mode: true, fine_tuning: true },
  { id: "deepseek/deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", intelligence_index: 82, coding_index: 86, agentic_index: 75, tokens_per_second: 55, ttft: 0.60, context_length: 65536, blended_per_1m: 0.9, open_source: true, multimodal: false, function_calling: true, json_mode: true, fine_tuning: false },
  { id: "cohere/command-r-plus", name: "Command R+", provider: "Cohere", intelligence_index: 74, coding_index: 72, agentic_index: 76, tokens_per_second: 65, ttft: 0.48, context_length: 128000, blended_per_1m: 3.0, open_source: false, multimodal: false, function_calling: true, json_mode: true, fine_tuning: true },
];

/* ─── hooks ─────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, y = 28, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function MockRankCard({ rank, name, score, color, delay }) {
  const [ref, inView] = useInView(0.05);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : "translateX(16px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      background: rank === 1 ? `${color}0c` : "rgba(0,0,0,.18)",
      border: rank === 1 ? `1px solid ${color}30` : "1px solid rgba(255,255,255,.06)",
      borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: rank === 1 ? color : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: rank === 1 ? "#fff" : "#4A4860", flexShrink: 0 }}>#{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#D0CDE0", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        <div style={{ height: 3.5, background: "rgba(255,255,255,.06)", borderRadius: 3 }}>
          <div style={{ height: "100%", width: inView ? `${score}%` : "0%", background: rank === 1 ? color : "rgba(255,255,255,.18)", borderRadius: 3, transition: "width 1.3s cubic-bezier(.22,1,.36,1) .2s" }} />
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: rank === 1 ? color : "#4A4860", flexShrink: 0 }}>{score}</div>
    </div>
  );
}

/* ─── Radar Chart ─────────────────────────────────────── */
function RadarChart({ models }) {
  const size = 220;
  const cx = size / 2, cy = size / 2, r = 80;
  const dims = ["Quality", "Speed", "Context", "Value", "Coding"];
  const n = dims.length;
  const modelColors = ["#8B7CF8", "#2DD4BF", "#F59E0B", "#F472B6", "#60A5FA"];

  function normalize(models) {
    const getScore = (m, d) => {
      if (d === "Quality") return m.intelligence_index || 60;
      if (d === "Speed") return m.tokens_per_second || 50;
      if (d === "Context") return Math.log2(m.context_length || 4096) * 5;
      if (d === "Value") return m.blended_per_1m > 0 ? Math.max(0, 100 - m.blended_per_1m * 12) : 90;
      if (d === "Coding") return m.coding_index || 60;
      return 50;
    };
    const raw = models.map(m => dims.map(d => getScore(m, d)));
    const maxes = dims.map((_, di) => Math.max(...raw.map(r => r[di])));
    return raw.map(scores => scores.map((s, di) => maxes[di] > 0 ? (s / maxes[di]) * 100 : 0));
  }

  const normScores = normalize(models);

  function getPoint(angle, value) {
    const rad = (angle - 90) * (Math.PI / 180);
    const rv = (value / 100) * r;
    return [cx + rv * Math.cos(rad), cy + rv * Math.sin(rad)];
  }

  const axes = dims.map((_, i) => (360 / n) * i);
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {/* grid */}
      {gridLevels.map(lvl => (
        <polygon key={lvl} points={axes.map(a => getPoint(a, lvl).join(",")).join(" ")}
          fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
      ))}
      {/* axes */}
      {axes.map((a, i) => {
        const [x, y] = getPoint(a, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.08)" strokeWidth="1" />;
      })}
      {/* model polygons */}
      {normScores.map((scores, mi) => {
        const pts = scores.map((s, di) => getPoint(axes[di], s).join(",")).join(" ");
        const c = modelColors[mi % modelColors.length];
        return (
          <g key={mi}>
            <polygon points={pts} fill={`${c}18`} stroke={c} strokeWidth="1.5" />
            {scores.map((s, di) => {
              const [px, py] = getPoint(axes[di], s);
              return <circle key={di} cx={px} cy={py} r="3" fill={c} />;
            })}
          </g>
        );
      })}
      {/* labels */}
      {dims.map((d, i) => {
        const [lx, ly] = getPoint(axes[i], 118);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#5A5870" fontFamily="DM Sans, sans-serif">{d}</text>;
      })}
    </svg>
  );
}

/* ─── Compare Modal ───────────────────────────────────── */
function CompareModal({ onClose }) {
  const [selected, setSelected] = useState([ALL_MODELS[0], ALL_MODELS[1], ALL_MODELS[2]]);
  const [search, setSearch] = useState("");
  const [monthlyTokens, setMonthlyTokens] = useState(1000000);
  const [activeTab, setActiveTab] = useState("overview");
  const modelColors = ["#8B7CF8", "#2DD4BF", "#F59E0B", "#F472B6", "#60A5FA"];

  const available = ALL_MODELS.filter(m =>
    !selected.find(s => s.id === m.id) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase()))
  );

  const addModel = (m) => { if (selected.length < 5) setSelected([...selected, m]); };
  const removeModel = (id) => setSelected(selected.filter(m => m.id !== id));

  const fmtContext = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;
  const monthlyCost = (m) => ((monthlyTokens / 1000000) * m.blended_per_1m).toFixed(2);

  const Flag = ({ on, label }) => (
    <span style={{
      fontSize: 10.5, padding: "3px 8px", borderRadius: 6,
      background: on ? "rgba(45,212,191,.1)" : "rgba(255,255,255,.04)",
      border: `1px solid ${on ? "rgba(45,212,191,.25)" : "rgba(255,255,255,.07)"}`,
      color: on ? "#2DD4BF" : "#3A3850", fontWeight: 500,
    }}>{label}</span>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.85)", backdropFilter: "blur(18px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 1100, background: "#0D0E1C", border: "1px solid rgba(255,255,255,.09)", borderRadius: 24, overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "28px 36px 24px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(244,114,182,.12)", border: "1px solid rgba(244,114,182,.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F472B6" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#EAE8F2", letterSpacing: "-.3px" }}>Compare Models</span>
              <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 100, background: "rgba(244,114,182,.1)", border: "1px solid rgba(244,114,182,.22)", color: "#F472B6", fontWeight: 500 }}>2–5 models</span>
            </div>
            <p style={{ fontSize: 13, color: "#46445A" }}>Select models to compare side-by-side across performance, cost, and capabilities.</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "#64627A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "24px 36px 36px" }}>
          {/* Model selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {selected.map((m, i) => (
                <div key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px 6px 12px", borderRadius: 9, background: `${modelColors[i]}10`, border: `1px solid ${modelColors[i]}28`, fontSize: 13, color: modelColors[i], fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: modelColors[i], flexShrink: 0 }} />
                  {m.name}
                  <button onClick={() => removeModel(m.id)} style={{ width: 16, height: 16, borderRadius: "50%", background: `${modelColors[i]}20`, border: "none", color: modelColors[i], cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
              {selected.length < 5 && (
                <div style={{ position: "relative" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="+ Add model…"
                    style={{ padding: "6px 14px", borderRadius: 9, border: "1px dashed rgba(255,255,255,.12)", background: "transparent", color: "#EAE8F2", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", width: 160 }} />
                  {(search || available.length > 0) && search && (
                    <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, width: 240, background: "#131424", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, overflow: "hidden", zIndex: 10, boxShadow: "0 16px 48px rgba(0,0,0,.6)" }}>
                      {available.slice(0, 5).map(m => (
                        <button key={m.id} onClick={() => { addModel(m); setSearch(""); }} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#C0BDD0", fontSize: 13, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "DM Sans, sans-serif" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}>
                          <span>{m.name}</span>
                          <span style={{ fontSize: 11, color: "#38364C" }}>{m.provider}</span>
                        </button>
                      ))}
                      {available.length === 0 && <div style={{ padding: "10px 14px", fontSize: 12, color: "#38364C" }}>No more models to add</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
            {selected.length < 2 && <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 6 }}>⚠ Add at least 2 models to compare</p>}
          </div>

          {selected.length >= 2 && (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,.07)", paddingBottom: 0 }}>
                {["overview", "benchmarks", "cost"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: "10px 18px", background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 500, fontFamily: "DM Sans, sans-serif",
                    color: activeTab === tab ? "#EAE8F2" : "#46445A",
                    borderBottom: activeTab === tab ? "2px solid #8B7CF8" : "2px solid transparent",
                    marginBottom: -1, transition: "color .2s",
                    textTransform: "capitalize",
                  }}>{tab}</button>
                ))}
              </div>

              {/* Overview tab */}
              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 11, color: "#38364C", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>Performance Radar</div>
                    <RadarChart models={selected} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {selected.map((m, i) => (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64627A" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: modelColors[i % modelColors.length] }} />
                          {m.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", fontSize: 10.5, color: "#38364C", fontWeight: 500, padding: "0 0 14px 0", textTransform: "uppercase", letterSpacing: ".06em" }}>Spec</th>
                          {selected.map((m, i) => (
                            <th key={m.id} style={{ textAlign: "center", fontSize: 12, color: modelColors[i % modelColors.length], fontWeight: 600, padding: "0 0 14px 12px", whiteSpace: "nowrap" }}>{m.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Provider", key: m => m.provider },
                          { label: "Context", key: m => fmtContext(m.context_length) },
                          { label: "Price / 1M", key: m => `$${m.blended_per_1m.toFixed(2)}` },
                          { label: "Speed (TPS)", key: m => m.tokens_per_second },
                          { label: "TTFT", key: m => `${m.ttft}s` },
                        ].map(row => (
                          <tr key={row.label} style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                            <td style={{ fontSize: 12.5, color: "#46445A", padding: "12px 0", fontWeight: 400 }}>{row.label}</td>
                            {selected.map((m, i) => (
                              <td key={m.id} style={{ fontSize: 13, color: "#C0BDD0", textAlign: "center", padding: "12px 12px" }}>{row.key(m)}</td>
                            ))}
                          </tr>
                        ))}
                        <tr style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                          <td style={{ fontSize: 12.5, color: "#46445A", padding: "12px 0" }}>Capabilities</td>
                          {selected.map((m, i) => (
                            <td key={m.id} style={{ textAlign: "center", padding: "12px 12px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                                <Flag on={m.open_source} label="Open" />
                                <Flag on={m.multimodal} label="Vision" />
                                <Flag on={m.function_calling} label="Tools" />
                                <Flag on={m.fine_tuning} label="FT" />
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Benchmarks tab */}
              {activeTab === "benchmarks" && (
                <div>
                  {[
                    { label: "Intelligence Index", key: "intelligence_index", color: "#8B7CF8", max: 100 },
                    { label: "Coding Index", key: "coding_index", color: "#2DD4BF", max: 100 },
                    { label: "Agentic Index", key: "agentic_index", color: "#F59E0B", max: 100 },
                    { label: "Speed (tokens/s)", key: "tokens_per_second", color: "#F472B6", max: 120 },
                  ].map(metric => (
                    <div key={metric.key} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11.5, color: "#46445A", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>{metric.label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selected.map((m, i) => {
                          const val = m[metric.key] || 0;
                          const pct = (val / metric.max) * 100;
                          return (
                            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ fontSize: 12.5, color: "#A8A6BA", width: 160, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.05)", borderRadius: 4 }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: modelColors[i % modelColors.length], borderRadius: 4, transition: "width 1s ease" }} />
                              </div>
                              <div style={{ fontSize: 12.5, color: modelColors[i % modelColors.length], fontWeight: 600, width: 36, textAlign: "right" }}>{val}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost tab */}
              {activeTab === "cost" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, padding: "16px 20px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12 }}>
                    <label style={{ fontSize: 13, color: "#64627A", whiteSpace: "nowrap" }}>Monthly tokens:</label>
                    <input type="range" min={100000} max={100000000} step={100000} value={monthlyTokens}
                      onChange={e => setMonthlyTokens(Number(e.target.value))}
                      style={{ flex: 1, accentColor: "#8B7CF8" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#EAE8F2", minWidth: 80, textAlign: "right" }}>
                      {monthlyTokens >= 1000000 ? `${(monthlyTokens / 1000000).toFixed(1)}M` : `${(monthlyTokens / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(selected.length, 3)}, 1fr)`, gap: 12 }}>
                    {selected.map((m, i) => {
                      const cost = monthlyCost(m);
                      const perReq = (m.blended_per_1m / 1000).toFixed(4);
                      return (
                        <div key={m.id} style={{ background: `${modelColors[i % modelColors.length]}08`, border: `1px solid ${modelColors[i % modelColors.length]}20`, borderRadius: 14, padding: "20px 22px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: modelColors[i % modelColors.length], marginBottom: 4 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#38364C", marginBottom: 16 }}>{m.provider}</div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10.5, color: "#38364C", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Rate</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#A8A6BA" }}>${m.blended_per_1m.toFixed(2)} <span style={{ fontSize: 11, color: "#38364C" }}>/ 1M tokens</span></div>
                          </div>
                          <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 12 }}>
                            <div style={{ fontSize: 10.5, color: "#38364C", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Est. Monthly</div>
                            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: modelColors[i % modelColors.length], letterSpacing: "-.5px" }}>${cost}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main ──────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);

  const goLogin = () => { window.location.href = "/login"; };
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#070810", color: "#EAE8F2", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0b12}::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px}
        .nl{color:#64627A;font-size:14px;font-weight:400;text-decoration:none;transition:color .2s;cursor:pointer;background:none;border:none;font-family:inherit;}
        .nl:hover{color:#EAE8F2;}
        .bp{background:linear-gradient(135deg,#7C6AF4,#A78BFA);color:#fff;border:none;padding:12px 26px;border-radius:10px;font-size:14.5px;font-weight:500;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:inherit;letter-spacing:-.01em;}
        .bp:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(124,106,244,.38);}
        .bp:active{transform:translateY(0);}
        .bg{background:transparent;color:#64627A;border:1px solid rgba(255,255,255,.1);padding:11px 22px;border-radius:10px;font-size:14px;font-weight:400;cursor:pointer;transition:all .2s;font-family:inherit;}
        .bg:hover{color:#EAE8F2;border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.03);}
        .bpink{background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;border:none;padding:12px 26px;border-radius:10px;font-size:14.5px;font-weight:500;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:inherit;letter-spacing:-.01em;}
        .bpink:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(244,114,182,.38);}
        .bpink:active{transform:translateY(0);}
        .pill{display:inline-flex;align-items:center;gap:5px;background:rgba(139,124,248,.09);border:1px solid rgba(139,124,248,.22);color:#9A8EF0;font-size:11.5px;font-weight:500;padding:4px 12px;border-radius:100px;letter-spacing:.01em;}
        .fc{border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:30px;background:rgba(255,255,255,.015);transition:border-color .3s,transform .3s,background .3s;}
        .fc:hover{background:rgba(255,255,255,.028);transform:translateY(-3px);}
        .ticker-wrap{overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent);}
        .ticker-inner{display:inline-flex;animation:ticker 32s linear infinite;}
        .ticker-inner.paused{animation-play-state:paused;}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .hbadge{animation:fadeUp .55s ease .05s both}
        .hh1{animation:fadeUp .6s ease .2s both}
        .hsub{animation:fadeUp .6s ease .35s both}
        .hact{animation:fadeUp .6s ease .5s both}
        .htrust{animation:fadeUp .6s ease .6s both}
        .hstats{animation:fadeUp .55s ease .72s both}
        .grad-text{background:linear-gradient(110deg,#A78BFA 0%,#7C6AF4 35%,#2DD4BF 70%,#A78BFA 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 7s ease infinite;}
        .orb{position:absolute;border-radius:50%;pointer-events:none;}
        .scroll-dot{animation:bobble 1.8s ease infinite;}
        .t-enter{animation:slideUp .4s cubic-bezier(.22,1,.36,1) both;}
        .check{width:15px;height:15px;border-radius:50%;background:rgba(139,124,248,.12);border:1px solid rgba(139,124,248,.22);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
      `}</style>

      {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}

      {/* ──────────── Navbar ──────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? "rgba(7,8,16,.94)" : "transparent",
        backdropFilter: scrolled ? "blur(22px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.07)" : "1px solid transparent",
        transition: "all .35s ease",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 33, height: 33, borderRadius: 9, background: "linear-gradient(135deg,#7C6AF4,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(124,106,244,.45)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: "-.4px" }}>LLM Selector</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <button className="nl" onClick={() => scrollTo("features")}>Features</button>
            <button className="nl" onClick={() => scrollTo("how")}>How it works</button>
            <button className="nl" onClick={() => scrollTo("testimonials")}>Reviews</button>
            <button className="nl" onClick={() => setShowCompare(true)} style={{ color: "#F472B6" }}>Compare</button>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
            <button className="nl" onClick={goLogin}>Sign in</button>
            <button className="bp" style={{ padding: "9px 20px", fontSize: 13 }} onClick={goLogin}>Start free →</button>
          </div>
        </div>
      </nav>

      {/* ──────────── Hero ──────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "140px 24px 110px", textAlign: "center", overflow: "hidden" }}>
        <div className="orb" style={{ width: 800, height: 800, top: "-15%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(124,106,244,.12) 0%, transparent 65%)" }} />
        <div className="orb" style={{ width: 380, height: 380, top: "28%", left: "3%", background: "radial-gradient(circle, rgba(45,212,191,.09) 0%, transparent 70%)" }} />
        <div className="orb" style={{ width: 300, height: 300, top: "18%", right: "3%", background: "radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)" }} />

        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.038) 1px, transparent 1px)", backgroundSize: "30px 30px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, black 15%, transparent 72%)", pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, height: 520, border: "1px solid rgba(139,124,248,.06)", borderRadius: "50%", animation: "spinSlow 50s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -5, left: "50%", width: 10, height: 10, borderRadius: "50%", background: "#8B7CF8", transform: "translateX(-50%)", boxShadow: "0 0 14px 3px rgba(139,124,248,.6)" }} />
          <div style={{ position: "absolute", bottom: -5, left: "50%", width: 6, height: 6, borderRadius: "50%", background: "#2DD4BF", transform: "translateX(-50%)", boxShadow: "0 0 10px 2px rgba(45,212,191,.5)" }} />
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 360, height: 360, border: "1px solid rgba(255,255,255,.03)", borderRadius: "50%", animation: "spinSlow 30s linear infinite reverse", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 840, zIndex: 2 }}>
          <div className="hbadge" style={{ marginBottom: 28 }}>
            <span className="pill">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B7CF8", display: "inline-block", animation: "pulseGlow 2s ease infinite" }} />
              Deterministic · Explainable · Vendor-neutral
            </span>
          </div>

          <h1 className="hh1" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(44px, 7.5vw, 84px)", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-3px", marginBottom: 30, color: "#EDE9F8" }}>
            The smartest way<br />to{" "}
            <em className="grad-text" style={{ fontStyle: "italic" }}>pick your LLM</em>
          </h1>

          <p className="hsub" style={{ fontSize: "clamp(15px, 2vw, 18.5px)", color: "#64627A", lineHeight: 1.78, fontWeight: 300, maxWidth: 560, margin: "0 auto 44px", letterSpacing: "-.01em" }}>
            Stop reading benchmarks. Describe your requirements — budget, speed, quality, use case — and we'll rank the best model with transparent, reproducible logic.
          </p>

          <div className="hact" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <button className="bp" style={{ fontSize: 16, padding: "15px 44px", borderRadius: 12 }} onClick={goLogin}>
              Get my recommendation →
            </button>
            <button className="bpink" style={{ fontSize: 14, padding: "14px 28px", borderRadius: 12 }} onClick={() => setShowCompare(true)}>
              Compare Models
            </button>
            <button className="bg" style={{ borderRadius: 12 }} onClick={() => scrollTo("features")}>
              Explore tools
            </button>
          </div>

          <div className="htrust" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["No credit card", "200+ models", "Free to start"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#46445A" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B7CF8" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="hstats" style={{ position: "relative", zIndex: 2, display: "flex", marginTop: 84, border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,.016)", backdropFilter: "blur(14px)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "22px 52px", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none", textAlign: "center", minWidth: 140 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, color: "#EAE8F2", marginBottom: 5, letterSpacing: "-1.2px" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#46445A", fontWeight: 400, letterSpacing: ".05em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.3 }}>
          <div style={{ width: 22, height: 36, border: "1px solid rgba(255,255,255,.3)", borderRadius: 11, display: "flex", justifyContent: "center", padding: "5px 0" }}>
            <div className="scroll-dot" style={{ width: 3, height: 7, borderRadius: 2, background: "#EAE8F2" }} />
          </div>
        </div>
      </section>

      {/* ──────────── Ticker ──────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "13px 0", background: "rgba(255,255,255,.01)" }}
        onMouseEnter={() => setTickerPaused(true)} onMouseLeave={() => setTickerPaused(false)}>
        <div className="ticker-wrap">
          <div className={`ticker-inner${tickerPaused ? " paused" : ""}`} style={{ whiteSpace: "nowrap" }}>
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 30px", fontSize: 12.5, color: "#46445A", fontWeight: 400 }}>
                <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#2E2C40", display: "inline-block", flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────── Features bento ──────────── */}
      <section id="features" style={{ padding: "110px max(24px, calc((100vw - 1160px)/2))" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span className="pill" style={{ marginBottom: 18, display: "inline-flex" }}>Four core tools</span>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 400, letterSpacing: "-2px", color: "#EAE8F2", marginTop: 14, marginBottom: 18, lineHeight: 1.08 }}>
              One platform.<br />Every decision.
            </h2>
            <p style={{ color: "#46445A", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.82, fontWeight: 300 }}>
              Each tool is independently powerful. Used together they eliminate guesswork from your entire model selection workflow.
            </p>
          </div>
        </Reveal>

        {/* Bento: recommend spans 2 cols, other tools stack in col 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto auto", gap: 14 }}>

          {/* ── Recommend: big ── */}
          <Reveal delay={0} style={{ gridColumn: "1 / 3", gridRow: "1 / 3" }}>
            <div className="fc" style={{ height: "100%", position: "relative", overflow: "hidden", borderColor: hoveredFeature === 0 ? `${features[0].color}28` : "rgba(255,255,255,.06)" }}
              onMouseEnter={() => setHoveredFeature(0)} onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", background: features[0].glow, filter: "blur(60px)", transition: "opacity .4s", opacity: hoveredFeature === 0 ? 1 : 0.35, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[0].color}14`, border: `1px solid ${features[0].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[0].color }}>{features[0].icon}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", letterSpacing: "-.3px" }}>{features[0].title}</div>
                    <div style={{ fontSize: 11, color: features[0].color, fontWeight: 500, marginTop: 2, opacity: .7 }}>{features[0].tag}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10.5, padding: "4px 11px", borderRadius: 100, background: `${features[0].color}10`, color: features[0].color, border: `1px solid ${features[0].color}22`, fontWeight: 500 }}>Most popular</span>
              </div>
              <p style={{ fontSize: 15, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 28, maxWidth: 460 }}>{features[0].desc}</p>
              <div style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "16px 16px 14px" }}>
                <div style={{ fontSize: 10.5, color: "#38364C", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Sample ranking output</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <MockRankCard rank={1} name="Claude 3.5 Sonnet" score={92} color="#8B7CF8" delay={0.1} />
                  <MockRankCard rank={2} name="GPT-4o" score={84} color="#8B7CF8" delay={0.2} />
                  <MockRankCard rank={3} name="Gemini 1.5 Pro" score={77} color="#8B7CF8" delay={0.3} />
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
                {features[0].detail.map(d => (
                  <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5A5870", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", padding: "5px 12px", borderRadius: 8 }}>
                    <span className="check"><svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#8B7CF8" strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg></span>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── Prompt Lab ── */}
          <Reveal delay={0.1} style={{ gridColumn: "3", gridRow: "1" }}>
            <div className="fc" style={{ position: "relative", overflow: "hidden", borderColor: hoveredFeature === 1 ? `${features[1].color}28` : "rgba(255,255,255,.06)" }}
              onMouseEnter={() => setHoveredFeature(1)} onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: features[1].glow, filter: "blur(50px)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[1].color}14`, border: `1px solid ${features[1].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[1].color, marginBottom: 16 }}>{features[1].icon}</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", marginBottom: 4, letterSpacing: "-.3px" }}>{features[1].title}</div>
              <div style={{ fontSize: 11, color: features[1].color, fontWeight: 500, marginBottom: 14, opacity: .7 }}>{features[1].tag}</div>
              <p style={{ fontSize: 14, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 22 }}>{features[1].desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[{ m: "GPT-4o", ms: "820ms", tok: "312t", c: "$0.005" }, { m: "Sonnet 3.5", ms: "540ms", tok: "298t", c: "$0.003" }, { m: "Gemini Pro", ms: "1.1s", tok: "325t", c: "$0.004" }].map((r, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 9, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "#C0BDD0", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.m}</span>
                    <span style={{ fontSize: 11, color: "#38364C" }}>{r.ms}</span>
                    <span style={{ fontSize: 11, color: "#38364C" }}>{r.tok}</span>
                    <span style={{ fontSize: 11.5, color: features[1].color, fontWeight: 600 }}>{r.c}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
                {features[1].detail.map(d => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5A5870" }}>
                    <span className="check"><svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={features[1].color} strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg></span>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── Cost Calculator ── */}
          <Reveal delay={0.18} style={{ gridColumn: "3", gridRow: "2" }}>
            <div className="fc" style={{ position: "relative", overflow: "hidden", borderColor: hoveredFeature === 2 ? `${features[2].color}28` : "rgba(255,255,255,.06)" }}
              onMouseEnter={() => setHoveredFeature(2)} onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: features[2].glow, filter: "blur(50px)", pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[2].color}14`, border: `1px solid ${features[2].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[2].color, marginBottom: 16 }}>{features[2].icon}</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", marginBottom: 4, letterSpacing: "-.3px" }}>{features[2].title}</div>
              <div style={{ fontSize: 11, color: features[2].color, fontWeight: 500, marginBottom: 14, opacity: .7 }}>{features[2].tag}</div>
              <p style={{ fontSize: 14, color: "#5A5870", lineHeight: 1.78, fontWeight: 300, marginBottom: 22 }}>{features[2].desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ l: "Per request", v: "$0.0024", hi: false }, { l: "Daily · 1k req", v: "$2.40", hi: false }, { l: "Monthly total", v: "$72.00", hi: true }].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.hi ? `${features[2].color}0a` : "rgba(0,0,0,.18)", border: `1px solid ${c.hi ? features[2].color + "25" : "rgba(255,255,255,.06)"}`, borderRadius: 10, padding: "12px 16px" }}>
                    <span style={{ fontSize: 12.5, color: "#46445A", fontWeight: 400 }}>{c.l}</span>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: c.hi ? features[2].color : "#A8A6BA", letterSpacing: "-.5px" }}>{c.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── Compare Models: full width ── */}
          <Reveal delay={0.24} style={{ gridColumn: "1 / 4", gridRow: "3" }}>
            <div className="fc" style={{ position: "relative", overflow: "hidden", borderColor: hoveredFeature === 3 ? `${features[3].color}28` : "rgba(255,255,255,.06)", cursor: "pointer" }}
              onMouseEnter={() => setHoveredFeature(3)} onMouseLeave={() => setHoveredFeature(null)}
              onClick={() => setShowCompare(true)}>
              <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 220, background: features[3].glow, filter: "blur(70px)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${features[3].color}14`, border: `1px solid ${features[3].color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: features[3].color, flexShrink: 0 }}>{features[3].icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 17, fontWeight: 500, color: "#EAE8F2", letterSpacing: "-.3px" }}>{features[3].title}</div>
                      <span style={{ fontSize: 10.5, padding: "3px 10px", borderRadius: 100, background: `${features[3].color}10`, color: features[3].color, border: `1px solid ${features[3].color}22`, fontWeight: 500 }}>New</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#5A5870", lineHeight: 1.7, fontWeight: 300, maxWidth: 520 }}>{features[3].desc}</p>
                  </div>
                </div>
                {/* mini radar preview */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <RadarChart models={ALL_MODELS.slice(0, 3)} />
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(rgba(13,14,28,.6) 30%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {features[3].detail.map(d => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5A5870" }}>
                      <span style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(244,114,182,.12)", border: "1px solid rgba(244,114,182,.22)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#F472B6" strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg>
                      </span>
                      {d}
                    </div>
                  ))}
                  <button className="bpink" style={{ marginTop: 8, fontSize: 13, padding: "10px 22px" }} onClick={e => { e.stopPropagation(); setShowCompare(true); }}>
                    Open Compare →
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────── How it works ──────────── */}
      <section id="how" style={{ padding: "100px max(24px, calc((100vw - 1160px)/2))" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>
          <Reveal>
            <span className="pill" style={{ marginBottom: 22, display: "inline-flex" }}>How it works</span>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400, letterSpacing: "-1.8px", color: "#EAE8F2", marginBottom: 20, lineHeight: 1.08, marginTop: 14 }}>
              Requirements in.<br />
              <em style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(110deg,#A78BFA,#2DD4BF)", WebkitBackgroundClip: "text" }}>Best model</em> out.
            </h2>
            <p style={{ color: "#46445A", fontSize: 15.5, lineHeight: 1.82, fontWeight: 300, maxWidth: 400, marginBottom: 38 }}>
              No black-box magic. Every ranking is backed by math you can inspect — dimension scores, applied weights, and plain-language explanations for each decision.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="bp" onClick={goLogin}>Try the wizard →</button>
              <button className="bg" onClick={() => scrollTo("features")}>See all tools</button>
            </div>
          </Reveal>

          <div>
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, border: `1px solid ${step.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: step.color, background: `${step.color}0a`, letterSpacing: ".02em" }}>{step.n}</div>
                    {i < steps.length - 1 && <div style={{ width: 1.5, height: 54, background: `linear-gradient(to bottom, ${step.color}35, transparent)`, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 500, color: "#C8C6D8", marginBottom: 9, letterSpacing: "-.25px" }}>{step.title}</h4>
                    <p style={{ fontSize: 14, color: "#46445A", lineHeight: 1.78, fontWeight: 300, marginBottom: i < steps.length - 1 ? 36 : 0 }}>{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Testimonials ──────────── */}
      <section id="testimonials" style={{ padding: "100px max(24px, calc((100vw - 1160px)/2))" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="pill" style={{ marginBottom: 18, display: "inline-flex" }}>What people say</span>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 400, letterSpacing: "-1.8px", color: "#EAE8F2", marginTop: 14 }}>
              Decisions made with confidence
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div key={activeTestimonial} className="t-enter" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22, padding: "48px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 350, height: 200, background: "radial-gradient(rgba(139,124,248,.07), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 64, lineHeight: .8, color: "rgba(139,124,248,.2)", marginBottom: 12 }}>"</div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(17px, 2.5vw, 22px)", color: "#C0BDD2", lineHeight: 1.68, fontWeight: 400, letterSpacing: "-.4px", marginBottom: 36 }}>
                {testimonials[activeTestimonial].quote}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7C6AF4,#2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff" }}>
                  {testimonials[activeTestimonial].name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#A8A6BA" }}>{testimonials[activeTestimonial].name}</div>
                  <div style={{ fontSize: 12, color: "#3E3C52" }}>{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? 22 : 6, height: 6, borderRadius: 3, background: i === activeTestimonial ? "#8B7CF8" : "rgba(255,255,255,.12)", border: "none", cursor: "pointer", transition: "all .35s ease", padding: 0 }} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section style={{ padding: "0 max(24px, calc((100vw - 1160px)/2)) 120px" }}>
        <Reveal>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, border: "1px solid rgba(139,124,248,.18)", padding: "96px 64px", textAlign: "center", background: "rgba(139,124,248,.035)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 130, height: 130, border: "1px solid rgba(139,124,248,.1)", borderRadius: "0 0 130px 0", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 130, height: 130, border: "1px solid rgba(45,212,191,.08)", borderRadius: "130px 0 0 0", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(139,124,248,.055) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black, transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, background: "radial-gradient(rgba(139,124,248,.08), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <span className="pill" style={{ marginBottom: 22, display: "inline-flex" }}>Get started today</span>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 400, letterSpacing: "-2.2px", color: "#EAE8F2", marginBottom: 20, lineHeight: 1.06, marginTop: 14 }}>
                Choose your model.<br />
                <em className="grad-text">Ship with confidence.</em>
              </h2>
              <p style={{ color: "#46445A", fontSize: 17, marginBottom: 44, fontWeight: 300, maxWidth: 460, margin: "0 auto 44px", lineHeight: 1.78 }}>
                Hundreds of developers and teams use LLM Selector to make faster, smarter model decisions every day.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button className="bp" style={{ fontSize: 16, padding: "16px 52px", borderRadius: 12 }} onClick={goLogin}>
                  Create free account →
                </button>
                <button className="bpink" style={{ fontSize: 15, padding: "15px 30px", borderRadius: 12 }} onClick={() => setShowCompare(true)}>
                  Compare Models
                </button>
                <button className="bg" style={{ borderRadius: 12 }} onClick={() => scrollTo("how")}>See how it works</button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────── Footer ──────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "44px max(24px, calc((100vw - 1160px)/2))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#7C6AF4,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#2E2C40" }}>LLM Selector</span>
            <span style={{ fontSize: 12, color: "#22202E", marginLeft: 4 }}>© 2025</span>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["Features", "How it works", "Compare", "Pricing", "Docs", "Sign in"].map(l => (
              <button key={l} className="nl" style={{ fontSize: 13, color: l === "Compare" ? "#F472B6" : undefined }}
                onClick={l === "Sign in" ? goLogin : l === "Features" ? () => scrollTo("features") : l === "How it works" ? () => scrollTo("how") : l === "Compare" ? () => setShowCompare(true) : undefined}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}