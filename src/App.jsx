import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Gauge,
  Globe,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  User,
  Wrench,
  X,
} from "lucide-react";
import {
  BRAND_INFO,
  CATEGORIES,
  LUXURY_EASE,
  OEM_MARQUES,
  PARTS_CATALOG,
  SERVICE_BUNDLES,
  VEHICLE_MATRIX,
  VIN_PRESETS,
} from "./data/partsCatalog";
import {
  EngineeringStudioSection,
  PartBlueprintSVG,
} from "./components/PrecisionVisuals";

function AnimatedCounter({ value, suffix = "" }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    prevRef.current = value;
    const controls = animate(start, value, {
      duration: 0.9,
      ease: LUXURY_EASE,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function buildWhatsAppUrl({
  partName,
  variantLabel,
  fitment,
  orderMode = "retail",
  items = [],
  destination = "",
  notes = "",
  customIntro = "",
}) {
  const fitmentString =
    fitment?.make && fitment?.model && fitment?.year
      ? `${fitment.year} ${fitment.make} ${fitment.model}`
      : "General Fitment / To Be Confirmed";

  const lines = [
    customIntro || `Hello ${BRAND_INFO.legalName},`,
    `Order Mode: ${orderMode === "bulk" ? "Bulk Workshop / Fleet Trade" : "Retail Customer"}`,
    `Vehicle Fitment: ${fitmentString}`,
  ];

  if (items.length > 0) {
    lines.push("", "Quote / Order Hardware List:");
    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.name} [${item.variantLabel}] × ${item.qty} (${item.sku})`);
    });
  } else if (partName) {
    lines.push(`Selected Part: ${partName}`);
    if (variantLabel) lines.push(`Variant Spec: ${variantLabel}`);
  }

  if (destination) lines.push(`Destination: ${destination}`);
  if (notes) lines.push(`Notes: ${notes}`);
  lines.push("", "Please share availability, best price offer, and dispatch lead time.");

  return `https://wa.me/${BRAND_INFO.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

const TIMELINE_MILESTONES = [
  {
    year: "UAE HUB",
    tag: "+ WHEELING FLAGSHIP DESK",
    title: "Lateefa Building, Street 69",
    detail: "Centralized inventory staging in Shop #6 with rapid same-day UAE dispatch.",
  },
  {
    year: "OEM QC",
    tag: "+ MICRON TOLERANCE",
    title: "100% Bench-Verified Hardware",
    detail: "Every cylinder head, rotor, and starter passes strict hydraulic & dimensional audits.",
  },
  {
    year: "24x7",
    tag: "+ DIRECT FITMENT SUPPORT",
    title: "Instant WhatsApp Engineering",
    detail: "Live VIN/chassis verification and cross-referencing around the clock.",
  },
  {
    year: "GLOBAL",
    tag: "+ WORLDWIDE ON-TIME DELIVERY",
    title: "International Air Freight",
    detail: "Protected, customs-cleared express logistics to workshops & drivers worldwide.",
  },
];

const HOME_CHAPTERS = [
  { id: "section-hero", num: "01", label: "Showcase" },
  { id: "section-categories", num: "02", label: "Categories" },
  { id: "section-fitment", num: "03", label: "Fitment & Kits" },
  { id: "section-studio", num: "04", label: "Eng. Studio" },
  { id: "section-timeline", num: "05", label: "Global Hub" },
];

export default function App() {
  const [view, setView] = useState("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedPartId, setSelectedPartId] = useState(PARTS_CATALOG[0].id);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeChapter, setActiveChapter] = useState("section-hero");

  const [fitment, setFitment] = useState({ make: "", model: "", year: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [variantKey, setVariantKey] = useState("standard");

  const [workbenchTab, setWorkbenchTab] = useState("fitment");
  const [vinInput, setVinInput] = useState("");
  const [vinScanning, setVinScanning] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderMode, setOrderMode] = useState("retail");
  const [quoteItems, setQuoteItems] = useState([
    {
      id: PARTS_CATALOG[0].id,
      sku: PARTS_CATALOG[0].sku,
      name: PARTS_CATALOG[0].name,
      variantKey: "performance",
      variantLabel: PARTS_CATALOG[0].variants.performance.label,
      unitPriceAED: PARTS_CATALOG[0].variants.performance.priceAED,
      bulkDiscountPct: PARTS_CATALOG[0].variants.performance.bulkDiscountPct,
      qty: 1,
    },
  ]);
  const [destinationCity, setDestinationCity] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [quoteRef] = useState(
    () => `AA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const categoryStripRef = useRef(null);

  const fastMovingHeroParts = useMemo(
    () => PARTS_CATALOG.filter((p) => p.fastMoving),
    []
  );

  const activePart = useMemo(
    () => PARTS_CATALOG.find((p) => p.id === selectedPartId) || PARTS_CATALOG[0],
    [selectedPartId]
  );

  const isFitmentActive = Boolean(fitment.make && fitment.model && fitment.year);

  const filteredParts = useMemo(() => {
    return PARTS_CATALOG.filter((part) => {
      const catMatch = selectedCategoryId === "all" || part.categoryId === selectedCategoryId;
      const makeMatch = !fitment.make || part.compatibleMakes.includes(fitment.make);
      const q = searchQuery.trim().toLowerCase();
      const queryMatch =
        !q ||
        part.name.toLowerCase().includes(q) ||
        part.categoryName.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q);
      return catMatch && makeMatch && queryMatch;
    });
  }, [selectedCategoryId, fitment.make, searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, selectedPartId]);

  useEffect(() => {
    if (view !== "home") return undefined;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % fastMovingHeroParts.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [view, fastMovingHeroParts.length]);

  useEffect(() => {
    if (view !== "home") return undefined;
    const handleScroll = () => {
      const scrollMid = window.scrollY + window.innerHeight * 0.38;
      for (let i = HOME_CHAPTERS.length - 1; i >= 0; i -= 1) {
        const el = document.getElementById(HOME_CHAPTERS[i].id);
        if (el && el.offsetTop <= scrollMid) {
          setActiveChapter(HOME_CHAPTERS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [view]);

  const openCategoryView = (catId = "all") => {
    setSelectedCategoryId(catId);
    setView("catalog");
  };

  const openProductView = (partId, initialVariant = "standard") => {
    setSelectedPartId(partId);
    setVariantKey(initialVariant);
    setView("product");
  };

  const addToQuoteDrawer = (part, chosenVariantKey) => {
    const v = part.variants[chosenVariantKey];
    setQuoteItems((prev) => {
      const existing = prev.find(
        (item) => item.id === part.id && item.variantKey === chosenVariantKey
      );
      if (existing) {
        return prev.map((item) =>
          item.id === part.id && item.variantKey === chosenVariantKey
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: part.id,
          sku: part.sku,
          name: part.name,
          variantKey: chosenVariantKey,
          variantLabel: v.label,
          unitPriceAED: v.priceAED,
          bulkDiscountPct: v.bulkDiscountPct,
          qty: orderMode === "bulk" ? 5 : 1,
        },
      ];
    });
    setDrawerOpen(true);
  };

  const addServiceBundle = (bundle) => {
    setQuoteItems((prev) => {
      const next = [...prev];
      bundle.partIds.forEach((pId) => {
        const part = PARTS_CATALOG.find((p) => p.id === pId);
        if (!part) return;
        const v = part.variants[bundle.variantKey];
        const idx = next.findIndex(
          (item) => item.id === part.id && item.variantKey === bundle.variantKey
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        } else {
          next.push({
            id: part.id,
            sku: part.sku,
            name: part.name,
            variantKey: bundle.variantKey,
            variantLabel: v.label,
            unitPriceAED: v.priceAED,
            bulkDiscountPct: v.bulkDiscountPct,
            qty: 1,
          });
        }
      });
      return next;
    });
    setDrawerOpen(true);
  };

  const triggerVinDecode = (preset) => {
    setVinInput(preset.vin);
    setVinScanning(true);
    setTimeout(() => {
      setFitment(preset.fitment);
      setVinScanning(false);
    }, 650);
  };

  const handleManualVinDecode = (e) => {
    e.preventDefault();
    const cleaned = vinInput.trim().toUpperCase();
    if (!cleaned) return;
    setVinScanning(true);
    const matched =
      VIN_PRESETS.find((p) => p.vin === cleaned) ||
      (cleaned.startsWith("W")
        ? VIN_PRESETS[2]
        : cleaned.startsWith("JN")
          ? VIN_PRESETS[1]
          : VIN_PRESETS[0]);

    setTimeout(() => {
      setFitment(matched.fitment);
      setVinScanning(false);
    }, 700);
  };

  const updateItemQty = (id, vKey, delta) => {
    setQuoteItems((prev) =>
      prev
        .map((item) =>
          item.id === id && item.variantKey === vKey
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const quoteTotalAED = useMemo(() => {
    return quoteItems.reduce((sum, item) => {
      const effectivePrice =
        orderMode === "bulk"
          ? Math.round(item.unitPriceAED * (1 - item.bulkDiscountPct / 100))
          : item.unitPriceAED;
      return sum + effectivePrice * item.qty;
    }, 0);
  }, [quoteItems, orderMode]);

  const floatingWhatsAppHref = buildWhatsAppUrl({
    partName: view === "product" ? activePart.name : "Precision Spare Parts Inquiry",
    variantLabel: view === "product" ? activePart.variants[variantKey].label : "",
    fitment,
    orderMode,
  });

  const scrollCategoryStrip = (direction) => {
    if (!categoryStripRef.current) return;
    categoryStripRef.current.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  return (
    <>
    <div className="min-h-screen overflow-x-hidden bg-[#0B0B0D] text-zinc-100 selection:bg-[#D9383A] selection:text-white print:hidden">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0B0D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setView("home")}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-xs font-semibold tracking-widest text-white">
              AA
            </div>
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-white">
                AL AHRAM
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                Auto Spare Parts LLC
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 md:flex">
            <button
              type="button"
              onClick={() => setView("home")}
              className={`transition-colors hover:text-white ${view === "home" ? "text-white" : ""}`}
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => openCategoryView("all")}
              className={`transition-colors hover:text-white ${view === "catalog" ? "text-white" : ""}`}
            >
              Parts & Fitment
            </button>
            <button
              type="button"
              onClick={() => openProductView(fastMovingHeroParts[0].id, "performance")}
              className={`transition-colors hover:text-white ${view === "product" ? "text-white" : ""}`}
            >
              Hardware Specs
            </button>
            <a href="#contact-footer" className="transition-colors hover:text-white">
              UAE Flagship
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition-all hover:border-white/50 hover:bg-white/10"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Quote</span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D9383A] px-1 text-[10px] font-bold text-white">
              {quoteItems.reduce((acc, i) => acc + i.qty, 0)}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto border-t border-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400 md:hidden">
          <button
            type="button"
            onClick={() => setView("home")}
            className={`shrink-0 py-1 ${view === "home" ? "text-white" : ""}`}
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => openCategoryView("all")}
            className={`shrink-0 py-1 ${view === "catalog" ? "text-white" : ""}`}
          >
            Parts & Fitment
          </button>
          <button
            type="button"
            onClick={() => openProductView(fastMovingHeroParts[0].id, "performance")}
            className={`shrink-0 py-1 ${view === "product" ? "text-white" : ""}`}
          >
            Specs
          </button>
          <a href="#contact-footer" className="shrink-0 py-1">
            Contact
          </a>
        </div>
      </header>

      {view === "home" && (
        <>
          {/* MG Select Hairline Vertical Ticks (No Box, Zero Overlap) */}
          <aside
            aria-label="Section Quick Navigation"
            className="fixed right-2.5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3.5 mix-blend-difference md:flex lg:right-4"
          >
            {HOME_CHAPTERS.map((chap) => {
              const active = activeChapter === chap.id;
              return (
                <a
                  key={chap.id}
                  href={`#${chap.id}`}
                  aria-label={chap.label}
                  className="group relative flex items-center py-1"
                >
                  <span className="font-mono-tech pointer-events-none absolute right-6 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
                    {chap.num} · {chap.label}
                  </span>
                  <span
                    className={`block h-[2px] rounded-full transition-all duration-300 ${
                      active ? "w-5 bg-white" : "w-2.5 bg-white/45 group-hover:w-4 group-hover:bg-white"
                    }`}
                  />
                </a>
              );
            })}
          </aside>

          {/* Mobile Thumb Chapter Stepper (Bottom-Left, Opposite WhatsApp Button) */}
          <div className="fixed bottom-5 left-4 z-40 flex items-center gap-1 rounded-full border border-white/20 bg-[#141720]/95 p-1 text-white shadow-xl backdrop-blur-xl md:hidden">
            <button
              type="button"
              aria-label="Previous Chapter"
              onClick={() => {
                const idx = HOME_CHAPTERS.findIndex((c) => c.id === activeChapter);
                const prev = HOME_CHAPTERS[Math.max(0, idx - 1)];
                document.getElementById(prev.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-300 active:bg-white/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>

            <span className="font-mono-tech px-2 text-[10px] uppercase tracking-[0.14em] text-zinc-200">
              {HOME_CHAPTERS.find((c) => c.id === activeChapter)?.num || "01"}/05 ·{" "}
              {HOME_CHAPTERS.find((c) => c.id === activeChapter)?.label || "Showcase"}
            </span>

            <button
              type="button"
              aria-label="Next Chapter"
              onClick={() => {
                const idx = HOME_CHAPTERS.findIndex((c) => c.id === activeChapter);
                const next = HOME_CHAPTERS[Math.min(HOME_CHAPTERS.length - 1, Math.max(0, idx) + 1)];
                document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9383A] text-white active:opacity-80"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.main
            key="home-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: LUXURY_EASE }}
          >
            <section
              id="section-hero"
              className="snap-start relative flex min-h-[540px] items-center overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_top,#1F2433_0%,#0B0B0D_68%)] sm:min-h-[80vh]"
            >
              <button
                type="button"
                onClick={() =>
                  setHeroIndex((prev) => (prev - 1 + fastMovingHeroParts.length) % fastMovingHeroParts.length)
                }
                aria-label="Previous Featured Part"
                className="absolute left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/15 sm:left-8 sm:h-11 sm:w-11"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setHeroIndex((prev) => (prev + 1) % fastMovingHeroParts.length)}
                aria-label="Next Featured Part"
                className="absolute right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/15 sm:right-8 sm:h-11 sm:w-11"
              >
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-16 py-14 sm:px-20 lg:grid-cols-12 lg:gap-12 lg:px-24">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={fastMovingHeroParts[heroIndex].id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.65, ease: LUXURY_EASE }}
                    className="lg:col-span-6"
                  >
                    <div className="font-mono-tech mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D9383A]">
                      FAST-MOVING HARDWARE • {fastMovingHeroParts[heroIndex].sku}
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-white sm:text-6xl">
                      {fastMovingHeroParts[heroIndex].name}
                    </h1>
                    <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-zinc-300 sm:text-base">
                      {fastMovingHeroParts[heroIndex].tagline}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9 sm:gap-5">
                      <button
                        type="button"
                        onClick={() => openProductView(fastMovingHeroParts[heroIndex].id, "performance")}
                        className="inline-flex min-h-[44px] items-center gap-4 border border-white/40 bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white transition-all hover:border-white hover:bg-white hover:text-black sm:px-7"
                      >
                        EXPLORE PART <ArrowUpRight className="h-4 w-4" />
                      </button>

                      <a
                        href="#section-fitment"
                        className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:text-white"
                      >
                        VEHICLE FITMENT <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="lg:col-span-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`svg-${fastMovingHeroParts[heroIndex].id}`}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      transition={{ duration: 0.7, ease: LUXURY_EASE }}
                      className="rounded-3xl border border-white/10 bg-[#12151E]/90 p-6 backdrop-blur-xl sm:p-8"
                    >
                      <PartBlueprintSVG
                        type={fastMovingHeroParts[heroIndex].visualType}
                        isPerformance={true}
                        darkSurface={true}
                        className="h-52 sm:h-72"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-8">
                {fastMovingHeroParts.map((part, idx) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Select slide ${part.name}`}
                    className={`h-[2px] transition-all duration-500 ${
                      idx === heroIndex ? "w-14 bg-white sm:w-16" : "w-6 bg-white/25 hover:bg-white/50 sm:w-8"
                    }`}
                  />
                ))}
              </div>
            </section>

            <section className="border-b border-white/10 bg-[#09090B] py-4">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 lg:justify-between lg:px-10">
                <span className="font-mono-tech text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-500">
                  OEM & PERFORMANCE STANDARDS
                </span>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
                  {OEM_MARQUES.map((brand) => (
                    <span
                      key={brand}
                      className="text-xs font-semibold tracking-[0.22em] text-zinc-400 transition-colors hover:text-white"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section id="section-categories" className="snap-start relative bg-[#E4E8EF] text-[#0B0B0D]">
              {/* Top Gradient Bridge: Obsidian -> Brushed Silver Mist */}
              <div className="pointer-events-none h-14 bg-gradient-to-b from-[#09090B] via-[#1B202C]/70 to-transparent sm:h-20" />

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, ease: LUXURY_EASE }}
                className="mx-auto max-w-7xl px-6 py-8 lg:px-10 sm:py-12"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div>
                    <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                      WELCOME TO AL AHRAM SELECT
                    </p>
                    <h2 className="mt-3 text-3xl font-light tracking-tight text-[#0B0B0D] sm:text-5xl">
                      A New-Era of Precision Hardware
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollCategoryStrip(-1)}
                      aria-label="Scroll categories left"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/80 text-[#0B0B0D] transition-all hover:bg-[#0B0B0D] hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategoryStrip(1)}
                      aria-label="Scroll categories right"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/80 text-[#0B0B0D] transition-all hover:bg-[#0B0B0D] hover:text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={categoryStripRef}
                  className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.55, delay: idx * 0.04, ease: LUXURY_EASE }}
                      onClick={() => openCategoryView(cat.id)}
                      className="group relative flex w-[275px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-black/25 hover:bg-white hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#D9383A]">
                          {cat.code}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0B0B0D]" />
                      </div>

                      <div className="my-5 h-32">
                        <PartBlueprintSVG
                          type={cat.visualType}
                          isPerformance={idx % 2 === 0}
                          darkSurface={false}
                          className="h-full"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-[#0B0B0D]">{cat.name}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{cat.tagline}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Bottom Gradient Bridge: Brushed Silver Mist -> Fitment Slate */}
              <div className="pointer-events-none h-14 bg-gradient-to-b from-transparent via-[#252A38]/65 to-[#11131A] sm:h-20" />
            </section>

            <section id="section-fitment" className="snap-start border-b border-white/10 bg-[#11131A] py-16 sm:py-22">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9383A]">
                      INTERACTIVE WORKSHOP BAY
                    </p>
                    <h2 className="mt-2 text-2xl font-light text-white sm:text-4xl">
                      Fitment Verification & 1-Tap Service Kits
                    </h2>
                  </div>

                  <div className="inline-flex rounded-full border border-white/15 bg-[#0B0B0D] p-1">
                    <button
                      type="button"
                      onClick={() => setWorkbenchTab("fitment")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all ${
                        workbenchTab === "fitment" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Wrench className="h-3.5 w-3.5" /> Fitment & VIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkbenchTab("bundles")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all ${
                        workbenchTab === "bundles" ? "bg-[#D9383A] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" /> 1-Tap Service Kits
                    </button>
                  </div>
                </div>

                {workbenchTab === "fitment" ? (
                  <div className="space-y-6">
                    <FitmentFinderBar
                      fitment={fitment}
                      setFitment={setFitment}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      orderMode={orderMode}
                    />

                    <div className="rounded-2xl border border-white/10 bg-[#0B0B0D]/80 p-5">
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <form onSubmit={handleManualVinDecode} className="flex flex-1 flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-300">
                            <ScanLine className="h-4 w-4 text-sky-400" />
                            <span>Instant VIN Decoder</span>
                          </div>
                          <input
                            type="text"
                            value={vinInput}
                            onChange={(e) => setVinInput(e.target.value)}
                            placeholder="Enter 17-char VIN (or tap a preset)"
                            className="font-mono-tech min-h-[40px] flex-1 min-w-[210px] rounded-xl border border-white/15 bg-[#141720] px-4 py-2 text-xs uppercase text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="min-h-[40px] rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300 transition-all hover:bg-sky-500/25"
                          >
                            {vinScanning ? "Decoding..." : "Decode VIN"}
                          </button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Try:</span>
                          {VIN_PRESETS.map((preset) => (
                            <button
                              key={preset.vin}
                              type="button"
                              onClick={() => triggerVinDecode(preset)}
                              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-3">
                    {SERVICE_BUNDLES.map((bundle) => {
                      const bundleParts = bundle.partIds
                        .map((id) => PARTS_CATALOG.find((p) => p.id === id))
                        .filter(Boolean);
                      const bundleTotal = bundleParts.reduce(
                        (sum, p) => sum + p.variants[bundle.variantKey].priceAED,
                        0
                      );

                      return (
                        <div
                          key={bundle.id}
                          className="flex flex-col justify-between rounded-2xl border border-white/15 bg-[#0B0B0D] p-6"
                        >
                          <div>
                            <span className="font-mono-tech inline-block rounded-full border border-[#D9383A]/40 bg-[#D9383A]/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff7375]">
                              {bundle.badge}
                            </span>
                            <h3 className="mt-3 text-xl font-light text-white">{bundle.name}</h3>
                            <p className="mt-1 text-xs text-zinc-400">{bundle.subtitle}</p>
                            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                              {bundleParts.map((bp) => (
                                <div key={bp.id} className="flex items-center justify-between text-xs text-zinc-300">
                                  <span>• {bp.name}</span>
                                  <span className="font-mono-tech text-zinc-500">{bp.sku}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                                Bundle Est.
                              </div>
                              <div className="text-lg font-light text-white tabular-nums">
                                AED {bundleTotal.toLocaleString()}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => addServiceBundle(bundle)}
                              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-all hover:bg-zinc-200"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" /> Add Kit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Showing <span className="text-white">{filteredParts.length}</span> Precision Assemblies
                    {isFitmentActive && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-300 sm:ml-3 sm:mt-0">
                        <CheckCircle2 className="h-3 w-3" /> Guaranteed Fit: {fitment.year} {fitment.make}{" "}
                        {fitment.model}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openCategoryView("all")}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-white underline underline-offset-4 hover:text-[#D9383A]"
                  >
                    Open Full 14-Part Index
                  </button>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredParts.slice(0, 6).map((part, idx) => (
                    <PartCard
                      key={part.id}
                      part={part}
                      index={idx}
                      isFitmentActive={isFitmentActive}
                      onInspect={() => openProductView(part.id, "standard")}
                    />
                  ))}
                </div>
              </div>
            </section>

            <EngineeringStudioSection
              categories={CATEGORIES}
              onInspectPart={openProductView}
              onSelectCategory={openCategoryView}
            />

            <section id="section-timeline" className="snap-start relative bg-[#E4E8EF] text-[#0B0B0D]">
              {/* Top Gradient Bridge: Studio Obsidian -> Brushed Silver Mist */}
              <div className="pointer-events-none h-14 bg-gradient-to-b from-[#0B0B0D] via-[#1C202B]/70 to-transparent sm:h-20" />

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, ease: LUXURY_EASE }}
                className="mx-auto max-w-7xl px-6 py-8 lg:px-10 sm:py-12"
              >
                <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                      OUR STANDARD
                    </p>
                    <h2 className="mt-2 text-3xl font-light tracking-tight text-[#0B0B0D] sm:text-5xl">
                      Reliability written in motion.
                    </h2>
                  </div>
                  <p className="font-mono-tech text-xs uppercase tracking-[0.2em] text-zinc-600">
                    UAE Hub → Worldwide On-Time Dispatch
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {TIMELINE_MILESTONES.map((item) => (
                    <div
                      key={item.year}
                      className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm"
                    >
                      <div>
                        <span className="font-display text-2xl font-normal tracking-tight text-[#0B0B0D]">
                          {item.year}
                        </span>
                        <div className="font-mono-tech mt-4 inline-block rounded-full border border-black/10 bg-[#F1F5F9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                          {item.tag}
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-[#0B0B0D]">{item.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-600">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex h-8 items-end justify-between border-t border-black/10 pt-3 opacity-60">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[1px] ${i % 5 === 0 ? "h-5 bg-[#0B0B0D]" : "h-2.5 bg-zinc-500"}`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Bottom Gradient Bridge: Brushed Silver Mist -> Footer Obsidian */}
              <div className="pointer-events-none h-14 bg-gradient-to-b from-transparent via-[#161922]/75 to-[#08080A] sm:h-20" />
            </section>
          </motion.main>
        )}
        {view === "catalog" && (
          <motion.main
            key="catalog-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="mx-auto max-w-7xl px-6 py-12 lg:px-10"
          >
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Gallery
            </button>

            <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
              <div>
                <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9383A]">
                  AL AHRAM HARDWARE INDEX
                </p>
                <h1 className="mt-2 text-3xl font-light text-white sm:text-5xl">
                  {selectedCategoryId === "all"
                    ? "All Precision Spare Parts"
                    : CATEGORIES.find((c) => c.id === selectedCategoryId)?.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("all")}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all ${
                    selectedCategoryId === "all"
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/40"
                  }`}
                >
                  All ({PARTS_CATALOG.length})
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all ${
                      selectedCategoryId === cat.id
                        ? "border-white bg-white text-black"
                        : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/40"
                    }`}
                  >
                    {cat.shortName}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <FitmentFinderBar
                fitment={fitment}
                setFitment={setFitment}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                orderMode={orderMode}
              />
            </div>

            {filteredParts.length === 0 ? (
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#141720] p-10 text-center">
                <p className="text-base text-zinc-300">No assemblies matched that search filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setFitment({ make: "", model: "", year: "" });
                    setSearchQuery("");
                  }}
                  className="mt-4 border border-white/30 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black"
                >
                  Show All Parts
                </button>
              </div>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredParts.map((part, idx) => (
                  <PartCard
                    key={part.id}
                    part={part}
                    index={idx}
                    isFitmentActive={isFitmentActive}
                    onInspect={() => openProductView(part.id, "standard")}
                  />
                ))}
              </div>
            )}
          </motion.main>
        )}

        {view === "product" && (
          <motion.main
            key={`product-${activePart.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: LUXURY_EASE }}
            className="mx-auto max-w-7xl px-6 py-12 lg:px-10"
          >
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                <button
                  type="button"
                  onClick={() => openCategoryView(activePart.categoryId)}
                  className="inline-flex items-center gap-2 font-medium text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {activePart.categoryName}
                </button>
                <span className="text-zinc-700">/</span>
                <span className="font-mono-tech text-white">{activePart.sku}</span>
              </div>

              {isFitmentActive && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Guaranteed Fit: {fitment.year} {fitment.make} {fitment.model}
                </div>
              )}
            </div>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141720] p-6 sm:p-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                      {activePart.variants[variantKey].code}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        variantKey === "performance"
                          ? "border-[#D9383A]/50 bg-[#D9383A]/15 text-[#ff7375]"
                          : "border-white/20 bg-white/5 text-zinc-300"
                      }`}
                    >
                      {activePart.variants[variantKey].label}
                    </span>
                  </div>

                  <motion.div
                    key={`${activePart.id}-${variantKey}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: LUXURY_EASE }}
                    className="my-8 h-60 sm:h-76"
                  >
                    <PartBlueprintSVG
                      type={activePart.visualType}
                      isPerformance={variantKey === "performance"}
                      darkSurface={true}
                      className="h-full"
                    />
                  </motion.div>

                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {activePart.variants[variantKey].highlights.map((hl) => (
                      <span
                        key={hl}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between lg:col-span-6">
                <div>
                  <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.26em] text-[#D9383A]">
                    {activePart.categoryName} {activePart.fastMoving ? "• FAST-MOVING OEM" : ""}
                  </p>
                  <h1 className="mt-2 text-3xl font-light tracking-tight text-white sm:text-5xl">
                    {activePart.name}
                  </h1>
                  <p className="mt-4 text-sm font-light leading-relaxed text-zinc-300 sm:text-base">
                    {activePart.description}
                  </p>

                  <div className="mt-8">
                    <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
                      Select Hardware Specification
                    </div>
                    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-white/15 bg-[#141720] p-1.5 sm:rounded-full">
                      {["standard", "performance"].map((key) => {
                        const active = variantKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setVariantKey(key)}
                            className={`rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 sm:px-5 ${
                              active
                                ? key === "performance"
                                  ? "bg-[#D9383A] text-white shadow-[0_0_24px_rgba(217,56,58,0.45)]"
                                  : "bg-white text-black"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {activePart.variants[key].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#141720] p-5 sm:grid-cols-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Unit Price</div>
                      <div className="font-mono-tech mt-1 text-2xl font-light text-white tabular-nums">
                        AED <AnimatedCounter value={activePart.variants[variantKey].priceAED} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Workshop Bulk</div>
                      <div className="mt-1 text-lg font-light text-emerald-400">
                        -{activePart.variants[variantKey].bulkDiscountPct}% Trade Tier
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Warranty</div>
                      <div className="mt-1 text-lg font-light text-white">
                        {activePart.variants[variantKey].warranty}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => addToQuoteDrawer(activePart, variantKey)}
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-3 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-zinc-200"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Quote / Order
                  </button>
                  <a
                    href={buildWhatsAppUrl({
                      partName: activePart.name,
                      variantLabel: activePart.variants[variantKey].label,
                      fitment,
                      orderMode,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-3 border border-white/30 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:border-emerald-400 hover:bg-emerald-500/15"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" /> Order via WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <section className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_center,#181D2B_0%,#0B0B0D_75%)] p-6 sm:p-12">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
                <div>
                  <p className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9383A]">
                    DIAL INTO PERFORMANCE
                  </p>
                  <h2 className="mt-2 text-2xl font-light text-white sm:text-3xl">
                    Verified Tolerance & Durability Telemetry
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <Gauge className="h-4 w-4 text-[#D9383A]" />
                  Active Profile:{" "}
                  <span className="text-white">{activePart.variants[variantKey].label}</span>
                </div>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <TelemetryStatCard
                  label="Durability Index"
                  value={activePart.variants[variantKey].specs.durabilityIndex}
                  suffix=" / 100"
                  accent={variantKey === "performance"}
                />
                <TelemetryStatCard
                  label="CNC Machining Tolerance"
                  value={activePart.variants[variantKey].specs.toleranceMicrons}
                  suffix=" µm"
                  accent={variantKey === "performance"}
                />
                <TelemetryStatCard
                  label="Peak Thermal Rating"
                  value={activePart.variants[variantKey].specs.thermalRatingC}
                  suffix=" °C"
                  accent={variantKey === "performance"}
                />
                <TelemetryStatCard
                  label="Validated Duty Cycles"
                  value={activePart.variants[variantKey].specs.cyclesRated}
                  suffix="+"
                  accent={variantKey === "performance"}
                />
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      <footer id="contact-footer" className="border-t border-white/10 bg-[#08080A] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe, ...BRAND_INFO.sellingPoints[0] },
              { icon: ShieldCheck, ...BRAND_INFO.sellingPoints[1] },
              { icon: Clock, ...BRAND_INFO.sellingPoints[2] },
              { icon: Sliders, ...BRAND_INFO.sellingPoints[3] },
            ].map((sp) => (
              <div key={sp.title} className="rounded-2xl border border-white/10 bg-[#12151D] p-5">
                <sp.icon className="h-5 w-5 text-[#D9383A]" />
                <h3 className="mt-3 text-sm font-medium text-white">{sp.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{sp.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white">
                {BRAND_INFO.legalName}
              </h4>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Precision OEM & performance spare parts warehouse serving UAE motorists, workshops,
                and international clients worldwide.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D9383A]" />
                <span>{BRAND_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#D9383A]" />
                <span>
                  {BRAND_INFO.phoneMobile} / {BRAND_INFO.phoneLandline}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#D9383A]" />
                <a href={`mailto:${BRAND_INFO.email}`} className="hover:text-white">
                  {BRAND_INFO.email}
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between md:items-end">
              <a
                href={floatingWhatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2.5 border border-white/25 bg-white/5 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition-all hover:border-emerald-400 hover:bg-emerald-500/15"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" /> 24x7 Direct WhatsApp Desk
              </a>
              <p className="mt-6 text-[11px] text-zinc-500">
                © {new Date().getFullYear()} {BRAND_INFO.legalName}. Worldwide On-Time Delivery.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/15 bg-[#101218]/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                    Hardware Quote & Order
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {isFitmentActive
                      ? `Fitment: ${fitment.year} ${fitment.make} ${fitment.model}`
                      : "Worldwide Dispatch • 24x7 Support"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close Quote Drawer"
                  className="rounded-full border border-white/15 p-2 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-b border-white/10 px-6 py-4">
                <div className="grid grid-cols-2 rounded-xl border border-white/15 bg-[#0B0B0D] p-1">
                  <button
                    type="button"
                    onClick={() => setOrderMode("retail")}
                    className={`flex min-h-[38px] items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                      orderMode === "retail" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" /> Retail
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderMode("bulk")}
                    className={`flex min-h-[38px] items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                      orderMode === "bulk" ? "bg-[#D9383A] text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" /> Bulk Workshop
                  </button>
                </div>
                {orderMode === "bulk" && (
                  <p className="mt-2 text-[11px] text-emerald-400">
                    Trade Tier Active: Automatic bulk workshop discount applied across items.
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {quoteItems.length === 0 ? (
                  <div className="py-14 text-center text-sm text-zinc-500">
                    Your inquiry bag is empty. Select a spare part to request pricing.
                  </div>
                ) : (
                  quoteItems.map((item) => {
                    const effectiveUnit =
                      orderMode === "bulk"
                        ? Math.round(item.unitPriceAED * (1 - item.bulkDiscountPct / 100))
                        : item.unitPriceAED;

                    return (
                      <div
                        key={`${item.id}-${item.variantKey}`}
                        className="rounded-xl border border-white/10 bg-[#171B26] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                              {item.sku} • {item.variantLabel}
                            </div>
                            <div className="mt-0.5 text-sm font-medium text-white">{item.name}</div>
                          </div>
                          <div className="font-mono-tech text-right text-sm font-light text-white tabular-nums">
                            AED {(effectiveUnit * item.qty).toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-white/15 bg-[#0B0B0D]">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, item.variantKey, -1)}
                              aria-label="Decrease quantity"
                              className="px-3 py-1.5 text-zinc-400 hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-mono-tech px-3 text-xs tabular-nums text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, item.variantKey, 1)}
                              aria-label="Increase quantity"
                              className="px-3 py-1.5 text-zinc-400 hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            AED {effectiveUnit.toLocaleString()} / unit
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    placeholder="Delivery City / Country (e.g., Dubai, Riyadh, London)"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0D] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="VIN / Chassis number or workshop notes (optional)"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0D] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#0B0B0D] p-6">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Estimated Subtotal</span>
                  <span className="font-mono-tech text-xl font-light text-white tabular-nums">
                    AED {quoteTotalAED.toLocaleString()}
                  </span>
                </div>
                <a
                  href={buildWhatsAppUrl({
                    fitment,
                    orderMode,
                    items: quoteItems,
                    destination: destinationCity,
                    notes: customerNotes,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[48px] w-full items-center justify-center gap-2.5 bg-emerald-500 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-emerald-400"
                >
                  <MessageCircle className="h-4 w-4" /> Send Quote via WhatsApp
                </a>
                <button
               type="button"
               onClick={() => window.print()}
               disabled={quoteItems.length === 0}
               className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 border border-white/25 bg-white/5 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200 transition-all hover:border-white hover:bg-white/10 disabled:opacity-40"
             >
               <FileText className="h-4 w-4" /> Save / Print Proforma Quote (PDF)
             </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <a
        href={floatingWhatsAppHref}
        target="_blank"
        rel="noreferrer"
        aria-label="24x7 WhatsApp Parts Support"
        className="group fixed bottom-5 right-5 z-40 flex min-h-[44px] items-center gap-3 rounded-full border border-white/20 bg-[#141720]/95 px-4 py-3 text-xs font-medium text-white shadow-[0_12px_35px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all hover:border-emerald-400/60 hover:bg-[#191E2A] sm:bottom-6 sm:right-6"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <MessageCircle className="h-4 w-4 text-emerald-400" />
        <span className="hidden uppercase tracking-wider sm:inline">24x7 Parts Desk</span>
      </a>
    </div>
    {/* ==================== PRINTABLE PROFORMA QUOTE (PDF) ==================== */}
   <div className="hidden bg-white p-10 text-black print:block">
     <div className="flex items-start justify-between border-b-2 border-black pb-6">
       <div>
         <h1 className="text-2xl font-bold uppercase tracking-wider">{BRAND_INFO.legalName}</h1>
         <p className="mt-1 text-xs text-gray-700">{BRAND_INFO.address}</p>
         <p className="text-xs text-gray-700">
           Tel: {BRAND_INFO.phoneMobile} / {BRAND_INFO.phoneLandline} | {BRAND_INFO.email}
         </p>
       </div>
       <div className="text-right">
         <div className="text-lg font-bold uppercase tracking-widest">Proforma Quote</div>
         <div className="mt-1 text-xs text-gray-700">Ref: {quoteRef}</div>
         <div className="text-xs text-gray-700">Date: {new Date().toLocaleDateString()}</div>
       </div>
     </div>

     <div className="my-6 grid grid-cols-2 gap-4 rounded border border-gray-300 p-4 text-xs">
       <div>
         <span className="font-semibold">Order Tier: </span>
         {orderMode === "bulk" ? "Bulk Workshop / Trade Fleet" : "Retail Customer"}
       </div>
       <div>
         <span className="font-semibold">Vehicle Fitment: </span>
         {isFitmentActive
           ? `${fitment.year} ${fitment.make} ${fitment.model}`
           : "To Be Confirmed via VIN"}
       </div>
       <div>
         <span className="font-semibold">Destination: </span>
         {destinationCity || "UAE / International Dispatch"}
       </div>
       <div>
         <span className="font-semibold">Notes / VIN: </span>
         {customerNotes || "—"}
       </div>
     </div>

     <table className="w-full border-collapse text-left text-xs">
       <thead>
         <tr className="border-b border-black bg-gray-100">
           <th className="p-2.5">SKU</th>
           <th className="p-2.5">Spare Part</th>
           <th className="p-2.5">Specification</th>
           <th className="p-2.5 text-right">Qty</th>
           <th className="p-2.5 text-right">Unit (AED)</th>
           <th className="p-2.5 text-right">Line Total (AED)</th>
         </tr>
       </thead>
       <tbody>
         {quoteItems.map((item) => {
           const unit =
             orderMode === "bulk"
               ? Math.round(item.unitPriceAED * (1 - item.bulkDiscountPct / 100))
               : item.unitPriceAED;
           return (
             <tr key={`print-${item.id}-${item.variantKey}`} className="border-b border-gray-200">
               <td className="p-2.5 font-mono">{item.sku}</td>
               <td className="p-2.5 font-medium">{item.name}</td>
               <td className="p-2.5">{item.variantLabel}</td>
               <td className="p-2.5 text-right">{item.qty}</td>
               <td className="p-2.5 text-right">{unit.toLocaleString()}</td>
               <td className="p-2.5 text-right font-semibold">{(unit * item.qty).toLocaleString()}</td>
             </tr>
           );
         })}
       </tbody>
     </table>

     <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-4">
       <p className="text-[11px] text-gray-600">
         Confirm stock & final shipping via WhatsApp ({BRAND_INFO.phoneMobile}). Worldwide on-time delivery.
       </p>
       <div className="text-right text-base font-bold">
         Estimated Total: AED {quoteTotalAED.toLocaleString()}
       </div>
     </div>
   </div>
 </>
  );
}

function FitmentFinderBar({ fitment, setFitment, searchQuery, setSearchQuery, orderMode }) {
  const makes = Object.keys(VEHICLE_MATRIX);
  const models = fitment.make ? Object.keys(VEHICLE_MATRIX[fitment.make] || {}) : [];
  const years =
    fitment.make && fitment.model ? VEHICLE_MATRIX[fitment.make]?.[fitment.model] || [] : [];

  return (
    <div className="rounded-2xl border border-white/15 bg-[#151822] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
          <Wrench className="h-3.5 w-3.5 text-[#D9383A]" /> Vehicle Fitment Finder
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href={buildWhatsAppUrl({
              partName: "VIN / Part Photo Fitment Check",
              fitment,
              orderMode,
              customIntro: `Hello ${BRAND_INFO.legalName}, I am sending my VIN / Part Photo for quick fitment & price verification:`,
            })}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400 hover:text-emerald-300"
          >
            <Camera className="h-3.5 w-3.5" /> Send VIN / Part Photo
          </a>

          {(fitment.make || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFitment({ make: "", model: "", year: "" });
                setSearchQuery("");
              }}
              className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <select
            value={fitment.make}
            onChange={(e) => setFitment({ make: e.target.value, model: "", year: "" })}
            className="min-h-[44px] w-full appearance-none rounded-xl border border-white/15 bg-[#0B0B0D] px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
          >
            <option value="">1. Select Make</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
        </div>

        <div className="relative">
          <select
            disabled={!fitment.make}
            value={fitment.model}
            onChange={(e) => setFitment((f) => ({ ...f, model: e.target.value, year: "" }))}
            className="min-h-[44px] w-full appearance-none rounded-xl border border-white/15 bg-[#0B0B0D] px-4 py-3 text-xs text-white disabled:opacity-40 focus:border-white/40 focus:outline-none"
          >
            <option value="">2. Select Model</option>
            {models.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
        </div>

        <div className="relative">
          <select
            disabled={!fitment.model}
            value={fitment.year}
            onChange={(e) => setFitment((f) => ({ ...f, year: e.target.value }))}
            className="min-h-[44px] w-full appearance-none rounded-xl border border-white/15 bg-[#0B0B0D] px-4 py-3 text-xs text-white disabled:opacity-40 focus:border-white/40 focus:outline-none"
          >
            <option value="">3. Select Year</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part or SKU..."
            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#0B0B0D] py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function PartCard({ part, index, isFitmentActive, onInspect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.3), ease: LUXURY_EASE }}
      onClick={onInspect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-[#141720] p-6 transition-all duration-300 hover:border-white/30 hover:bg-[#191D29] focus:outline-none focus:ring-1 focus:ring-white/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {part.sku}
        </span>

        {isFitmentActive ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Guaranteed Fit
          </span>
        ) : part.offerBadge ? (
          <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300">
            {part.offerBadge}
          </span>
        ) : (
          part.fastMoving && (
            <span className="rounded-full border border-[#D9383A]/40 bg-[#D9383A]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#ff7375]">
              Fast-Moving
            </span>
          )
        )}
      </div>

      <div className="my-5 h-36">
        <PartBlueprintSVG
          type={part.visualType}
          isPerformance={false}
          darkSurface={true}
          className="h-full"
        />
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{part.categoryName}</div>
      <h3 className="mt-1 text-xl font-light text-white">{part.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{part.tagline}</p>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="font-mono-tech text-sm font-light text-white tabular-nums">
          From AED {part.variants.standard.priceAED.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-300 group-hover:text-white">
          Configure <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.div>
  );
}

function TelemetryStatCard({ label, value, suffix, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">{label}</div>
      <div
        className={`font-mono-tech mt-3 text-3xl font-light sm:text-4xl ${
          accent ? "text-[#ff6b6d]" : "text-white"
        }`}
      >
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: "30%" }}
          animate={{ width: accent ? "92%" : "68%" }}
          transition={{ duration: 0.85, ease: LUXURY_EASE }}
          className={`h-full rounded-full ${accent ? "bg-[#D9383A]" : "bg-zinc-300"}`}
        />
      </div>
    </div>
  );
}