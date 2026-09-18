import { createRoot } from "react-dom/client";
import {
  StrictMode,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ArrowDown, ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LINKS = {
  flowboard: "https://flowboard-ui-laxd.onrender.com",
  creatorDiscovery:
    "https://docs.google.com/spreadsheets/d/1fWYLva-L4iwIosN96CsjDjpo-3-neieaG9yzwQcWB4I/edit?gid=0#gid=0",
  affiliateLookup: "",
  querySelector: "",
};

const PROJECTS = [
  {
    id: "flowboard",
    number: "01",
    title: "FlowBoard",
    short: "Internal Trello-style tracker: Workspaces → Boards → Lists → Cards.",
    category: "Internal Tools",
    status: "Deployed",
    role: "Built as an internal tool",
    problem: "Objective: Track project work across teams in one shared, visual tool.",
    contribution:
      "Built the workspace/board/list/card structure, colour theming, a light-mode option, and support for multiple link attachments per card.",
    outcome:
      "Deployed and in active use, with colour theming and a light-mode toggle available to every workspace.",
    technologies: ["React", "Render (deployment)"],
    architecture: null,
    liveUrl: LINKS.flowboard,
    collaborators: [],
  },
  {
    id: "financial-auditor",
    number: "02",
    title: "Financial Auditor",
    short: "OCR-based cheque and invoice verification for creator payment records.",
    category: "AI / ML",
    status: "Shipped",
    role: "Built as a collaborative system",
    problem:
      "Manually checking every cheque and invoice against the finance sheet for name, IFSC and account-number mismatches was slow and easy to get wrong.",
    contribution:
      "Built the dual-OCR extraction and Gemini cross-check to flag mismatches automatically instead of a manual line-by-line review.",
    outcome:
      "Tested across seven banks, SBI, ICICI, HDFC, Kotak Mahindra, IndusInd, Bank of India, Citibank, and retries automatically through temporary Gemini 503s.",
    technologies: ["PaddleOCR", "Tesseract", "Gemini", "Google Drive"],
    architecture: [
      {
        label: "Verification pipeline",
        steps: [
          "Drive link → auto-download",
          "Normalize to JPEG",
          "Dual OCR: PaddleOCR + Tesseract",
          "Name / IFSC / account extraction",
          "Gemini cross-check",
          "Risk score + verdict",
        ],
      },
    ],
    liveUrl: "",
    collaborators: [],
  },
  {
    id: "query-selector",
    number: "03",
    title: "Query System, Query Selector & Hashtag Explorer",
    short: "AI-powered search-query generation and hashtag exploration for creator discovery.",
    category: "AI / ML",
    status: "Shipped",
    role: "Build",
    problem:
      "Turning a brief like 'lifestyle beauty influencers Bangalore' into search queries that actually surface relevant creators, instead of guessing keywords by hand.",
    contribution:
      "Built query_selector.py end to end, entity extraction from a plain-language brief, candidate query generation, SerpAPI-based scoring, and hashtag extraction, then exposed it as both a CLI tool and a FastAPI service (app.py).",
    outcome:
      "Five candidate queries generated and scored per brief; top hashtags extracted automatically feed the downstream creator-discovery scrape.",
    technologies: ["Gemini", "SerpAPI", "Python", "FastAPI"],
    architecture: [
      {
        label: "Query flow",
        steps: [
          "Plain-English brief",
          "Entity extraction (Gemini)",
          "5 candidate queries",
          "Scored via SerpAPI",
          "Best query selected",
          "Top-10 hashtags extracted",
          "Creators scraped per hashtag",
        ],
      },
    ],
    liveUrl: LINKS.querySelector,
    collaborators: [],
  },
  {
    id: "creator-discovery-system",
    number: "04",
    title: "Creator Discovery System, Amazon Affiliate to Persona Engine",
    short:
      "One evolving system: niche-by-niche creator sourcing that grew from Amazon affiliate tracking into full AI persona scoring.",
    category: "AI / ML",
    status: "Live",
    role: "Owned end to end",
    problem:
      "Sourcing creators niche by niche for the Amazon affiliate program meant tracking which ones had a usable Amazon Store ID, and the discovery logic itself only matched keywords and links, not creator fit.",
    contribution:
      "Built and matured this as a single system rather than separate tools: started with per-niche Amazon affiliate sourcing sheets (e-commerce, tech, home, fashion, beauty, and later gaming, birds & pets, corporate, regional and US-based creators), added Store ID tagging to separate resolved creators from ones needing follow-up, then rebuilt the discovery layer itself into the AI-powered Persona Engine with a weighted similarity score, rolled out across Beauty, Fashion, Home & Perfume from one shared file. Also built the reverse-lookup layer (paste a link, find the creator) that sits on top of the same data.",
    outcome:
      "The live tracking sheet currently shows ~600 creators with a resolved Amazon Store ID. 819 creators have been sourced through the Persona Engine layer alone (280 Fashion, 236 Beauty, 157 Home, 146 Perfume), and the same architecture has since extended into Gaming, Birds & Pets, Corporate and regional creator niches.",
    technologies: [
      "Google Sheets",
      "Google Apps Script",
      "Gemini",
      "Python",
      "Supabase",
      "PostgreSQL",
      "FastAPI",
    ],
    architecture: [
      {
        label: "Sourcing → Store ID resolution",
        steps: [
          "Niche sourcing sheet",
          "Creators scraped per niche",
          "Amazon Store ID check",
          "Resolved / queued for follow-up",
          "Live tracking sheet",
        ],
      },
      {
        label: "Reverse lookup (paste a link, get the creator)",
        steps: [
          "Apps Script → Sheets",
          "Sync to Supabase Postgres",
          "FastAPI match cascade",
          "Link Lookup page in Influencer Radar",
        ],
      },
    ],
    beforeAfter: [
      [
        "Query generation",
        "Static keyword list per niche",
        "Programmatic generation across platforms, topics & behaviours",
      ],
      [
        "Link detection",
        "Regex / hashtag e-com link detection",
        "Full creator persona (content pillars, brands, products) via Gemini",
      ],
      [
        "Validation",
        "Live Amazon tag validation & Store ID resolution",
        "Weighted Persona Similarity Score + hard-reject rules",
      ],
      [
        "Scoring",
        "Simple Gemini fit score (0-100)",
        "Creator Intelligence Score, single 0-100 rollup",
      ],
      [
        "Retargeting",
        "Manual keyword swap to retarget a new niche",
        "Self-learning knowledge base feeds every new AI call",
      ],
    ],
    niches: [
      { name: "Fashion", value: 280 },
      { name: "Beauty", value: 236 },
      { name: "Home", value: 157 },
      { name: "Perfume", value: 146 },
    ],
    extraNiches: ["Gaming", "Birds & Pets", "Corporate influencers", "Regional YouTube creators", "Mom (USA)"],
    liveStat: { label: "Creators with a resolved Store ID today", value: "~600" },
    liveUrl: LINKS.creatorDiscovery,
    liveLabel: "Open live tracking sheet",
    collaborators: [],
  },
  {
    id: "campaign-intelligence",
    number: "05",
    title: "Campaign Intelligence, Vivo & Coca-Cola",
    short: "Reconstructing how a brand marketing campaign actually ran, from creator content alone.",
    category: "Data",
    status: "Internal",
    role: "Build",
    problem:
      "No single view existed of which creators were posting for a given brand campaign, or how that campaign spread across creators over time.",
    contribution:
      "Built dedicated tracking dashboards that discover creators posting Vivo India and Coca-Cola campaign content and organize it into a readable picture of each campaign.",
    outcome: "Running dashboards for both Vivo India and Coca-Cola, used internally to track campaign creator activity.",
    technologies: ["Gemini", "YouTube Data API", "Google Sheets"],
    architecture: null,
    liveUrl: "",
    collaborators: [],
  },
  {
    id: "fmcg-leadgen",
    number: "06",
    title: "FMCG Lead Generation",
    short: "Distributor and wholesaler lead generation for FMCG brands.",
    category: "Automation",
    status: "Internal",
    role: "Build",
    problem: "FMCG brands needed a way to find distributor and wholesaler leads by region, rather than sourcing them manually.",
    contribution:
      "Mirrored the creator-discovery architecture to surface FMCG distributor leads instead of creators, combining results into a single working lead-generator sheet.",
    outcome: "A combined FMCG lead-generation sheet in active use for regional distributor prospecting.",
    technologies: ["YouTube Data API", "Google Apps Script"],
    architecture: null,
    liveUrl: "",
    collaborators: [],
  },
  {
    id: "data-cleaning",
    number: "07",
    title: "Data Cleaning at Scale",
    short: "Deduplication and standardization across 2L+ Instagram and YouTube records.",
    category: "Data",
    status: "Shipped",
    role: "Build",
    problem: "Records feeding the creator database carried duplicates, missing fields, and inconsistent formats across sources.",
    contribution:
      "Deduplicated 2+ lakh Instagram and YouTube records, repaired missing or broken fields, and standardized formats across sheets.",
    outcome: "Feeds directly into the 60,000+ creator database built for Influence Radar.",
    technologies: ["Python", "Google Sheets"],
    architecture: null,
    liveUrl: "",
    collaborators: [],
  },
  {
    id: "campaign-intelligence-2",
    number: "08",
    title: "Campaign Intelligence",
    short: "A connected brand → campaign → creator intelligence system for analysing historical creator collaborations.",
    category: "Data",
    status: "Internal",
    role: "Build",
    problem:
      "Campaign information was spread across different records, making it difficult to understand which creators had worked with a brand or campaign and the amounts associated with their previous collaborations.",
    contribution:
      "Built a connected Campaign Intelligence system that links brands, campaigns, and creators into a single relationship-based view. Starting with a creator, the system surfaces their previous campaigns, associated brands, and past campaign amounts. Starting with a campaign, it identifies the creators involved and connects them back to the corresponding brand and campaign history.",
    outcome:
      "Created a structured view of historical brand, campaign, and creator relationships, making it easier to analyse creator collaborations, campaign participation, and previous payout information.",
    technologies: ["PostgreSQL", "FastAPI", "SQLAlchemy", "React"],
    architecture: [
      { label: "Campaign Intelligence flow", steps: ["Brand", "Campaign", "Creators"] },
      {
        label: "Creator lookup",
        steps: ["Creator name", "Previous campaigns", "Past campaign amount", "Brand relationship"],
      },
      {
        label: "Campaign lookup",
        steps: ["Brand", "Campaign", "Creators who worked on campaign", "Creator history"],
      },
    ],
    liveUrl: "",
    collaborators: [],
  },
];

const STATS = [
  {
    num: "8",
    label: "Systems built",
    explain: "Internal tools, search, creator discovery, campaign tracking, lead generation and data work & more",
  },
  {
    num: "1000+",
    label: "Creators with a resolved Store ID",
    explain: "Creators with a resolved Amazon Store ID on the live tracking sheet.",
  },
  {
    num: "150+",
    label: "Creators Onboarded through the Persona Engine",
    explain: "Across Tech, Gaming, Fashion, Beauty, Home and Perfume, with the system later extended further.",
  },
  {
    num: "2L+",
    label: "Instagram + YouTube records cleaned",
    explain: "Duplicates removed, fields fixed and formats standardized.",
  },
];

const DELIVERY_ITEMS = [
  "Created and developed 20+ Google Apps Script solutions to automate different requirements and workflows received from various teams.",
  "Scraped and processed 1,500+ email/Phone records for the master database supporting the Influence Radar project.",
  "200+ payout records checked, including PAN, cheque and passbook details.",
];

const TECH_GROUPS = [
  {
    group: "AI",
    items: [
      {
        name: "Gemini",
        use: "Entity extraction, persona scoring, campaign clustering and cross-checks across the Query System, Creator Discovery System, Campaign Intelligence and Financial Auditor.",
      },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "FastAPI", use: "Query System service and the reverse-lookup match cascade inside the Creator Discovery System." },
      { name: "Python", use: "query_selector.py, the data-cleaning scripts, and the FMCG lead-generation pipeline." },
    ],
  },
  {
    group: "Database",
    items: [
      { name: "Supabase", use: "Storage and role-based access for the reverse-lookup feature." },
      { name: "PostgreSQL", use: "Underlying database behind the Supabase sync." },
    ],
  },
  {
    group: "Automation",
    items: [
      { name: "Google Apps Script", use: "Sheet-to-database sync across the Creator Discovery System and FMCG lead generation." },
      { name: "Google Drive", use: "Source of cheque/invoice images for the Financial Auditor." },
      { name: "Google Sheets", use: "Every sourcing, tracking and cleaning sheet across all seven systems." },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "Instagram", use: "Hashtag-based creator discovery, feeding the Query System output." },
      { name: "YouTube Data API", use: "Campaign Intelligence, FMCG lead generation, and the records cleaned at scale." },
      { name: "SerpAPI", use: "Query scoring inside the Query System." },
    ],
  },
  {
    group: "OCR",
    items: [
      { name: "PaddleOCR", use: "Primary OCR engine in the Financial Auditor." },
      { name: "Tesseract", use: "Secondary OCR engine, cross-checked against PaddleOCR." },
    ],
  },
];

