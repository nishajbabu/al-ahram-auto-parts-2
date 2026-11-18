import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Gauge, Plus, ShieldCheck, Zap } from "lucide-react";
import { LUXURY_EASE, PARTS_CATALOG, STRESS_TEST_MODES } from "../data/partsCatalog";

export function PartBlueprintSVG({
  type = "braking",
  isPerformance = false,
  darkSurface = true,
  className = "",
}) {
  const rawId = useId();
  const gradId = `metal-${type}-${rawId.replace(/:/g, "")}`;
  const accent = isPerformance ? "#D9383A" : darkSurface ? "#CBD5E1" : "#1E293B";
  const accentGlow = isPerformance
    ? "rgba(217, 56, 58, 0.30)"
    : darkSurface
      ? "rgba(203, 213, 225, 0.14)"
      : "rgba(15, 23, 42, 0.08)";

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-3xl transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)` }}
      />

      <svg
        viewBox="0 0 320 240"
        className="relative z-10 h-full w-full max-h-[260px] drop-shadow-[0_14px_26px_rgba(0,0,0,0.45)]"
        fill="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="48%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        <g opacity={darkSurface ? "0.16" : "0.12"} stroke="#94A3B8" strokeWidth="0.6">
          <line x1="20" y1="120" x2="300" y2="120" strokeDasharray="3 4" />
          <line x1="160" y1="20" x2="160" y2="220" strokeDasharray="3 4" />
          <circle cx="160" cy="120" r="88" strokeDasharray="2 5" />
        </g>

        {type === "braking" && (
          <g>
            <circle cx="152" cy="120" r="76" stroke={`url(#${gradId})`} strokeWidth="14" />
            <circle cx="152" cy="120" r="68" stroke="#334155" strokeWidth="1.5" />
            <circle cx="152" cy="120" r="36" fill="#14161D" stroke="#94A3B8" strokeWidth="2.5" />
            <circle cx="152" cy="120" r="14" stroke="#E2E8F0" strokeWidth="2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 152 120)`}>
                <line
                  x1="152"
                  y1="53"
                  x2="164"
                  y2="66"
                  stroke={accent}
                  strokeWidth={isPerformance ? "2.4" : "1.2"}
                  strokeLinecap="round"
                />
                <circle cx="152" cy="96" r="3" fill="#0B0B0D" stroke="#94A3B8" strokeWidth="1.2" />
              </g>
            ))}
            <path
              d="M204 62 C236 74, 248 118, 232 162 L205 152 C216 122, 208 92, 188 80 Z"
              fill="#181A22"
              stroke={accent}
              strokeWidth="2.4"
            />
            <circle cx="222" cy="100" r="6" stroke="#E2E8F0" strokeWidth="1.4" />
            <circle cx="224" cy="126" r="6" stroke="#E2E8F0" strokeWidth="1.4" />
          </g>
        )}

        {type === "engine" && (
          <g>
            <rect
              x="114"
              y="42"
              width="92"
              height="58"
              rx="6"
              fill="#181A22"
              stroke={`url(#${gradId})`}
              strokeWidth="2.5"
            />
            <line x1="114" y1="56" x2="206" y2="56" stroke={accent} strokeWidth="2.2" />
            <line x1="114" y1="66" x2="206" y2="66" stroke="#94A3B8" strokeWidth="1.8" />
            <line x1="114" y1="76" x2="206" y2="76" stroke="#94A3B8" strokeWidth="1.4" />
            <circle cx="160" cy="88" r="11" fill="#0B0B0D" stroke={accent} strokeWidth="2" />
            <path d="M148 98 L142 166 L178 166 L172 98 Z" fill="#15171F" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="160" y1="106" x2="160" y2="158" stroke={accent} strokeWidth="2" />
            <circle cx="160" cy="182" r="24" fill="#12141A" stroke={`url(#${gradId})`} strokeWidth="3" />
            <circle cx="160" cy="182" r="12" stroke={accent} strokeWidth="1.6" />
          </g>
        )}

        {type === "electrical" && (
          <g>
            <rect
              x="78"
              y="84"
              width="132"
              height="74"
              rx="10"
              fill="#15171F"
              stroke={`url(#${gradId})`}
              strokeWidth="2.6"
            />
            <rect x="108" y="54" width="84" height="24" rx="6" fill="#1B1E28" stroke={accent} strokeWidth="2" />
            <circle cx="198" cy="66" r="5" fill={accent} />
            <path d="M210 92 L248 102 L248 140 L210 150 Z" fill="#191C25" stroke="#94A3B8" strokeWidth="2" />
            <rect x="248" y="108" width="22" height="26" rx="2" stroke={accent} strokeWidth="2" />
            {[112, 118, 124, 130].map((y) => (
              <line key={y} x1="250" y1={y} x2="268" y2={y} stroke="#E2E8F0" strokeWidth="1.3" />
            ))}
            {[94, 108, 122, 136, 150, 164, 178].map((x) => (
              <line key={x} x1={x} y1="96" x2={x} y2="146" stroke={accent} strokeWidth="1.4" opacity="0.7" />
            ))}
          </g>
        )}
        
        {type === "control-arm" && (
          <g>
            {/* Forged Wishbone A-Arm */}
            <path
              d="M68 72 L212 114 C230 118, 230 126, 212 130 L68 172"
              stroke={`url(#${gradId})`}
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M74 75 L206 122 L74 169"
              stroke="#0F1218"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pivot Bushings & Ball Joint Stud */}
            <circle cx="68" cy="72" r="16" fill="#14161D" stroke={accent} strokeWidth="3" />
            <circle cx="68" cy="72" r="6" fill="#E2E8F0" />
            <circle cx="68" cy="172" r="16" fill="#14161D" stroke={accent} strokeWidth="3" />
            <circle cx="68" cy="172" r="6" fill="#E2E8F0" />
            <circle cx="222" cy="122" r="15" fill="#181A22" stroke={accent} strokeWidth="3" />
            <line x1="222" y1="92" x2="222" y2="107" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {type === "master-cylinder" && (
          <g>
            {/* Dual Fluid Reservoir */}
            <rect x="92" y="54" width="112" height="44" rx="8" fill="#161922" stroke="#94A3B8" strokeWidth="2.2" />
            <line x1="148" y1="54" x2="148" y2="98" stroke="#475569" strokeWidth="1.5" />
            <rect x="108" y="42" width="32" height="12" rx="3" fill="#1E293B" stroke={accent} strokeWidth="1.8" />
            {/* Honed Bore Barrel & Brake Booster Flange */}
            <rect
              x="76"
              y="108"
              width="148"
              height="48"
              rx="8"
              fill="#14161D"
              stroke={`url(#${gradId})`}
              strokeWidth="2.6"
            />
            <rect x="224" y="96" width="18" height="72" rx="4" fill="#1E222D" stroke={accent} strokeWidth="2" />
            <line x1="242" y1="132" x2="268" y2="132" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Hydraulic Outlet Ports */}
            <circle cx="114" cy="132" r="9" fill="#0B0B0D" stroke={accent} strokeWidth="2.2" />
            <circle cx="176" cy="132" r="9" fill="#0B0B0D" stroke={accent} strokeWidth="2.2" />
          </g>
        )}

        {type === "suspension" && (
          <g>
            <rect x="142" y="34" width="36" height="16" rx="3" fill="#1A1D26" stroke="#E2E8F0" strokeWidth="2" />
            <rect x="149" y="50" width="22" height="80" fill="#111319" stroke={accent} strokeWidth="2.2" />
            {[60, 76, 92, 108, 124].map((y) => (
              <path
                key={y}
                d={`M128 ${y} C148 ${y - 7}, 172 ${y + 7}, 192 ${y}`}
                stroke={`url(#${gradId})`}
                strokeWidth={isPerformance ? "5" : "3.8"}
                strokeLinecap="round"
              />
            ))}
            <rect x="144" y="130" width="32" height="58" rx="4" fill="#171A23" stroke="#CBD5E1" strokeWidth="2.2" />
            <circle cx="160" cy="198" r="12" fill="#0B0B0D" stroke={accent} strokeWidth="2.4" />
          </g>
        )}

        {type === "cooling" && (
          <g>
            <circle cx="160" cy="120" r="68" fill="#14161D" stroke={`url(#${gradId})`} strokeWidth="2.8" />
            <circle cx="160" cy="120" r="22" fill="#0B0B0D" stroke={accent} strokeWidth="2.2" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                d="M160 98 Q186 78 214 96"
                transform={`rotate(${deg} 160 120)`}
                stroke={accent}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ))}
            {[30, 90, 150, 210, 270, 330].map((deg) => (
              <circle
                key={deg}
                cx="160"
                cy="62"
                r="4"
                transform={`rotate(${deg} 160 120)`}
                stroke="#94A3B8"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {type === "exhaust" && (
          <g>
            <path d="M44 120 L92 120" stroke="#94A3B8" strokeWidth="14" strokeLinecap="round" />
            <rect
              x="92"
              y="82"
              width="124"
              height="76"
              rx="18"
              fill="#161820"
              stroke={`url(#${gradId})`}
              strokeWidth="2.6"
            />
            <line x1="112" y1="102" x2="196" y2="102" stroke={accent} strokeWidth="1.6" strokeDasharray="4 4" />
            <line x1="112" y1="138" x2="196" y2="138" stroke={accent} strokeWidth="1.6" strokeDasharray="4 4" />
            <path d="M216 102 L272 102" stroke={accent} strokeWidth="12" strokeLinecap="round" />
            <path d="M216 138 L272 138" stroke={accent} strokeWidth="12" strokeLinecap="round" />
          </g>
        )}

        {type === "filters" && (
          <g>
            <rect
              x="116"
              y="42"
              width="88"
              height="156"
              rx="12"
              fill="#14161D"
              stroke={`url(#${gradId})`}
              strokeWidth="2.6"
            />
            <rect x="128" y="64" width="64" height="114" rx="4" fill="#0B0B0D" stroke={accent} strokeWidth="1.8" />
            {[136, 144, 152, 160, 168, 176, 184].map((x) => (
              <line key={x} x1={x} y1="68" x2={x} y2="174" stroke="#94A3B8" strokeWidth="1.2" opacity="0.7" />
            ))}
            <ellipse cx="160" cy="48" rx="34" ry="7" fill="#1E293B" stroke={accent} strokeWidth="1.6" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function StressTestCockpit({ onInspectPart }) {
  const [modeIndex, setModeIndex] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [boostPct, setBoostPct] = useState(0);
  const holdTimerRef = useRef(null);

  const activeMode = STRESS_TEST_MODES[modeIndex];

  useEffect(() => {
    if (isHolding) {
      holdTimerRef.current = setInterval(() => {
        setBoostPct((prev) => Math.min(100, prev + 6));
      }, 45);
    } else {
      holdTimerRef.current = setInterval(() => {
        setBoostPct((prev) => Math.max(0, prev - 5));
      }, 45);
    }
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [isHolding]);

  const liveRpm = Math.round(900 + (activeMode.rpmTarget - 900) * (0.45 + (boostPct / 100) * 0.55));
  const liveLoad = Math.round(activeMode.loadPct * (0.5 + (boostPct / 100) * 0.5));
  const liveTemp = Math.round(activeMode.tempC * (0.75 + (boostPct / 100) * 0.25));
  const gaugeCircumference = 2 * Math.PI * 82;
  const gaugeOffset = gaugeCircumference * (1 - (liveLoad / 100) * 0.78);

  const recommendedParts = activeMode.recommendedIds
    .map((id) => PARTS_CATALOG.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <section
      id="section-cockpit"
      className="relative overflow-hidden border-y border-white/10 bg-[radial-gradient(ellipse_at_top,#0F1C36_0%,#0B0B0D_62%)] py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-500/15 via-blue-600/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
              INTERACTIVE STRESS SIMULATOR
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-white sm:text-5xl">
              Dial Into The Drive.
            </h2>
            <p className="mt-2 max-w-xl text-sm font-light text-zinc-300">
              Switch driving conditions and hold the telemetry trigger to see which Al Ahram heavy-duty components protect your vehicle under peak stress.
            </p>
          </div>

          <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-white/15 bg-black/50 p-1.5 backdrop-blur-md">
            {STRESS_TEST_MODES.map((m, idx) => {
              const selected = idx === modeIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeIndex(idx)}
                  className={`rounded-xl px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                    selected ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid items-center gap-8 rounded-3xl border border-white/15 bg-black/65 p-6 backdrop-blur-xl sm:p-10 lg:grid-cols-12">
          <div className="flex flex-col items-center justify-center lg:col-span-5">
            <div className="relative flex h-56 w-56 items-center justify-center">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-[138deg]">
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="10"
                  strokeDasharray={`${gaugeCircumference * 0.78} ${gaugeCircumference}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  fill="none"
                  stroke={boostPct > 70 ? "#D9383A" : activeMode.accent}
                  strokeWidth="10"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                  SYSTEM LOAD
                </span>
                <span className="font-mono-tech mt-1 text-4xl font-semibold text-white tabular-nums">
                  {liveLoad}%
                </span>
                <span className="font-mono-tech mt-1 text-xs text-sky-400 tabular-nums">
                  {liveRpm.toLocaleString()} RPM • {liveTemp}°C
                </span>
              </div>
            </div>

            <button
              type="button"
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className={`mt-2 inline-flex min-h-[46px] select-none items-center gap-2.5 rounded-full border px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                isHolding
                  ? "scale-95 border-[#D9383A] bg-[#D9383A] text-white shadow-[0_0_30px_rgba(217,56,58,0.65)]"
                  : "border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/15"
              }`}
            >
              <Zap className="h-4 w-4" />
              {isHolding ? "STRESS TESTING..." : "HOLD TO STRESS-TEST"}
            </button>
            <p className="mt-2.5 text-[11px] text-zinc-400">
              Press & hold to simulate peak {activeMode.label.toLowerCase()} demand
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <Gauge className="h-4 w-4 text-sky-400" /> {activeMode.label} Protection Stack
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Heavy-Duty Verified
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-300">{activeMode.tagline}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {recommendedParts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => onInspectPart(part.id, "performance")}
                  className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    boostPct > 55
                      ? "border-[#D9383A]/60 bg-[#D9383A]/10 shadow-[0_0_24px_rgba(217,56,58,0.2)]"
                      : "border-white/10 bg-[#141720] hover:border-white/35"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tech text-[10px] text-zinc-400">{part.sku}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{part.name}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-300">
                    <Flame className="h-3 w-3" />
                    <span>{part.variants.performance.specs.thermalRatingC}°C Rated</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function XRayCutawayShowcase({ onInspectPart }) {
  const [scanPos, setScanPos] = useState(50);
  const [selectedId, setSelectedId] = useState("brake-pads-rotors");
  const [xrayVariant, setXrayVariant] = useState("performance");
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const uid = useId().replace(/:/g, "");
  const bandHeight = 44;
  const topPct = Math.min(100 - bandHeight, Math.max(0, scanPos - bandHeight / 2));
  const bottomPct = Math.max(0, 100 - (topPct + bandHeight));

  const xrayModules = [
    { id: "brake-pads-rotors", label: "01 · Rotor & Caliper" },
    { id: "cylinder-heads", label: "02 · Cylinder Head" },
    { id: "struts", label: "03 · Monotube Strut" },
  ];

  // Auto-zoom into the selected module on phones so every detail & text label is crystal clear
  const mobileViewBoxes = {
    "brake-pads-rotors": "35 30 280 300",
    "cylinder-heads": "320 30 280 300",
    struts: "605 30 280 300",
  };
  const activeViewBox = isMobile ? mobileViewBoxes[selectedId] : "0 0 920 360";

  const activePart = PARTS_CATALOG.find((p) => p.id === selectedId) || PARTS_CATALOG[0];
  const activeSpec = activePart.variants[xrayVariant];
  const isPerf = xrayVariant === "performance";

  const updateFromPointer = (clientY, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    const pct = Math.min(78, Math.max(22, ((clientY - rect.top) / rect.height) * 100));
    setScanPos(pct);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9383A]">
            INTERNAL METALLURGY AUDIT
          </p>
          <h3 className="mt-2 text-2xl font-light tracking-tight text-white sm:text-4xl">
            Inspect the difference inside the metal.
          </h3>
          <p className="mt-2 max-w-xl text-xs text-zinc-400 sm:text-sm">
            Toggle OEM vs. Heavy-Duty and tap any assembly inside the scanner to compare tolerances and order directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-full border border-white/15 bg-[#12151E] p-1">
            {[
              { key: "standard", label: "Standard OEM" },
              { key: "performance", label: "Heavy-Duty" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setXrayVariant(opt.key)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all ${
                  xrayVariant === opt.key
                    ? opt.key === "performance"
                      ? "bg-[#D9383A] text-white"
                      : "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-400">
            <span>Scrub</span>
            <input
              type="range"
              min={22}
              max={78}
              value={scanPos}
              onChange={(e) => setScanPos(Number(e.target.value))}
              className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#D9383A]"
              aria-label="X-Ray Assembly Cutaway Position"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {xrayModules.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => setSelectedId(mod.id)}
            className={`font-mono-tech shrink-0 rounded-xl border px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] transition-all ${
              selectedId === mod.id
                ? "border-sky-400/60 bg-sky-500/15 text-sky-300"
                : "border-white/10 bg-[#12151E] text-zinc-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {mod.label}
          </button>
        ))}
      </div>

      <div
        className="relative h-[300px] w-full touch-none cursor-ns-resize overflow-hidden rounded-3xl border border-white/15 bg-[#0C0E14] sm:h-[370px]"
        onMouseMove={(e) => updateFromPointer(e.clientY, e.currentTarget)}
        onTouchMove={(e) => {
          if (e.touches[0]) updateFromPointer(e.touches[0].clientY, e.currentTarget);
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#1C2130_0%,#090A0E_78%)]">
          <svg viewBox={activeViewBox} className="h-full w-[95%] max-w-4xl" fill="none">
            <defs>
              <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="45%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id={`rotor-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            <line x1="70" y1="180" x2="850" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />

            <g
              transform="translate(175, 180)"
              onClick={() => setSelectedId("brake-pads-rotors")}
              className="cursor-pointer"
              opacity={selectedId === "brake-pads-rotors" ? 1 : 0.45}
            >
              <circle r="92" fill="#0F1218" stroke={`url(#rotor-${uid})`} strokeWidth="18" />
              <circle r="76" stroke="#334155" strokeWidth="1.5" />
              <circle r="44" fill="#181C26" stroke="#94A3B8" strokeWidth="2.5" />
              <circle r="16" fill="#090A0E" stroke="#E2E8F0" strokeWidth="2" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="54"
                  y1="0"
                  x2="78"
                  y2="14"
                  transform={`rotate(${deg})`}
                  stroke={isPerf ? "#D9383A" : "#94A3B8"}
                  strokeWidth={isPerf ? "2.6" : "1.5"}
                  strokeLinecap="round"
                />
              ))}
              <path
                d="M52 -72 C95 -52, 108 18, 88 72 L56 58 C70 20, 62 -25, 34 -48 Z"
                fill="#1E222D"
                stroke={isPerf ? "#D9383A" : "#94A3B8"}
                strokeWidth="2.5"
              />
            </g>

            <g
              transform="translate(460, 180)"
              onClick={() => setSelectedId("cylinder-heads")}
              className="cursor-pointer"
              opacity={selectedId === "cylinder-heads" ? 1 : 0.45}
            >
              <rect
                x="-115"
                y="-86"
                width="230"
                height="172"
                rx="14"
                fill="#151923"
                stroke={`url(#steel-${uid})`}
                strokeWidth="3"
              />
              {[-72, -24, 24, 72].map((px) => (
                <g key={px}>
                  <rect x={px - 17} y="-62" width="34" height="58" rx="4" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1.8" />
                  <rect x={px - 8} y="-4" width="16" height="56" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
                  <circle cx={px} cy="56" r="10" fill="#1E293B" stroke={isPerf ? "#D9383A" : "#94A3B8"} strokeWidth="2" />
                </g>
              ))}
            </g>

            <g
              transform="translate(745, 180)"
              onClick={() => setSelectedId("struts")}
              className="cursor-pointer"
              opacity={selectedId === "struts" ? 1 : 0.45}
            >
              <rect x="-24" y="-108" width="48" height="20" rx="4" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="-14" y="-88" width="28" height="170" rx="4" fill="#0F1218" stroke="#64748B" strokeWidth="2" />
              {[-68, -42, -16, 10, 36].map((sy) => (
                <path
                  key={sy}
                  d={`M-40 ${sy} C-14 ${sy - 10}, 14 ${sy + 10}, 40 ${sy}`}
                  stroke={`url(#steel-${uid})`}
                  strokeWidth={isPerf ? "7" : "4.5"}
                  strokeLinecap="round"
                />
              ))}
              <circle cx="0" cy="96" r="16" fill="#0B0B0D" stroke={isPerf ? "#D9383A" : "#94A3B8"} strokeWidth="2.5" />
            </g>
          </svg>
        </div>

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#04060B]/95"
          style={{ clipPath: `inset(${topPct}% 0% ${bottomPct}% 0%)` }}
        >
          <svg viewBox={activeViewBox} className="h-full w-[95%] max-w-4xl" fill="none">
            <g opacity="0.16" stroke="#38BDF8" strokeWidth="0.6">
              {[115, 230, 345, 460, 575, 690, 805].map((x) => (
                <line key={x} x1={x} y1="20" x2={x} y2="340" />
              ))}
              {[90, 180, 270].map((y) => (
                <line key={y} x1="40" y1={y} x2="880" y2={y} />
              ))}
            </g>

            <g transform="translate(175, 180)" opacity={selectedId === "brake-pads-rotors" ? 1 : 0.45}>
              <circle r="92" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle r="76" stroke={isPerf ? "#D9383A" : "#94A3B8"} strokeWidth="1.5" />
              {Array.from({ length: isPerf ? 24 : 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="48"
                  y1="0"
                  x2="88"
                  y2="8"
                  transform={`rotate(${i * (isPerf ? 15 : 30)})`}
                  stroke="#38BDF8"
                  strokeOpacity="0.7"
                  strokeWidth="1.3"
                />
              ))}
              <text x="-78" y="-110" fill="#38BDF8" fontSize="13" fontWeight="600" fontFamily="monospace">
                {isPerf ? "720°C CARBON VENTING" : "480°C OEM VENTING"}
              </text>
            </g>

            <g transform="translate(460, 180)" opacity={selectedId === "cylinder-heads" ? 1 : 0.45}>
              <rect x="-115" y="-86" width="230" height="172" rx="14" stroke="#E2E8F0" strokeWidth="1.4" strokeDasharray="5 3" />
              <path d="M-104 -68 H104 M-104 68 H104" stroke="#38BDF8" strokeWidth="2.5" strokeOpacity="0.8" />
              {[-72, -24, 24, 72].map((px) => (
                <g key={px}>
                  <rect x={px - 17} y="-62" width="34" height="58" rx="4" stroke="#D9383A" strokeWidth="1.6" />
                  <circle cx={px} cy="-16" r="6" stroke="#38BDF8" strokeWidth="1.5" />
                </g>
              ))}
              <text x="-85" y="-104" fill="#F8FAFC" fontSize="13" fontWeight="600" fontFamily="monospace">
                {isPerf ? "±5 µm 5-AXIS CNC PORT" : "±12 µm OEM CASTING"}
              </text>
            </g>

            <g transform="translate(745, 180)" opacity={selectedId === "struts" ? 1 : 0.45}>
              <rect x="-14" y="-88" width="28" height="170" rx="4" stroke="#38BDF8" strokeWidth="1.6" />
              <rect x="-8" y="-76" width="16" height="65" fill="#D9383A" fillOpacity="0.35" stroke="#D9383A" strokeWidth="1.2" />
              <rect x="-8" y="0" width="16" height="72" fill="#38BDF8" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.2" />
              <text x="-76" y="-122" fill="#38BDF8" fontSize="13" fontWeight="600" fontFamily="monospace">
                {isPerf ? "INVERTED MONOTUBE" : "TWIN-TUBE OEM GAS"}
              </text>
            </g>
          </svg>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 border-y border-sky-400/60 shadow-[0_0_45px_rgba(56,189,248,0.2)]"
          style={{ top: `${topPct}%`, height: `${bandHeight}%` }}
        >
          <div className="font-mono-tech absolute right-4 top-2.5 rounded-full border border-sky-400/40 bg-black/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sky-300 backdrop-blur-md">
            {isPerf ? "HEAVY-DUTY X-RAY" : "STANDARD OEM X-RAY"}
          </div>
        </div>
      </div>

      <motion.div
        key={`${activePart.id}-${xrayVariant}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: LUXURY_EASE }}
        className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/15 bg-[#12151E] p-5 sm:flex-row sm:items-center sm:p-6"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D9383A]">
              {activePart.sku} • {activeSpec.code}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> {activeSpec.warranty} Warranty
            </span>
          </div>
          <h4 className="mt-1 text-xl font-light text-white sm:text-2xl">{activePart.name}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeSpec.highlights.map((hl) => (
              <span
                key={hl}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-300"
              >
                {hl}
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
          <div className="font-mono-tech text-xl font-light text-white tabular-nums">
            AED {activeSpec.priceAED.toLocaleString()}
          </div>
          <button
            type="button"
            onClick={() => onInspectPart && onInspectPart(activePart.id, xrayVariant)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition-all hover:bg-zinc-200 sm:w-auto"
          >
            Configure & Order <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function HotspotBlueprintSection({ categories, onSelectCategory }) {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const uid = useId().replace(/:/g, "");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9383A]">
            CHASSIS TELEMETRY MATRIX
          </p>
          <h3 className="mt-2 text-2xl font-light tracking-tight text-white sm:text-4xl">
            Architecture mapped to every subsystem.
          </h3>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-zinc-400 sm:text-sm">
          Tap any pulsing <span className="font-semibold text-white">+</span> telemetry node or select a subsystem pill below.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(ellipse_at_center,#141926_0%,#080A0F_80%)] p-4 sm:p-10">
        <div className="relative mx-auto max-w-4xl">
          <svg viewBox="0 0 960 360" className="w-full" fill="none">
            <defs>
              <linearGradient id={`rigBeam-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            <g opacity="0.22" stroke="#64748B" strokeWidth="0.8">
              {[255, 275, 298, 325].map((y) => (
                <line key={y} x1="60" y1={y} x2="900" y2={y} />
              ))}
              {[-360, -240, -120, 0, 120, 240, 360].map((dx) => (
                <line key={dx} x1={480 + dx * 0.65} y1="245" x2={480 + dx * 1.25} y2="340" />
              ))}
            </g>

            <path
              d="M110 210 L165 148 L305 142 L395 96 L565 96 L675 142 L835 160 L870 202 L835 232 L130 232 Z"
              stroke={`url(#rigBeam-${uid})`}
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
            <path
              d="M305 142 L345 232 M565 96 L605 232 M395 96 L355 142 L590 142 L675 142"
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="4 3"
            />

            <path d="M135 214 L245 214 L320 198 L650 198" stroke="#F59E0B" strokeWidth="2.4" strokeOpacity="0.7" />
            <rect x="615" y="148" width="115" height="58" rx="6" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.6" />
            <rect x="775" y="156" width="22" height="58" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.6" />

            {[238, 712].map((wx) => (
              <g key={wx}>
                <line x1={wx} y1="145" x2={wx} y2="232" stroke="#94A3B8" strokeWidth="2.5" />
                <circle cx={wx} cy="232" r="52" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx={wx} cy="232" r="36" fill="#0B0D13" stroke="#94A3B8" strokeWidth="2" />
                <circle cx={wx} cy="232" r="24" stroke="#D9383A" strokeWidth="2.5" />
                <circle cx={wx} cy="232" r="7" fill="#E2E8F0" />
              </g>
            ))}
          </svg>

          {categories.map((cat) => {
            const isSelected = activeCat.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat)}
                aria-label={`Inspect ${cat.name}`}
                style={{ left: `${cat.hotspot.x}%`, top: `${cat.hotspot.y}%` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-lg transition-all duration-300 sm:h-9 sm:w-9 ${
                    isSelected
                      ? "scale-125 border-[#D9383A] bg-[#D9383A] text-white shadow-[0_0_24px_rgba(217,56,58,0.75)]"
                      : "border-white/50 bg-[#0B0B0D]/90 text-white hover:scale-110 hover:border-white"
                  }`}
                >
                  <Plus
                    className={`h-3 w-3 transition-transform duration-300 sm:h-4 sm:w-4 ${
                      isSelected ? "rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Easy-Tap Subsystem Pill Strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1 md:hidden">
          {categories.map((cat) => {
            const selected = activeCat.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={`font-mono-tech shrink-0 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-all ${
                  selected
                    ? "border-[#D9383A] bg-[#D9383A] text-white"
                    : "border-white/15 bg-black/50 text-zinc-300"
                }`}
              >
                {cat.shortName}
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeCat.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: LUXURY_EASE }}
          className="mt-5 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/15 bg-black/75 p-5 text-white backdrop-blur-xl sm:mt-8 sm:flex-row sm:items-center sm:p-6"
        >
          <div>
            <span className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D9383A]">
              {activeCat.code} • {activeCat.hotspot.label}
            </span>
            <h4 className="mt-1 text-xl font-light text-white sm:text-2xl">{activeCat.name}</h4>
            <p className="mt-1 max-w-xl text-xs text-zinc-300 sm:text-sm">{activeCat.tagline}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectCategory(activeCat.id)}
            className="min-h-[44px] w-full shrink-0 border border-white/35 bg-white/5 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all hover:border-white hover:bg-white hover:text-black sm:w-auto"
          >
            EXPLORE {activeCat.shortName} ↗
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Unified 3-Tab Engineering Studio (Combines Stress Test, X-Ray, and Hotspots in 1 compact stage)
 */
export function EngineeringStudioSection({ categories, onInspectPart, onSelectCategory }) {
  const [activeTab, setActiveTab] = useState("cockpit");

  const tabs = [
    { id: "cockpit", label: "01 · Stress Simulator" },
    { id: "xray", label: "02 · Hardware X-Ray" },
    { id: "hotspots", label: "03 · Chassis Telemetry" },
  ];

  return (
    <section
      id="section-studio"
      className="border-y border-white/10 bg-[#0B0B0D] py-14 sm:py-20"
    >
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400">
              INTERACTIVE ENGINEERING STUDIO
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/15 bg-[#12151E] p-1.5 no-scrollbar">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                    active
                      ? "bg-[#D9383A] text-white shadow-[0_0_20px_rgba(217,56,58,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: LUXURY_EASE }}
      >
        {activeTab === "cockpit" && <StressTestCockpit onInspectPart={onInspectPart} />}
        {activeTab === "xray" && <XRayCutawayShowcase onInspectPart={onInspectPart} />}
        {activeTab === "hotspots" && (
          <HotspotBlueprintSection categories={categories} onSelectCategory={onSelectCategory} />
        )}
      </motion.div>
    </section>
  );
}