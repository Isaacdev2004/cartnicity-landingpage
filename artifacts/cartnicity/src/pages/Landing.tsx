import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Users,
  User,
  Building2,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Star,
  Quote,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoFull from "@assets/logo_2_1775132861869.png";
import productsPageBanner from "@assets/products page banner.png";
import proudlyCanadianBadge from "@assets/proudly-canadian-badge.png";

/** Public `public/` paths — respect Vite `base` (e.g. /get-started/ on cartnicity.com/get-started/) */
const publicFile = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/** HubSpot family / default join form (eu1). */
const JOIN_FORM_ID = "4f7a987a-0a4a-4e5f-bc06-2c79b7e14c94";
/** HubSpot individual signup form (eu1). Override with VITE_HUBSPOT_JOIN_FORM_INDIVIDUAL_ID if needed. */
const JOIN_FORM_INDIVIDUAL_ID =
  (import.meta.env.VITE_HUBSPOT_JOIN_FORM_INDIVIDUAL_ID as string | undefined)?.trim() ||
  "3d8a380d-81ed-4508-969a-392cee53cdeb";
/** HubSpot business signup form (eu1). Override with VITE_HUBSPOT_JOIN_FORM_BUSINESS_ID if needed. */
const JOIN_FORM_BUSINESS_ID =
  (import.meta.env.VITE_HUBSPOT_JOIN_FORM_BUSINESS_ID as string | undefined)?.trim() ||
  "cf2da5d5-997a-45d6-87c3-f3b8a542201d";
const START_FORM_ID = "6f322199-c192-4f19-bfc0-365e1491331c";
const PORTAL_ID = "148134075";

const MEMBERSHIP_HEADLINE =
  "Lifetime membership for the first 1,000 new members — 300 slots remaining.";

const MEMBERSHIP_BENEFITS = [
  "Elite membership with hands-on support for families and businesses.",
  "Costco-level buying power and perks — without paying warehouse membership fees.",
  "Canada's foremost culturally intelligent grocery OS — built for community and unbeatable savings.",
] as const;

type MemberType = "family" | "individual" | "business";

const MARQUEE_ITEMS = [
  "Canada's foremost culturally intelligent grocery OS",
  "Bloc sweeps — aggregate demand, unlock wholesale prices",
  "Ontario farms to your door — authentic ethnic groceries",
  "Toronto · Brampton · Calgary · Winnipeg",
  "30%+ average savings when your community buys together",
  "Next-day delivery · CartnicityPoints · community economics",
  "Halal & premium cuts negotiated for your bloc",
  "A movement, not a marketplace — proudly Canadian",
] as const;

const MEMBER_OPTIONS: {
  id: MemberType;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "family",
    title: "Family",
    description: "Households buying together in a bloc.",
    icon: Users,
  },
  {
    id: "individual",
    title: "Individual",
    description: "Solo members joining a local sweep.",
    icon: User,
  },
  {
    id: "business",
    title: "Business",
    description: "Restaurants, caterers & partners.",
    icon: Building2,
  },
];

/** Hide HubSpot marketing footer / logo (submissions still go to HubSpot). */
function hideHubSpotPromoChrome(root: ParentNode) {
  root.querySelectorAll?.("a")?.forEach((node) => {
    if (!(node instanceof HTMLAnchorElement)) return;
    const href = (node.getAttribute("href") ?? "").trim();
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    const tl = text.toLowerCase();

    let path = "";
    try {
      const u = new URL(href, "https://www.hubspot.com");
      const host = u.hostname.replace(/^www\./, "");
      if (host !== "hubspot.com") return;
      path = u.pathname;
      if (/^\/legal\b/i.test(path)) return;
    } catch {
      return;
    }

    const poweredBy = /powered\s+by/i.test(text) && /hubspot/i.test(tl);
    const marketingPath =
      path === "/" ||
      path === "" ||
      /^\/(products|crm|marketing|sales|service)\b/i.test(path);
    const iconOrWordmark =
      marketingPath && (text.length === 0 || tl === "hubspot" || tl.length < 4);
    const promoBlurb =
      marketingPath &&
      tl.length > 0 &&
      tl.length < 100 &&
      /hubspot/i.test(tl) &&
      /(free|trial|crm|form|create)/i.test(text);

    if (poweredBy || iconOrWordmark || promoBlurb) {
      const row =
        node.closest(
          "[class*='footer'],[class*='Footer'],[class*='branding'],[class*='Branding'],[class*='Powered'],[class*='watermark']",
        ) ??
        node.parentElement ??
        node;
      (row as HTMLElement).style.setProperty("display", "none", "important");
    }
  });

  root.querySelectorAll?.("img")?.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const alt = (img.alt ?? "").toLowerCase();
    if (
      /hubspot/.test(alt) &&
      (/logo|powered|brand/.test(alt) || alt.length < 24)
    ) {
      const row = img.closest("a,div,span") ?? img;
      (row as HTMLElement).style.setProperty("display", "none", "important");
    }
  });

  root.querySelectorAll?.("*")?.forEach((el) => {
    if (el instanceof HTMLElement && el.shadowRoot) {
      hideHubSpotPromoChrome(el.shadowRoot);
    }
  });
}