const CATEGORIES = ["All", "AI / ML", "Automation", "Internal Tools", "Data"];

const JOURNEY_STEPS = [
  {
    stage: "01",
    title: "Internal tools",
    what: "Built FlowBoard to keep project work in one place.",
    tech: "React · Render",
    outcome: "A shared project board was deployed and used.",
  },
  {
    stage: "02",
    title: "Search and creator discovery",
    what: "Built tools to turn a brief into useful searches and find better creator matches.",
    tech: "Gemini · SerpAPI · Python · FastAPI",
    outcome: "Search, hashtag and creator discovery became more structured.",
  },
  {
    stage: "03",
    title: "Vivo Live Tracking Dashboard",
    what: "Created a live-tracking dashboard for Vivo to monitor campaign activities, creator performance, and key campaign data in real time.",
    tech: "Gemini · Google Sheets · Google Apps Script",
    outcome: "Enabled the team to track Vivo campaign activity and performance through a centralized, real-time dashboard.",
  },
  {
    stage: "04",
    title: "Data and verification",
    what: "Cleaned large creator datasets and built checks for payment records.",
    tech: "Python · Google Sheets · PaddleOCR · Tesseract · Gemini",
    outcome: "2L+ records were cleaned and payout documents were checked faster.",
  },
];

const NAV_ITEMS = [
  ["overview", "Overview"],
  ["impact", "Impact"],
  ["journey", "Journey"],
  ["recognition", "Recognition"],
  ["projects", "Projects"],
  ["live", "Live Demos"],
  ["stack", "Tools"],
];

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useReveal() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, active];
}