function suppressHubSpotFieldRow(start: Element | null) {
  let node: Element | null = start;
  for (let depth = 0; depth < 12 && node; depth++) {
    const cls = node.className?.toString?.() ?? "";
    if (
      /field|row|group|question/i.test(cls) ||
      node.getAttribute?.("data-field") ||
      node.tagName === "FIELDSET" ||
      node.getAttribute?.("role") === "group"
    ) {
      const row = node as HTMLElement;
      row.style.setProperty("display", "none", "important");
      row.querySelectorAll?.("input, select, textarea").forEach((ctrl) => {
        ctrl.removeAttribute("required");
        ctrl.removeAttribute("aria-required");
      });
      return;
    }
    node = node.parentElement;
  }
  if (start instanceof HTMLElement) {
    start.style.setProperty("display", "none", "important");
    start.querySelectorAll?.("input, select, textarea").forEach((ctrl) => {
      ctrl.removeAttribute("required");
      ctrl.removeAttribute("aria-required");
    });
  }
}

/** Hide Household Size row for Individual sign-ups (same HubSpot form for all paths). */
function hideHouseholdSizeField(root: ParentNode) {

  const textLooksLikeHouseholdSize = (raw: string) => {
    const t = raw.replace(/\s+/g, " ").trim().toLowerCase();
    if (!t) return false;
    return (
      (/\bhousehold\b/.test(t) || /\bhoisehold\b/.test(t)) &&
      /\bsize\b/.test(t)
    );
  };

  root.querySelectorAll?.("label, legend, p, span, h3, h4, div")?.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (!textLooksLikeHouseholdSize(el.textContent ?? "")) return;
    if ((el.textContent ?? "").length > 120) return;
    suppressHubSpotFieldRow(el);
  });

  root.querySelectorAll?.("input, select, textarea")?.forEach((el) => {
    const hint = `${el.getAttribute("name") ?? ""} ${el.getAttribute("id") ?? ""} ${el.getAttribute("aria-label") ?? ""} ${el.getAttribute("placeholder") ?? ""}`.toLowerCase();
    if (/\bhousehold\b/.test(hint) && /\bsize\b/.test(hint)) {
      suppressHubSpotFieldRow(el);
    }
  });

  root.querySelectorAll?.("*")?.forEach((el) => {
    if (el instanceof HTMLElement && el.shadowRoot) {
      hideHouseholdSizeField(el.shadowRoot);
    }
  });
}

/** Business path: only first/last name, email, phone, company, city, state or province (+ legal consent if present). */
function restrictToBusinessFieldsOnly(root: ParentNode) {
  const fingerprintForFieldWrapper = (wrapper: HTMLElement) => {
    const bits: string[] = [];
    wrapper.querySelectorAll("label").forEach((l) => {
      bits.push(l.textContent ?? "");
    });
    wrapper.querySelectorAll("input, select, textarea").forEach((el) => {
      bits.push(
        el.getAttribute("name") ?? "",
        el.getAttribute("id") ?? "",
        el.getAttribute("aria-label") ?? "",
        el.getAttribute("placeholder") ?? "",
      );
    });
    return bits.join(" ").replace(/\s+/g, " ").trim();
  };

  const isBusinessAllowedFingerprint = (s: string) => {
    const t = s.toLowerCase();
    if (
      /consent|terms|privacy|gdpr|legal|marketing|newsletter|subscribe|communication/.test(
        t,
      )
    ) {
      return true;
    }
    const allowed = [
      /first[\s_-]*name|firstname|^first$|given[\s_-]*name/i,
      /last[\s_-]*name|lastname|surname|family[\s_-]*name/i,
      /\bemail\b|e-mail/i,
      /phone|telephone|mobile|cell|\btel\b|contact[\s_-]*(number|phone)?/i,
      /company|organization|organisation|business[\s_-]*name|^company$/i,
      /\bcity\b|town(ship)?/i,
      /\bstate\b|\bprovince\b|prov\./i,
    ];
    return allowed.some((re) => re.test(t));
  };

  const findFieldWrapper = (el: Element): HTMLElement | null => {
    let n: Element | null = el;
    for (let d = 0; d < 14 && n; d++) {
      const cls = n.className?.toString?.() ?? "";
      if (
        /field|row|group|question|hsfc/i.test(cls) ||
        n.getAttribute?.("data-field") ||
        n.tagName === "FIELDSET" ||
        n.getAttribute?.("role") === "group"
      ) {
        return n as HTMLElement;
      }
      n = n.parentElement;
    }
    return null;
  };

  const wrappers = new Map<HTMLElement, string>();

  const visit = (node: ParentNode) => {
    node
      .querySelectorAll?.(
        "input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea",
      )
      ?.forEach((el) => {
        const w = findFieldWrapper(el);
        if (!w) return;
        const fp = fingerprintForFieldWrapper(w);
        const prev = wrappers.get(w);
        if (!prev || fp.length > prev.length) {
          wrappers.set(w, fp);
        }
      });

    node.querySelectorAll?.("*")?.forEach((child) => {
      if (child instanceof HTMLElement && child.shadowRoot) {
        visit(child.shadowRoot);
      }
    });
  };

  visit(root);

  wrappers.forEach((fp, wrapper) => {
    if (!isBusinessAllowedFingerprint(fp)) {
      suppressHubSpotFieldRow(wrapper);
    }
  });
}

function HubSpotFormEmbed({
  formId,
  active,
  memberType,
}: {
  formId: string;
  active: boolean;
  memberType?: MemberType | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const div = document.createElement("div");
    div.className = "hs-form-frame";
    div.setAttribute("data-region", "eu1");
    div.setAttribute("data-form-id", formId);
    div.setAttribute("data-portal-id", PORTAL_ID);
    container.appendChild(div);

    const existingScript = document.querySelector(
      `script[src="https://js-eu1.hsforms.net/forms/embed/${PORTAL_ID}.js"]`
    );
    if (existingScript) {
      existingScript.dispatchEvent(new Event("load"));
    }

    const runAdjustments = () => {
      hideHubSpotPromoChrome(container);
      if (
        memberType === "individual" &&
        formId === JOIN_FORM_ID
      ) {
        hideHouseholdSizeField(container);
      }
      if (
        memberType === "business" &&
        formId === JOIN_FORM_ID
      ) {
        restrictToBusinessFieldsOnly(container);
      }
    };
    runAdjustments();
    const mo = new MutationObserver(runAdjustments);
    mo.observe(container, { childList: true, subtree: true });
    const poll = window.setInterval(runAdjustments, 400);
    const stopPoll = window.setTimeout(() => clearInterval(poll), 12_000);

    return () => {
      mo.disconnect();
      clearInterval(poll);
      clearTimeout(stopPoll);
      container.innerHTML = "";
    };
  }, [active, formId, memberType]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="cartnicity-hubspot-modal-host min-h-[300px]"
    />
  );
}

function modalShellClass(wide?: boolean) {
  return `relative z-10 bg-background rounded-3xl shadow-2xl border w-full ${
    wide ? "max-w-2xl" : "max-w-xl"
  } max-h-[90vh] overflow-y-auto p-8`;
}

function MembershipJoinFlowModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [memberType, setMemberType] = useState<MemberType | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("choose");
      setMemberType(null);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const memberLabel =
    memberType === "family"
      ? "Family"
      : memberType === "individual"
        ? "Individual"
        : memberType === "business"
          ? "Business"
          : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className={modalShellClass(true)}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <img src={logoFull} alt="Cartnicity" className="h-10 object-contain" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Close"
            data-testid="btn-close-membership-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "choose" ? (
          <>
            <h2 className="text-2xl font-display font-bold mb-3">Get started</h2>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              {MEMBERSHIP_HEADLINE}
            </p>
            <ul className="space-y-2.5 mb-8 text-sm text-foreground/90">
              {MEMBERSHIP_BENEFITS.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold text-foreground mb-3">
              Tell us how you&apos;re joining
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {MEMBER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`btn-member-type-${opt.id}`}
                  onClick={() => {
                    setMemberType(opt.id);
                    setStep("form");
                  }}
                  className="flex flex-col items-start text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <opt.icon className="w-6 h-6 text-primary mb-3" />
                  <span className="font-display font-bold text-base mb-1">
                    {opt.title}
                  </span>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("choose");
                setMemberType(null);
              }}
              className="text-sm font-medium text-primary hover:underline mb-4"
              data-testid="btn-membership-back"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-display font-bold mb-2">
              Join the Next Sweep
            </h2>
            <p className="text-muted-foreground text-sm mb-1">
              You&apos;re signing up as{" "}
              <span className="font-semibold text-foreground">{memberLabel}</span>
              . Complete the form below — we&apos;ll be in touch shortly.
            </p>
            <HubSpotFormEmbed
              formId={
                memberType === "business"
                  ? JOIN_FORM_BUSINESS_ID
                  : memberType === "individual"
                    ? JOIN_FORM_INDIVIDUAL_ID
                    : JOIN_FORM_ID
              }
              active
              memberType={memberType}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