function useCountUp(value, shouldAnimate) {
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!shouldAnimate) return;
    const match = String(value).match(/[\d,]+(\.\d+)?/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(match[0].replace(/,/g, ""));
    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + match[0].length);
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(target * eased);
      setDisplay(`${prefix}${current.toLocaleString("en-IN")}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, value]);

  return display ?? value.replace(/[\d,]/g, "0");
}

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "" }) {
  const [ref, active] = useReveal();

  return (
    <div
      ref={ref}
      className={`reveal ${active ? "reveal-on" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function StatBlock({ stat, active }) {
  const display = useCountUp(stat.num, active);

  return (
    <div className="stat-block">
      <div className="stat-num">{display}</div>
      <div className="stat-label">{stat.label}</div>
      <div className="stat-explain">{stat.explain}</div>
    </div>
  );
}
function FlowSteps({ steps }) {
  const [activeIndex, setActiveIndex] = useState(null);
  if (!steps) return null;

  return (
    <div className="flow-wrap">
      <div className="flow">
        {steps.map((step, i) => (
          <span className="flow-item" key={step}>
            <button
              type="button"
              className={`flow-step ${activeIndex === i ? "flow-step-active" : ""}`}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
            >
              {step}
            </button>
            {i < steps.length - 1 && <ArrowDown className="flow-arrow" size={14} />}
          </span>
        ))}
      </div>
    </div>
  );
}

function ArchitectureFlowGroup({ flows }) {
  if (!flows) return null;
  return (
    <div className="arch-flow-group">
      {flows.map((flow) => (
        <div className="arch-flow-item" key={flow.label}>
          <div className="arch-flow-label">{flow.label}</div>
          <FlowSteps steps={flow.steps} />
        </div>
      ))}
    </div>
  );
}

function StatusTag({ status }) {
  const tone = status === "Live" || status === "Deployed" ? "live" : status === "Internal" ? "internal" : "shipped";
  return <span className={`tag tag-${tone}`}>{status}</span>;
}

function ProjectCard({ project, onOpen }) {
  return (
    <button className="proj-card" onClick={() => onOpen(project)}>
      <div className="proj-card-top">
        <span className="proj-number">{project.number}</span>
        <StatusTag status={project.status} />
      </div>
      <h3 className="proj-title">{project.title}</h3>
      <p className="proj-short">{project.short}</p>
      <div className="proj-tech">
        {project.technologies.slice(0, 3).map((tech) => (
          <span className="chip" key={tech}>
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="chip chip-more">+{project.technologies.length - 3}</span>
        )}
      </div>
      <div className="proj-card-foot">
        <span className="proj-category">{project.category}</span>
        <span className="proj-link">Click for details</span>
      </div>
      <div className="proj-hover-summary">
        <div className="proj-hover-label">Quick summary</div>
        <p>{project.problem}</p>
        <div className="proj-hover-result">
          <span>Result</span>
          {project.outcome}
        </div>
      </div>
    </button>
  );
}

function BeforeAfterSlider({ rows }) {
  const [slider, setSlider] = useState(50);
  return (
    <div className="ba-wrap">
      <div className="ba-labels">
        <span className="ba-label">v1 — rule-based</span>
        <span className="ba-label ba-label-right">v2 — persona engine</span>
      </div>
      <div className="ba-slider-track">
        <input
          type="range"
          min={0}
          max={100}
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          className="ba-range"
          aria-label="Compare v1 to v2"
        />
      </div>
      <div className="ba-rows">
        {rows.map(([label, before, after]) => (
          <div className="ba-row" key={label}>
            <div className="ba-row-label">{label}</div>
            <div className="ba-row-body">
              <div className="ba-cell" style={{ opacity: 0.35 + (0.65 * (100 - slider)) / 100 }}>
                {before}
              </div>
              <div className="ba-cell ba-cell-v2" style={{ opacity: 0.35 + (0.65 * slider) / 100 }}>
                {after}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!project) return null;

  const maxNicheValue = project.niches ? Math.max(...project.niches.map((n) => n.value)) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal-head">
          <span className="proj-number modal-number">{project.number}</span>
          <StatusTag status={project.status} />
        </div>

        <h2 className="modal-title">{project.title}</h2>
        <div className="modal-meta">{project.role}</div>

        <div className="modal-section">
          <div className="modal-kicker">Objective</div>
          <p className="ws-p">{project.problem}</p>
        </div>

        <div className="modal-section modal-section-highlight">
          <div className="modal-kicker modal-kicker-accent">What I built</div>
          <p className="ws-p">{project.contribution}</p>
          {project.collaborators.length > 0 && (
            <div className="collab-note">Built with {project.collaborators.join(" & ")}.</div>
          )}
        </div>

        {project.architecture && (
          <div className="modal-section">
            <div className="modal-kicker">How it works</div>
            <ArchitectureFlowGroup flows={project.architecture} />
          </div>
        )}

        {project.beforeAfter && (
          <div className="modal-section">
            <div className="modal-kicker">v1 → v2</div>
            <BeforeAfterSlider rows={project.beforeAfter} />
          </div>
        )}

        {project.niches && (
          <div className="modal-section">
            <div className="modal-kicker">Creators sourced by niche (Persona Engine)</div>
            {project.niches.map((niche) => (
              <div className="bar-row" key={niche.name}>
                <span className="bar-label">{niche.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(niche.value / maxNicheValue) * 100}%` }} />
                </div>
                <span className="bar-value">{niche.value}</span>
              </div>
            ))}
            {project.extraNiches && (
              <p className="ws-p-muted" style={{ marginTop: 14 }}>
                Since extended into: {project.extraNiches.join(", ")}.
              </p>
            )}
          </div>
        )}

        {project.liveStat && (
          <div className="modal-section">
            <div className="modal-kicker">Live tracking sheet</div>
            <div className="totals-row">
              <div>
                <strong>{project.liveStat.value}</strong>
                {project.liveStat.label}
              </div>
            </div>
          </div>
        )}

        <div className="modal-section">
          <div className="modal-kicker">Tech stack</div>
          <div className="proj-tech">
            {project.technologies.map((tech) => (
              <span className="chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-kicker">Outcome</div>
          <p className="ws-p">{project.outcome}</p>
        </div>

        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-live-btn">
            {project.liveLabel || "Open live project"} <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                            */
/* ------------------------------------------------------------------ */

function Nav({ active, onNav, mobileOpen, setMobileOpen }) {
  return (
    <nav className="ws-nav">
      <div className="ws-nav-inner">
        <div className="ws-nav-brand">
          <span className="ws-nav-name">Abhishek Yadav</span>
          <span className="ws-nav-sub">AI &amp; Automation Intern</span>
        </div>
        <div className="ws-nav-links">
          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "nav-link nav-link-active" : "nav-link"}
              onClick={(e) => {
                e.preventDefault();
                onNav(id);
              }}
            >
              {label}
            </a>
          ))}
        </div>
        <button className="ws-nav-burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="ws-nav-mobile">
          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link-mobile"
              onClick={(e) => {
                e.preventDefault();
                onNav(id);
                setMobileOpen(false);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Hero({ onNav }) {
  return (
    <header className="ws-hero" id="overview">
      <div className="ws-kicker">Work summary · Barcode Entertainment</div>
      <h1 className="ws-title">AI &amp; automation work that shipped</h1>
      <p className="ws-sub">
        From creator discovery and search to financial checks, campaign tracking and internal tools, this is a
        simple view of what I built and delivered.
      </p>
      <div className="ws-byline">
        <span>Abhishek Yadav</span>
        <span className="dot">·</span>
        <span>AI &amp; Automation Intern</span>
        <span className="dot">·</span>
        <span>Barcode Entertainment</span>
      </div>
      <div className="hero-cta-row">
        <button className="btn btn-primary" onClick={() => onNav("projects")}>
          Explore my work <ArrowDown size={15} />
        </button>
        <button className="btn btn-secondary" onClick={() => onNav("live")}>
          View live projects <ArrowUpRight size={15} />
        </button>
      </div>
    </header>
  );
}

function ImpactSection() {
  const [ref, active] = useReveal();
  return (
    <section className="ws-section impact-section" id="impact">
      <div className="ws-section-head">
        <span className="ws-idx">Impact</span>
        <h2 className="ws-h2">Key results</h2>
      </div>
      <p className="ws-lede">The main results from the work.</p>
      <div className="stats-grid" ref={ref}>
        {STATS.map((stat) => (
          <StatBlock stat={stat} active={active} key={stat.label} />
        ))}
      </div>
      <div className="delivery-section">
        <div className="delivery-section-title">More work delivered</div>
        <div className="delivery-grid">
          {DELIVERY_ITEMS.map((item, i) => (
            <div className="delivery-card" key={item}>
              <span className="delivery-number">0{i + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="ws-section" id="journey">
      <div className="ws-section-head">
        <span className="ws-idx">Journey</span>
        <h2 className="ws-h2">How the work built up</h2>
      </div>
      <p className="ws-lede">
        The work grew from simple internal tools into search, creator discovery, campaign tracking, data work and
        verification.
      </p>
      <div className="timeline">
        {JOURNEY_STEPS.map((step, i) => {
          const isOpen = openIndex === i;
          return (
            <div className="tl-item" key={step.stage}>
              <button className="tl-head" onClick={() => setOpenIndex(isOpen ? null : i)}>
                <div className="tl-date">{step.stage}</div>
                <div className="tl-head-text">
                  <div className="tl-project">{step.title}</div>
                  <div className="tl-what">{step.what}</div>
                </div>
                <ChevronDown size={16} className={`dive-chevron ${isOpen ? "open" : ""}`} />
              </button>
              {isOpen && (
                <div className="tl-detail">
                  <div className="tl-detail-row">
                    <span className="tl-detail-label">Tools</span>
                    {step.tech}
                  </div>
                  <div className="tl-detail-row">
                    <span className="tl-detail-label">Result</span>
                    {step.outcome}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecognitionSection() {
  return (
    <section className="ws-section" id="recognition">
      <div className="ws-section-head">
        <span className="ws-idx">Recognition</span>
        <h2 className="ws-h2">A milestone worth noting</h2>
      </div>
      <p className="ws-lede">
        One of the Apps Script tools received direct recognition from Maroof sir after it was tested live.
      </p>
      <div className="recog-card recog-card-text">
        <div className="recog-body">
          <div className="recog-quote-label">Direct recognition</div>
          <h3 className="recognition-title">An Apps Script build was called out as a strong internal benchmark.</h3>
          <p className="ws-p-muted">
            The tool was tested live and showed 80%+ relevancy. It was then specifically recognised and shared with
            the wider team.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ onOpen }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((project) => {
      const matchesCategory = category === "All" || project.category === category;
      const matchesQuery =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.short.toLowerCase().includes(q) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="ws-section" id="projects">
      <div className="ws-section-head">
        <span className="ws-idx">Projects</span>
        <h2 className="ws-h2">Project explorer</h2>
      </div>
      <p className="ws-lede">8 systems. Hover a card for a quick summary, or click to see more.</p>

      <div className="explorer-controls">
        <div className="filter-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? "filter-chip-active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects or tech..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No projects match that search.</div>
      ) : (
        <div className="proj-grid">
          {filtered.map((project) => (
            <ProjectCard project={project} onOpen={onOpen} key={project.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function LiveDemosSection({ onOpen }) {
  const liveProjects = PROJECTS.filter(
    (p) => p.liveUrl || p.status === "Live" || p.status === "Deployed"
  );

  return (
    <section className="ws-section" id="live">
      <div className="ws-section-head">
        <span className="ws-idx">Live demos</span>
        <h2 className="ws-h2">See it running</h2>
      </div>
      <p className="ws-lede">Systems in production. A demo link is shown wherever one exists to open.</p>
      <div className="live-grid">
        {liveProjects.map((project) => (
          <div className="live-card" key={project.id}>
            <div className="live-pulse-row">
              <span className="live-pulse" />
              <span className="live-pulse-label">{project.liveUrl ? "Live" : "In production"}</span>
            </div>
            <h3 className="live-title">{project.title}</h3>
            <p className="live-desc">{project.short}</p>
            <div className="proj-tech">
              {project.technologies.slice(0, 4).map((tech) => (
                <span className="chip" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
            <div className="live-actions">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-small"
                >
                  {project.liveLabel || "Open live project"} <ArrowUpRight size={14} />
                </a>
              ) : (
                <button className="btn btn-secondary btn-small" onClick={() => onOpen(project)}>
                  View case study
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="ws-section" id="stack">
      <div className="ws-section-head">
        <span className="ws-idx">Stack</span>
        <h2 className="ws-h2">Tools I used</h2>
      </div>
      <p className="ws-lede">The main tools used across the projects. Hover a tool to see what it was used for.</p>
      <div className="tech-groups">
        {TECH_GROUPS.map((group) => (
          <div className="tech-group" key={group.group}>
            <div className="tech-group-label">{group.group}</div>
            <div className="tech-badges">
              {group.items.map((item) => (
                <div
                  className="tech-badge"
                  key={item.name}
                  onMouseEnter={() => setHovered(item.name)}
                  onMouseLeave={() => setHovered((cur) => (cur === item.name ? null : cur))}
                >
                  {item.name}
                  {hovered === item.name && <div className="tech-tooltip">{item.use}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="ws-footer">
      <div className="ws-footer-title">Work summary · Barcode Entertainment</div>
      <p className="ws-footer-sub">AI &amp; Automation Intern</p>
      <p className="ws-footer-sub" style={{ maxWidth: 620, margin: "12px auto 0" }}>
        From creator discovery and search to financial checks, campaign tracking, data cleaning and internal tools,
        this is the work I built and delivered.
      </p>
      <div className="footer-actions">
        <button className="btn btn-secondary btn-small" onClick={() => onNav("overview")}>
          Back to top ↑
        </button>
        <button className="btn btn-primary btn-small" onClick={() => onNav("projects")}>
          View projects
        </button>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */

const SECTION_IDS = ["overview", "journey", "recognition", "projects", "impact", "live"];

function WorkSummaryApp() {
  const [openProject, setOpenProject] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observers = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="ws-root">
      <style>{STYLES}</style>
      <Nav active={activeSection} onNav={scrollToSection} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Hero onNav={scrollToSection} />
      <Reveal>
        <ImpactSection />
      </Reveal>
      <Reveal>
        <JourneySection />
      </Reveal>
      <Reveal>
        <RecognitionSection />
      </Reveal>
      <Reveal>
        <ProjectsSection onOpen={setOpenProject} />
      </Reveal>
      <Reveal>
        <LiveDemosSection onOpen={setOpenProject} />
      </Reveal>
      <Reveal>
        <StackSection />
      </Reveal>
      <Footer onNav={scrollToSection} />
      {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

  .ws-root {
    --ink: #14161b;
    --surface: #1b1e26;
    --surface-2: #21242e;
    --paper: #ece8e0;
    --muted: rgba(236,232,224,0.82);
    --faint: rgba(236,232,224,0.58);
    --line: rgba(236,232,224,0.12);
    --accent: #d3a44b;
    --accent-soft: rgba(211,164,75,0.14);
    --secondary: #a7bad1;
    --secondary-soft: rgba(124,147,176,0.15);
    --success: #7fa98c;
    --success-soft: rgba(127,169,140,0.15);
    background-color: var(--ink);
    background-image:
  linear-gradient(rgba(20,22,27,0.45), rgba(20,22,27,0.45)),
  url('/dark-bg.jpg');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    background-attachment: fixed;
    color: var(--paper);
    font-family: 'Manrope', sans-serif;
    line-height: 1.5;
    min-height: 100vh;
  }
  .ws-root * { box-sizing: border-box; }
  .ws-root button { font-family: inherit; cursor: pointer; }
  .ws-mono, .ws-nav-name, .tl-date, .stat-num, .proj-number, .ws-idx, .chip, .tag, .live-pulse-label,
  .tech-badge, .bar-value, .modal-meta { font-family: 'IBM Plex Mono', monospace; }

  .ws-container { max-width: 1080px; margin: 0 auto; padding: 0 28px; }

  .ws-nav { position: sticky; top: 0; z-index: 30; background: rgba(20,22,27,0.88); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
  .ws-nav-inner { max-width: 1080px; margin: 0 auto; padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; }
  .ws-nav-brand { display: flex; flex-direction: column; gap: 1px; }
  .ws-nav-name { color: var(--paper); font-weight: 700; font-size: 1rem; }
  .ws-nav-sub { font-size: 0.92rem; color: var(--faint); }
  .ws-nav-links { display: flex; gap: 22px; }
  .nav-link { color: var(--muted); text-decoration: none; font-size: 0.98rem; padding-bottom: 2px; border-bottom: 1px solid transparent; transition: color 0.15s ease, border-color 0.15s ease; }
  .nav-link:hover { color: var(--paper); }
  .nav-link-active { color: var(--accent); border-bottom: 1px solid var(--accent); }
  .ws-nav-burger { display: none; background: none; border: none; color: var(--paper); }
  .ws-nav-mobile { display: none; }

  .reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .reveal-on { opacity: 1; transform: translateY(0); }

  .ws-hero { padding: 108px 28px 72px; max-width: 1080px; margin: 0 auto; }
  .ws-kicker { font-size: 1.08rem; font-weight: 600; color: var(--accent); margin-bottom: 22px; }
  .ws-title { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: clamp(2.9rem, 5.8vw, 4.35rem); line-height: 1.1; max-width: 18ch; letter-spacing: -0.01em; }
  .ws-sub { margin-top: 26px; font-size: 1.2rem; color: var(--muted); max-width: 62ch; line-height: 1.65; }
  .ws-byline { margin-top: 30px; font-size: 1rem; color: var(--secondary); display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .ws-byline .dot { color: var(--faint); }
  .hero-cta-row { display: flex; gap: 14px; margin-top: 40px; flex-wrap: wrap; }

  .btn { display: inline-flex; align-items: center; gap: 9px; font-size: 1.05rem; padding: 12px 20px; border-radius: 4px; border: 1px solid transparent; text-decoration: none; transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
  .btn-primary { background: var(--accent); color: var(--ink); font-weight: 500; }
  .btn-primary:hover { transform: translateY(-1px); }
  .btn-secondary { background: transparent; border-color: var(--line); color: var(--paper); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-small { padding: 9px 15px; font-size: 1.02rem; }

  .ws-section { padding: 64px 28px; max-width: 1080px; margin: 0 auto; border-top: 1px solid var(--line); }
  .ws-section-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 12px; }
  .ws-idx { color: var(--accent); font-size: 1.05rem; }
  .ws-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 600; }
  .ws-lede { color: var(--muted); font-size: 1.08rem; margin-bottom: 34px; max-width: 60ch; }
  .ws-p { font-size: 1.08rem; color: var(--paper); line-height: 1.65; }
  .ws-p-muted { color: var(--muted); font-size: 1.06rem; line-height: 1.6; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
  .impact-section .ws-h2 { font-size: 2.45rem; }
  .impact-section .ws-lede { margin-bottom: 28px; }
  .impact-section .stat-num { font-size: 2.65rem; }
  .impact-section .stat-label { font-size: 1rem; }
  .stat-block { border-top: 1px solid var(--line); padding-top: 18px; }
  .stat-num { font-size: 2.25rem; color: var(--accent); font-weight: 500; }
  .stat-label { font-size: 0.98rem; color: var(--paper); margin-top: 8px; line-height: 1.4; }
  .stat-explain { font-size: 0.86rem; color: var(--faint); margin-top: 6px; line-height: 1.5; }
  .delivery-section { margin-top: 56px; }
  .delivery-section-title { color: var(--secondary); font-size: 1.02rem; margin-bottom: 16px; }
  .delivery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .delivery-card { background: var(--surface); border: 1px solid var(--line); padding: 18px; min-height: 150px; transition: transform 0.18s ease, border-color 0.18s ease; }
  .delivery-card:hover { transform: translateY(-3px); border-color: var(--accent); }
  .delivery-number { font-family: 'IBM Plex Mono', monospace; color: var(--accent); font-size: 0.81rem; }
  .delivery-card p { margin-top: 24px; color: var(--paper); font-size: 0.92rem; line-height: 1.55; }

  .timeline { position: relative; padding-left: 4px; }
  .tl-item { border-bottom: 1px solid var(--line); }
  .tl-item:first-child { border-top: 1px solid var(--line); }
  .tl-head { display: grid; grid-template-columns: 44px 1fr 20px; gap: 16px; align-items: start; width: 100%; background: none; border: none; color: var(--paper); text-align: left; padding: 20px 0; }
  .tl-date { font-size: 1.02rem; color: var(--accent); padding-top: 2px; }
  .tl-project { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 1.02rem; }
  .tl-what { font-size: 0.92rem; color: var(--muted); margin-top: 3px; }
  .tl-detail { padding: 0 0 24px 60px; display: grid; gap: 8px; }
  .tl-detail-row { font-size: 0.92rem; color: var(--paper); display: flex; gap: 8px; }
  .tl-detail-label { color: var(--faint); min-width: 90px; font-size: 0.81rem; padding-top: 2px; }
  .dive-chevron { transition: transform 0.2s ease; }
  .dive-chevron.open { transform: rotate(180deg); }

  .recog-card { border: 1px solid var(--line); background: var(--surface); padding: 26px; max-width: 640px; }
  .recog-body { display: flex; flex-direction: column; }
  .recognition-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; line-height: 1.35; font-weight: 600; margin: 4px 0 10px; }
  .recog-quote-label { font-family: 'IBM Plex Mono', monospace; font-size: 0.9rem; color: var(--success); margin-bottom: 12px; }

  .explorer-controls { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 32px; flex-wrap: wrap; }
  .filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-chip { background: var(--surface); border: 1px solid var(--line); color: var(--muted); font-size: 0.86rem; padding: 8px 14px; border-radius: 20px; }
  .filter-chip-active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .search-box { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: 9px 12px; min-width: 220px; }
  .search-icon { color: var(--faint); flex-shrink: 0; }
  .search-box input { background: none; border: none; outline: none; color: var(--paper); font-size: 0.92rem; width: 100%; }
  .search-box input::placeholder { color: var(--faint); }
  .empty-state { color: var(--faint); font-size: 0.96rem; padding: 40px 0; text-align: center; border: 1px dashed var(--line); border-radius: 4px; }

  .proj-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }
  .proj-card { position: relative; overflow: hidden; background: var(--ink); padding: 26px; text-align: left; border: none; color: var(--paper); display: flex; flex-direction: column; gap: 12px; transition: background 0.18s ease, transform 0.18s ease; }
  .proj-card:hover { background: var(--surface); transform: translateY(-2px); }
  .proj-hover-summary { position: absolute; inset: 0; padding: 22px; background: rgba(27,30,38,0.97); opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity 0.18s ease, transform 0.18s ease; display: flex; flex-direction: column; justify-content: center; }
  .proj-card:hover .proj-hover-summary, .proj-card:focus-visible .proj-hover-summary { opacity: 1; transform: translateY(0); }
  .proj-hover-label { font-size: 0.9rem; color: var(--accent); font-family: 'IBM Plex Mono', monospace; margin-bottom: 10px; }
  .proj-hover-summary p { color: var(--paper); font-size: 0.9rem; line-height: 1.5; }
  .proj-hover-result { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.86rem; line-height: 1.45; }
  .proj-hover-result span { display: block; color: var(--secondary); font-size: 0.76rem; margin-bottom: 3px; }
  .proj-card-top { display: flex; justify-content: space-between; align-items: center; }
  .proj-number { color: var(--faint); font-size: 0.86rem; }
  .proj-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.22rem; font-weight: 600; line-height: 1.3; }
  .proj-short { font-size: 1.02rem; color: var(--muted); line-height: 1.55; }
  .proj-tech { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { font-size: 0.9rem; background: var(--surface-2); border: 1px solid var(--line); padding: 4px 9px; border-radius: 3px; color: var(--paper); }
  .chip-more { color: var(--faint); }
  .proj-card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 8px; }
  .proj-category { font-size: 0.9rem; color: var(--secondary); }
  .proj-link { font-size: 0.86rem; color: var(--accent); display: flex; align-items: center; gap: 4px; }

  .tag { font-size: 0.74rem; padding: 5px 10px; border-radius: 3px; white-space: nowrap; }
  .tag-shipped { background: var(--accent-soft); color: var(--accent); }
  .tag-live { background: var(--success-soft); color: var(--success); }
  .tag-internal { background: var(--secondary-soft); color: var(--secondary); }

  .flow-wrap { margin-top: 6px; }
  .flow { display: flex; flex-wrap: wrap; align-items: center; row-gap: 10px; }
  .flow-item { display: flex; align-items: center; }
  .flow-step { background: var(--surface); border: 1px solid var(--line); padding: 9px 13px; border-radius: 4px; font-size: 0.86rem; color: var(--paper); transition: border-color 0.15s ease, color 0.15s ease; }
  .flow-step-active { border-color: var(--accent); color: var(--accent); }
  .flow-arrow { color: var(--faint); margin: 0 8px; transform: rotate(-90deg); }
  .arch-flow-group { display: grid; gap: 22px; }
  .arch-flow-label { font-size: 0.9rem; color: var(--secondary); margin-bottom: 8px; }

  .live-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .live-card { border: 1px solid var(--line); padding: 24px; display: flex; flex-direction: column; gap: 12px; background: var(--surface); }
  .live-pulse-row { display: flex; align-items: center; gap: 8px; }
  .live-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 0 rgba(127,169,140,0.6); animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(127,169,140,0.5); } 70% { box-shadow: 0 0 0 8px rgba(127,169,140,0); } 100% { box-shadow: 0 0 0 0 rgba(127,169,140,0); } }
  .live-pulse-label { font-size: 0.9rem; color: var(--success); }
  .live-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 600; }
  .live-desc { font-size: 0.92rem; color: var(--muted); line-height: 1.5; }
  .live-actions { margin-top: auto; padding-top: 6px; }

  .tech-groups { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .tech-group { background: var(--surface); border: 1px solid var(--line); padding: 18px; min-height: 120px; }
  .tech-group-label { font-size: 0.82rem; color: var(--secondary); margin-bottom: 12px; font-family: 'IBM Plex Mono', monospace; }
  .tech-badges { display: flex; flex-wrap: wrap; gap: 8px; }
  .tech-badge { position: relative; font-size: 0.86rem; background: var(--surface); border: 1px solid var(--line); padding: 8px 13px; border-radius: 20px; color: var(--paper); }
  .tech-badge:hover { border-color: var(--accent); color: var(--accent); }
  .tech-tooltip { position: absolute; bottom: calc(100% + 8px); left: 0; width: 220px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 4px; padding: 10px 12px; font-size: 0.9rem; color: var(--muted); line-height: 1.5; z-index: 5; font-family: 'Manrope', sans-serif; }

  .ba-wrap { margin-top: 10px; }
  .ba-labels { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--faint); margin-bottom: 8px; }
  .ba-label-right { color: var(--accent); }
  .ba-range { width: 100%; accent-color: var(--accent); }
  .ba-rows { margin-top: 16px; display: grid; gap: 14px; }
  .ba-row-label { font-size: 0.9rem; color: var(--secondary); margin-bottom: 6px; }
  .ba-row-body { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ba-cell { font-size: 0.92rem; padding: 10px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 4px; transition: opacity 0.15s ease; }
  .ba-cell-v2 { border-color: var(--accent-soft); }

  .collab-note { font-size: 0.86rem; color: var(--accent); margin-top: 10px; }

  .bar-row { display: grid; grid-template-columns: 78px 1fr 46px; gap: 14px; align-items: center; margin-bottom: 14px; }
  .bar-label { font-size: 0.92rem; color: var(--muted); }
  .bar-track { height: 8px; background: var(--surface-2); border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; background: var(--accent); border-radius: 2px; }
  .bar-value { font-size: 0.86rem; color: var(--paper); text-align: right; }
  .totals-row { display: flex; gap: 32px; flex-wrap: wrap; }
  .totals-row div { font-size: 0.86rem; color: var(--muted); }
  .totals-row strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; color: var(--paper); font-weight: 600; margin-bottom: 2px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(10,11,14,0.72); backdrop-filter: blur(3px); z-index: 50; display: flex; justify-content: center; align-items: flex-start; padding: 40px 20px; overflow-y: auto; animation: fadeIn 0.18s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-panel { background: var(--ink); border: 1px solid var(--line); max-width: 680px; width: 100%; padding: 40px; position: relative; margin: auto; animation: slideUp 0.22s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .modal-close { position: absolute; top: 20px; right: 20px; background: var(--surface); border: 1px solid var(--line); color: var(--paper); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; }
  .modal-close:hover { border-color: var(--accent); color: var(--accent); }
  .modal-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .modal-number { font-size: 1.4rem; color: var(--faint); }
  .modal-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 600; margin-bottom: 8px; line-height: 1.25; }
  .modal-meta { font-size: 0.9rem; color: var(--faint); margin-bottom: 30px; }
  .modal-section { margin-bottom: 28px; }
  .modal-section-highlight { background: var(--accent-soft); padding: 18px 20px; border-radius: 4px; border: 1px solid rgba(211,164,75,0.25); }
  .modal-kicker { font-size: 0.8rem; color: var(--secondary); margin-bottom: 10px; }
  .modal-kicker-accent { color: var(--accent); }
  .modal-live-btn { width: 100%; justify-content: center; margin-top: 10px; }

  .ws-footer { padding: 70px 28px 60px; max-width: 1080px; margin: 0 auto; border-top: 1px solid var(--line); }
  .ws-footer-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.7rem; font-weight: 600; margin-bottom: 12px; }
  .ws-footer-sub { color: var(--muted); font-size: 1.02rem; }
  .footer-actions { display: flex; gap: 12px; margin-top: 28px; }

  @media (max-width: 780px) {
    .ws-nav-links { display: none; }
    .ws-nav-burger { display: block; }
    .ws-nav-mobile { display: flex; flex-direction: column; padding: 10px 28px 18px; border-top: 1px solid var(--line); gap: 4px; }
    .nav-link-mobile { color: var(--muted); text-decoration: none; padding: 10px 0; font-size: 0.96rem; border-bottom: 1px solid var(--line); }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .proj-grid { grid-template-columns: 1fr; }
    .live-grid { grid-template-columns: 1fr; }
    .tech-groups { grid-template-columns: 1fr 1fr; }
    .ba-row-body { grid-template-columns: 1fr; }
    .tl-detail { padding-left: 0; }
    .modal-panel { padding: 26px; }
  }
  @media (max-width: 480px) {
    .tech-groups { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal { transition: none; }
    .live-pulse { animation: none; }
  }
`;
/*--------------------------------------------------------------- */
/*  Mount                                                               */
/* ------------------------------------------------------------------ */

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <WorkSummaryApp />
    </StrictMode>
  );
}

export default WorkSummaryApp;