function HubSpotFormModal({
  open,
  onClose,
  formId,
  title,
  description = "Fill out the form below and we'll be in touch shortly.",
}: {
  open: boolean;
  onClose: () => void;
  formId: string;
  title: string;
  description?: string;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className={modalShellClass()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <img src={logoFull} alt="Cartnicity" className="h-10 object-contain" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Close"
            data-testid="btn-close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6 text-sm">{description}</p>
        <HubSpotFormEmbed formId={formId} active={open} />
      </motion.div>
    </div>
  );
}

function CartnicityStatsMarquee() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <section
        className="border-t border-primary-foreground/20 bg-primary py-4 text-primary-foreground"
        aria-label="Cartnicity highlights"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium leading-relaxed text-primary-foreground/95">
            {MARQUEE_ITEMS.join(" · ")}
          </p>
        </div>
      </section>
    );
  }

  const loop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section
      className="border-t border-primary-foreground/20 bg-primary py-3 text-primary-foreground"
      aria-label="Cartnicity highlights"
    >
      <div className="relative overflow-hidden">
        <div
          className="cartnicity-marquee-track items-center gap-x-10 md:gap-x-14 px-4 text-sm font-semibold tracking-wide text-primary-foreground/95"
          data-testid="marquee-stats-below"
        >
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap"
            >
              <span
                className="size-1.5 shrink-0 rounded-full bg-primary-foreground/70"
                aria-hidden
              />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [membershipFlowOpen, setMembershipFlowOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Modals */}
      <MembershipJoinFlowModal
        open={membershipFlowOpen}
        onClose={() => setMembershipFlowOpen(false)}
      />
      <HubSpotFormModal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        formId={START_FORM_ID}
        title="Start the Next Sweep"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoFull} alt="Cartnicity" className="h-14 object-contain" data-testid="nav-logo" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
            <a href="#communities" className="text-sm font-medium hover:text-primary transition-colors">Communities</a>
            <a href="#products" className="text-sm font-medium hover:text-primary transition-colors">Products</a>
          </div>
          <div className="flex items-center gap-4">
            <Button
              data-testid="btn-get-started-nav"
              onClick={() => setMembershipFlowOpen(true)}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y: yHero }}
            src={publicFile("images/hero-community.png")}
            alt="Vibrant multicultural community market" 
            className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground font-medium mb-8 border border-accent/20 max-w-full text-center text-sm sm:text-base"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
              {MEMBERSHIP_HEADLINE}
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
              When your community buys together, <span className="text-primary italic">markets bend.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 5000+ members across Canada aggregating demand to negotiate wholesale prices directly with Ontario farmers. Save up to 30%+ on authentic ethnic groceries.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg hover-elevate"
                data-testid="btn-hero-join"
                onClick={() => setMembershipFlowOpen(true)}
              >
                Join the Next Sweep <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover-elevate"
                data-testid="btn-hero-start"
                onClick={() => setStartOpen(true)}
              >
                Start a Bloc — Get $50
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/20">
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">$47.3k+</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Saved Monthly (Toronto)</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">5,000+</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Active Members</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">30%</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Average Savings</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">4</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Active Cities</div>
            </div>
          </div>
        </div>
      </section>

      <CartnicityStatsMarquee />

      {/* How it Works */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-sm font-bold tracking-widest text-secondary uppercase mb-4">The Bloc Sweep</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">How neighbourhood groups unlock wholesale power</h3>
            <p className="text-lg text-muted-foreground">It's simple: we aggregate our grocery lists, approach farmers as a single massive buyer, and pass the savings directly to you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-border hidden md:block"></div>
            
            {[
              {
                icon: Users,
                title: "1. Join your city's Bloc",
                desc: "Connect with your local community group in Toronto, Brampton, Calgary, or Winnipeg."
              },
              {
                icon: ShieldCheck,
                title: "2. We negotiate in bulk",
                desc: "When the Bloc reaches critical mass, we trigger a 'Sweep' and buy directly from Ontario farmers at wholesale."
              },
              {
                icon: Truck,
                title: "3. Save & get it delivered",
                desc: "Get fresh, authentic groceries delivered next-day while earning cash back rewards for your community."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative z-10 bg-card p-8 rounded-3xl border shadow-sm hover-elevate transition-all"
              >
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 border border-secondary/20">
                  <step.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* City Communities */}
      <section id="communities" className="py-24 bg-muted/50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Communities pulling their weight</h2>
              <p className="text-lg text-muted-foreground">Real groups aggregating demand and taking back control of their grocery bills.</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              data-testid="btn-view-cities"
              onClick={() => setMembershipFlowOpen(true)}
            >
              View All Active Blocs <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: "Toronto", group: "African Community", savings: "$47,300", color: "bg-primary text-primary-foreground" },
              { city: "Brampton", group: "Indian Community", savings: "20% Avg", color: "bg-secondary text-secondary-foreground" },
              { city: "Calgary", group: "Caribbean Community", savings: "$18,900", color: "bg-accent text-accent-foreground" },
              { city: "Winnipeg", group: "Filipino Community", savings: "$9,800", color: "bg-foreground text-background" }
            ].map((bloc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl ${bloc.color} flex flex-col justify-between aspect-square hover-elevate cursor-pointer`}
                onClick={() => setMembershipFlowOpen(true)}
                data-testid={`card-community-${i}`}
              >
                <div>
                  <MapPin className="w-6 h-6 mb-4 opacity-80" />
                  <h4 className="text-2xl font-bold mb-1">{bloc.city}</h4>
                  <p className="font-medium opacity-90">{bloc.group}</p>
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wide mb-1">Monthly Savings</p>
                  <p className="text-3xl font-display font-bold">{bloc.savings}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl border"
                >
                  <img
                    src={productsPageBanner}
                    alt="Cartnicity products — premium groceries and community buying"
                    className="h-full w-full object-cover object-center"
                  />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="relative rounded-2xl border bg-card p-4 shadow-lg sm:p-5 md:p-6"
              >
                <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                  <img
                    src={proudlyCanadianBadge}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 object-contain sm:size-14"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold">Proudly Canadian</h5>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Canadian-built for multicultural communities
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
                  Cartnicity is rooted in Canada — fair pricing, trusted sourcing, and logistics designed for neighbours who buy together.
                </p>
              </motion.div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Premium authentic cuts, negotiated for you.</h2>
              <p className="text-lg text-muted-foreground mb-10">We focus on high-quality, culturally specific groceries that big box stores overprice.</p>

              <div className="space-y-6">
                {[
                  { title: "Fresh Meat Combos", desc: "Halal and premium cuts: Ribeye, Chicken, Lamb, Goat, and Brisket." },
                  { title: "Family Value Stack", desc: "Built for large households needing bulk staples at true wholesale prices." },
                  { title: "Value Pack Solo Plan", desc: "Optimized for students and young professionals." },
                  { title: "Commercial Partner Plan", desc: "For restaurants and caterers within the community network." }
                ].map((plan, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="mt-1">
                      <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{plan.title}</h4>
                      <p className="text-muted-foreground">{plan.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <a
                  href="https://superlative-creponne-d7c509.netlify.app/product"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-view-products"
                >
                  <Button size="lg" className="rounded-full">
                    Explore Products <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cartnicity */}
      <section
        id="proudly-canadian"
        className="py-24 md:py-32 bg-secondary text-secondary-foreground"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <div className="flex flex-col items-center gap-3 mb-8">
              <img
                src={proudlyCanadianBadge}
                alt="Proudly Canadian seal"
                width={96}
                height={96}
                className="size-24 object-contain drop-shadow-sm"
              />
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-secondary-foreground/90">
                Proudly Canadian
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">A movement, not a marketplace.</h2>
            <p className="text-lg opacity-90">Cartnicity isn't just a grocery delivery platform. We're rebuilding community economics from the ground up.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                superheader: "Cultural Intelligence",
                title: "Built for Culture",
                desc: "Designed specifically for multicultural communities and their unique grocery needs.",
              },
              {
                superheader: "Market Maker Authority",
                title: "Price Control",
                desc: "By buying together, we dictate terms instead of accepting whatever supermarkets charge.",
              },
              {
                superheader: "Elite Membership",
                title: "Cartnicity Elites",
                desc: "Own your food economy with insider access to better pricing, priority delivery, and exclusive inventory — before the market moves.",
              },
              {
                superheader: "Loyalty",
                title: "Circular Rewards",
                desc: "Earn CartnicityPoints redeemable across other community-owned businesses.",
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary-foreground/10 p-8 rounded-3xl backdrop-blur-sm border border-secondary-foreground/20 hover:bg-secondary-foreground/20 transition-colors"
              >
                {"superheader" in feature && feature.superheader ? (
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-secondary-foreground/80 mb-3">
                    {feature.superheader}
                  </p>
                ) : null}
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="opacity-80 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-6">The Movement is Real</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. Hear from community members who are saving thousands together.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Emeka Obi", loc: "Mississauga, ON", text: "We used to spend $1,200 a month on groceries. With the local Bloc, we're down to $850 for better quality meat." },
              { name: "David Lee", loc: "Etobicoke, ON", text: "The quality of the brisket and ribs is incredible. You can tell it's coming straight from the farm." },
              { name: "Sarah Chen", loc: "Toronto, ON", text: "Finally, a platform that understands how our community cooks and eats. The savings are just the bonus." },
              { name: "Nicole Adams", loc: "Calgary, AB", text: "Started my own Bloc in our neighborhood. The $50 voucher was nice, but bringing everyone together was better." }
            ].map((review, i) => (
              <div key={i} className="p-6 rounded-3xl bg-muted/50 border hover-elevate transition-all" data-testid={`card-testimonial-${i}`}>
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground/90 italic mb-6">"{review.text}"</p>
                <div>
                  <h5 className="font-bold">{review.name}</h5>
                  <p className="text-sm text-muted-foreground">{review.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={publicFile("images/community-feast.png")}
            alt="Community feast" 
            className="w-full h-full object-cover opacity-30 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-primary/90 dark:bg-primary/95 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">
            Join our community
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">Join your local Bloc today. The next sweep is happening soon.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-lg h-14 px-10 rounded-full shadow-xl hover-elevate text-secondary-foreground bg-secondary"
              data-testid="btn-bottom-join"
              onClick={() => setMembershipFlowOpen(true)}
            >
              Join our community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg h-14 px-10 rounded-full border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
              data-testid="btn-bottom-start"
              onClick={() => setStartOpen(true)}
            >
              Start the Next Sweep
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img src={logoFull} alt="Cartnicity" className="h-12 object-contain" />
          </div>
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {new Date().getFullYear()} Cartnicity. A movement, not a marketplace. Proudly Canadian.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
