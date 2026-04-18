import { Link } from "wouter";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ArrowUpRight,
    Shirt,
    Layers,
    BookOpen,
    Fingerprint,
    Target,
    LineChart,
    CalendarDays,
    Check,
    Minus,
} from "lucide-react";
import { useState } from "react";

/**
 * VESSURA LANDING PAGE
 *
 * Editorial-tech aesthetic. Quiet luxury meets a product surface.
 * Palette: warm cream ground, deep burgundy accents, brushed gold detailing.
 * Typography: Playfair Display for display, Inter for UI.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const SERIF = { fontFamily: '"Playfair Display", Georgia, serif' } as const;

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.7, ease: EASE },
} as const;

export function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-[#FDFBF7] text-[#1A1A1A] overflow-x-hidden antialiased">
            <TopNav />
            <Hero />
            <EditorialStats />
            <FeatureGrid />
            <HowItWorks />
            <StyleDnaSpotlight />
            <GapAnalysisSpotlight />
            <Testimonials />
            <CompareTable />
            <FinalCta />
            <SiteFooter />
        </div>
    );
}

export default LandingPage;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function TopNav() {
    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-[#E8E3DA]/70 bg-[#FDFBF7]/75 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
                <Link href="/">
                    <a className="flex items-baseline gap-2 cursor-pointer" aria-label="Vessura home">
                        <span
                            className="text-[22px] leading-none tracking-tight text-[#1A1A1A]"
                            style={SERIF}
                        >
                            Vessura
                        </span>
                        <span className="h-[6px] w-[6px] rounded-full bg-[#80163A]" aria-hidden />
                    </a>
                </Link>

                <nav className="hidden md:flex items-center gap-9" aria-label="Primary">
                    <a href="#features" className="text-[13px] tracking-wide text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                        Features
                    </a>
                    <a href="#how" className="text-[13px] tracking-wide text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                        How it works
                    </a>
                    <a href="#pricing" className="text-[13px] tracking-wide text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                        Pricing
                    </a>
                </nav>

                <div className="flex items-center gap-2">
                    <Link href="/auth">
                        <a className="hidden sm:inline-flex text-[13px] tracking-wide text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors px-3 py-2">
                            Sign in
                        </a>
                    </Link>
                    <Link href="/auth">
                        <a
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A1A] text-[#FDFBF7] text-[13px] tracking-wide min-h-[44px] px-5 py-2.5 hover:bg-[#80163A] transition-colors"
                            aria-label="Get started with Vessura"
                        >
                            Get Started
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </a>
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
    return (
        <section className="relative isolate pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden">
            {/* Background: cream to soft burgundy, with a gold ambient glow */}
            <div
                className="pointer-events-none absolute inset-0 -z-10"
                aria-hidden
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(1100px 620px at 78% 12%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(900px 620px at 12% 88%, rgba(128,22,58,0.10), transparent 60%), linear-gradient(180deg, #FDFBF7 0%, #FAF6EE 100%)",
                    }}
                />
                {/* Fine grid */}
                <svg className="absolute inset-0 h-full w-full opacity-[0.35]" role="img">
                    <title>Decorative grid</title>
                    <defs>
                        <pattern id="hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#E8DFCE" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-grid)" />
                </svg>
            </div>

            <div className="mx-auto max-w-7xl px-6 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Copy */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="lg:col-span-7"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD0] bg-[#FDFBF7]/80 px-3 py-1.5 mb-8">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                        <span className="text-[11px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                            Private beta · Invitation only
                        </span>
                    </div>

                    <h1
                        className="text-[44px] sm:text-[56px] lg:text-[76px] leading-[1.03] tracking-[-0.02em] text-[#1A1A1A]"
                        style={SERIF}
                    >
                        Your wardrobe,
                        <br className="hidden sm:block" />{" "}
                        <span className="italic text-[#80163A]">elevated.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-[16px] md:text-[17px] leading-[1.65] text-[#4A4A4A]">
                        Vessura is an intelligence layer for the clothes you already own.
                        Digitize every piece, compose outfits with precision, and let a
                        quiet system reveal the patterns beneath how you actually dress.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link href="/auth">
                            <a className="group inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-[#FDFBF7] px-6 py-3.5 text-[14px] tracking-wide hover:bg-[#80163A] transition-colors">
                                Get Started
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </a>
                        </Link>
                        <a
                            href="#how"
                            className="inline-flex items-center gap-2 rounded-full border border-[#1A1A1A]/15 bg-transparent px-6 py-3.5 text-[14px] tracking-wide text-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-colors"
                        >
                            See how it works
                        </a>
                    </div>

                    <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
                        <HeroMetric label="Pieces catalogued" value="48K+" />
                        <HeroMetric label="Avg. outfits generated" value="312" suffix="/ user" />
                        <HeroMetric label="Cost-per-wear reduction" value="−37%" />
                    </dl>
                </motion.div>

                {/* Visual: Atelier mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: EASE }}
                    className="lg:col-span-5"
                >
                    <AtelierMockup />
                </motion.div>
            </div>
        </section>
    );
}

function HeroMetric({
    label,
    value,
    suffix,
}: {
    label: string;
    value: string;
    suffix?: string;
}) {
    return (
        <div>
            <dt className="text-[11px] tracking-[0.14em] uppercase text-[#6B6B6B]">{label}</dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[26px] tracking-tight text-[#1A1A1A]" style={SERIF}>
                    {value}
                </span>
                {suffix && <span className="text-[11px] text-[#6B6B6B]">{suffix}</span>}
            </dd>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Atelier Mockup (hero visual — pure CSS/SVG)                         */
/* ------------------------------------------------------------------ */

function AtelierMockup() {
    return (
        <div className="relative">
            {/* Soft gold glow */}
            <div
                className="absolute -inset-10 -z-10 rounded-[40px] blur-3xl opacity-60"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(212,175,55,0.35), transparent 70%)",
                }}
                aria-hidden
            />
            <div className="relative rounded-2xl border border-[#E8E0CF] bg-white shadow-[0_30px_80px_-30px_rgba(26,26,26,0.25)] overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#EFE9DC] px-5 py-3.5 bg-[#FDFBF7]">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#E8CFA6]" />
                        <span className="h-2 w-2 rounded-full bg-[#E8CFA6]" />
                        <span className="h-2 w-2 rounded-full bg-[#E8CFA6]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="text-[12px] tracking-[0.12em] uppercase text-[#80163A]"
                            style={SERIF}
                        >
                            The Atelier
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
                    </div>
                    <span className="text-[10px] text-[#9A9A9A] tracking-wide">
                        Thu · 62°F · Overcast
                    </span>
                </div>

                {/* Body */}
                <div className="grid grid-cols-5 gap-3 p-5 bg-[#FBF7EE]">
                    {/* Canvas */}
                    <div className="col-span-3 rounded-xl bg-white border border-[#EEE7D7] p-4 flex flex-col gap-3 min-h-[340px]">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                                Composition · Monday
                            </span>
                            <span className="text-[10px] tracking-[0.14em] uppercase text-[#D4AF37]">
                                Harmonic
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 flex-1">
                            <GarmentTile tone="#1A1A1A" label="Wool blazer" sub="Dries Van Noten" shape="jacket" />
                            <GarmentTile tone="#D7C9B2" label="Silk shell" sub="The Row" shape="top" />
                            <GarmentTile tone="#2B2B2B" label="Tailored trouser" sub="Toteme" shape="trouser" />
                            <GarmentTile tone="#6E4A2B" label="Loafer" sub="Margaret H." shape="shoe" />
                        </div>

                        {/* Palette */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DC]">
                            <div className="flex items-center gap-1.5">
                                <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] ring-1 ring-[#E5DFD0]" />
                                <span className="h-3.5 w-3.5 rounded-full bg-[#D7C9B2] ring-1 ring-[#E5DFD0]" />
                                <span className="h-3.5 w-3.5 rounded-full bg-[#6E4A2B] ring-1 ring-[#E5DFD0]" />
                                <span className="h-3.5 w-3.5 rounded-full bg-[#80163A] ring-1 ring-[#E5DFD0]" />
                            </div>
                            <span className="text-[10px] text-[#6B6B6B] tracking-wide">
                                4 pieces · 0 duplicates
                            </span>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-2 flex flex-col gap-3">
                        <div className="rounded-xl bg-white border border-[#EEE7D7] p-4">
                            <span className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                                Suggested
                            </span>
                            <p className="mt-2 text-[13px] leading-snug text-[#1A1A1A]" style={SERIF}>
                                Swap loafer for <span className="italic">burgundy oxford</span> — echoes the blazer stitch.
                            </p>
                        </div>

                        <div className="rounded-xl bg-[#1A1A1A] text-[#FDFBF7] p-4">
                            <span className="text-[10px] tracking-[0.14em] uppercase text-[#D4AF37]">
                                Cost per wear
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-[24px] tracking-tight" style={SERIF}>
                                    $2.14
                                </span>
                                <span className="text-[10px] text-[#C9A959]">↓ 12%</span>
                            </div>
                            <div className="mt-3 h-1 w-full rounded-full bg-[#2A2A2A] overflow-hidden">
                                <div className="h-full w-[68%] bg-[#D4AF37]" />
                            </div>
                        </div>

                        <div className="rounded-xl bg-white border border-[#EEE7D7] p-4">
                            <span className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                                Wear journal
                            </span>
                            <ul className="mt-2 space-y-1.5 text-[11px] text-[#4A4A4A]">
                                <li className="flex items-center justify-between">
                                    <span>Mon · Client dinner</span>
                                    <span className="text-[#D4AF37]">★★★★★</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Wed · Studio day</span>
                                    <span className="text-[#D4AF37]">★★★★☆</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Fri · Gallery opening</span>
                                    <span className="text-[#D4AF37]">★★★★★</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating accent card */}
            <div className="hidden md:flex absolute -left-6 -bottom-6 items-center gap-3 rounded-xl bg-white border border-[#EEE7D7] shadow-lg px-4 py-3">
                <span className="h-8 w-8 rounded-full bg-[#80163A]/10 flex items-center justify-center">
                    <Fingerprint className="h-4 w-4 text-[#80163A]" aria-hidden />
                </span>
                <div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                        Style DNA
                    </div>
                    <div className="text-[12px] text-[#1A1A1A]" style={SERIF}>
                        Refined Minimalist · 87%
                    </div>
                </div>
            </div>
        </div>
    );
}

function GarmentTile({
    tone,
    label,
    sub,
    shape,
}: {
    tone: string;
    label: string;
    sub: string;
    shape: "jacket" | "top" | "trouser" | "shoe";
}) {
    return (
        <div className="rounded-lg border border-[#EEE7D7] bg-[#FBF7EE] p-3 flex flex-col gap-2">
            <div className="aspect-[4/3] rounded-md bg-white border border-[#EFE9DC] flex items-center justify-center">
                <GarmentSilhouette shape={shape} tone={tone} />
            </div>
            <div>
                <div className="text-[11px] text-[#1A1A1A] leading-tight">{label}</div>
                <div className="text-[9.5px] text-[#9A9A9A] tracking-wide uppercase">{sub}</div>
            </div>
        </div>
    );
}

function GarmentSilhouette({
    shape,
    tone,
}: {
    shape: "jacket" | "top" | "trouser" | "shoe";
    tone: string;
}) {
    const common = { fill: tone } as const;
    switch (shape) {
        case "jacket":
            return (
                <svg viewBox="0 0 80 64" className="h-full w-full p-2" role="img">
                    <title>Blazer silhouette</title>
                    <path
                        {...common}
                        d="M20 10 L32 4 L40 12 L48 4 L60 10 L70 20 L64 24 L64 58 L16 58 L16 24 L10 20 Z"
                        opacity="0.95"
                    />
                    <path d="M40 12 L40 58" stroke="#FDFBF7" strokeWidth="1" opacity="0.6" />
                </svg>
            );
        case "top":
            return (
                <svg viewBox="0 0 80 64" className="h-full w-full p-2" role="img">
                    <title>Shell top silhouette</title>
                    <path
                        {...common}
                        d="M22 14 L30 6 L50 6 L58 14 L70 22 L62 28 L62 58 L18 58 L18 28 L10 22 Z"
                        opacity="0.95"
                    />
                </svg>
            );
        case "trouser":
            return (
                <svg viewBox="0 0 80 64" className="h-full w-full p-2" role="img">
                    <title>Trouser silhouette</title>
                    <path
                        {...common}
                        d="M22 6 L58 6 L60 30 L54 60 L44 60 L40 32 L36 60 L26 60 L20 30 Z"
                        opacity="0.95"
                    />
                </svg>
            );
        case "shoe":
            return (
                <svg viewBox="0 0 80 64" className="h-full w-full p-3" role="img">
                    <title>Loafer silhouette</title>
                    <path
                        {...common}
                        d="M8 40 C 14 28 28 22 42 24 C 58 26 70 34 72 42 C 72 48 68 52 60 52 L14 52 C 10 52 8 48 8 44 Z"
                        opacity="0.95"
                    />
                    <path d="M32 32 L46 32" stroke="#FDFBF7" strokeWidth="1.5" opacity="0.8" />
                </svg>
            );
    }
}

/* ------------------------------------------------------------------ */
/* Editorial stats                                                     */
/* ------------------------------------------------------------------ */

function EditorialStats() {
    const items = [
        {
            figure: "80 / 20",
            line: "of your wardrobe is worn only twenty percent of the time.",
        },
        {
            figure: "$1,200",
            line: "sits, on average, in garments you haven't touched this year.",
        },
        {
            figure: "64%",
            line: "of purchases are regretted within six weeks of arrival.",
        },
    ];
    return (
        <section className="border-y border-[#ECE4D3] bg-[#FDFBF7]">
            <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-20">
                <motion.div {...fadeUp} className="mb-10 md:mb-14">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        Built for how you actually dress
                    </span>
                    <h2
                        className="mt-3 max-w-3xl text-[30px] md:text-[42px] leading-[1.1] tracking-[-0.01em]"
                        style={SERIF}
                    >
                        Most wardrobes fail quietly. Vessura makes the failure legible —
                        then removes it.
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-10 md:gap-16">
                    {items.map((it, i) => (
                        <motion.figure
                            key={i}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                            className="border-t border-[#E5DFD0] pt-6"
                        >
                            <div
                                className="text-[46px] md:text-[58px] leading-[1] tracking-[-0.02em] text-[#80163A]"
                                style={SERIF}
                            >
                                {it.figure}
                            </div>
                            <figcaption className="mt-4 text-[15px] leading-[1.6] text-[#4A4A4A] max-w-xs">
                                {it.line}
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Feature Grid                                                        */
/* ------------------------------------------------------------------ */

type Feature = {
    icon: typeof Shirt;
    eyebrow: string;
    title: string;
    body: string;
};

const FEATURES: Feature[] = [
    {
        icon: Shirt,
        eyebrow: "Catalogue",
        title: "Digital Wardrobe",
        body: "Photograph a piece; the system extracts color, category, fabric cues, and silhouette — no manual tagging.",
    },
    {
        icon: Layers,
        eyebrow: "Compose",
        title: "The Atelier",
        body: "A drag-and-drop canvas with AI suggestions tuned to weather, occasion, and the mood you pick.",
    },
    {
        icon: BookOpen,
        eyebrow: "Record",
        title: "Wear Journal",
        body: "Log what you wore with a selfie, rating, and note. Cost-per-wear updates itself, quietly.",
    },
    {
        icon: Fingerprint,
        eyebrow: "Understand",
        title: "Style DNA",
        body: "A living profile shaped by the outfits you actually rate highly — not by a quiz taken once.",
    },
    {
        icon: Target,
        eyebrow: "Refine",
        title: "Gap Analysis",
        body: "Essentials surfaced against your real calendar: the one blazer, shirt, or shoe that would unlock twelve new outfits.",
    },
    {
        icon: LineChart,
        eyebrow: "Measure",
        title: "Wardrobe Health",
        body: "A graded report on balance, dead-stock, and cost-per-wear. Plain numbers, not motivational posters.",
    },
];

function FeatureGrid() {
    return (
        <section id="features" className="relative py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <motion.div {...fadeUp} className="max-w-2xl mb-14 md:mb-20">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        The platform
                    </span>
                    <h2
                        className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em]"
                        style={SERIF}
                    >
                        Six instruments for one deliberate wardrobe.
                    </h2>
                    <p className="mt-4 text-[15px] leading-[1.65] text-[#4A4A4A]">
                        Each surface is built to be used — not admired. Together they form a
                        feedback loop between what you own, what you wear, and what you miss.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E0CF] border border-[#E8E0CF] rounded-2xl overflow-hidden">
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={f.title} feature={f} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    const Icon = feature.icon;
    const [hover, setHover] = useState(false);
    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: (index % 3) * 0.06, ease: EASE }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="group relative bg-[#FDFBF7] p-8 md:p-10 transition-all duration-300 hover:bg-white"
        >
            {/* Gold top accent on hover */}
            <span
                className="absolute top-0 left-0 h-[2px] bg-[#D4AF37] transition-[width] duration-500 ease-out"
                style={{ width: hover ? "100%" : "0%" }}
                aria-hidden
            />

            <div className="flex items-center gap-2 mb-5">
                <span className="h-9 w-9 rounded-full bg-[#FAF3E1] border border-[#EFE0BF] flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#80163A]" aria-hidden />
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B]">
                    {feature.eyebrow}
                </span>
            </div>
            <h3 className="text-[22px] leading-[1.2] tracking-[-0.005em] text-[#1A1A1A]" style={SERIF}>
                {feature.title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#4A4A4A] max-w-sm">
                {feature.body}
            </p>

            <ArrowUpRight
                className="absolute top-8 right-8 h-4 w-4 text-[#C9A959] opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
                aria-hidden
            />
        </motion.article>
    );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
    const steps = [
        {
            n: "01",
            title: "Capture",
            line: "Photograph a piece — background removal, color extraction, and categorization happen in seconds.",
        },
        {
            n: "02",
            title: "Compose",
            line: "Open the Atelier and build outfits, or accept a suggestion tuned to today's weather and what's ahead.",
        },
        {
            n: "03",
            title: "Log & refine",
            line: "Record what you wore. Your Style DNA, gaps, and cost-per-wear update — the system learns you.",
        },
    ];
    return (
        <section id="how" className="relative py-24 md:py-32 bg-[#FAF6EE] border-y border-[#ECE4D3]">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
                    <div>
                        <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                            How it works
                        </span>
                        <h2
                            className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em] max-w-xl"
                            style={SERIF}
                        >
                            Three motions. The rest is ambient.
                        </h2>
                    </div>
                    <p className="max-w-sm text-[14px] leading-[1.65] text-[#4A4A4A]">
                        No weekly setup ritual. The product gets sharper the less you think about it.
                    </p>
                </motion.div>

                <div className="relative grid md:grid-cols-3 gap-10 md:gap-6">
                    {/* Connecting line */}
                    <div
                        className="hidden md:block absolute top-[38px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
                        aria-hidden
                    />
                    {steps.map((s, i) => (
                        <motion.div
                            key={s.n}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                            className="relative"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="relative z-10 flex h-[34px] min-w-[58px] items-center justify-center rounded-full border border-[#E5DFD0] bg-[#FDFBF7] px-3 text-[12px] tracking-[0.18em] text-[#80163A]">
                                    {s.n}
                                </span>
                                <span className="h-px flex-1 bg-[#E5DFD0]" aria-hidden />
                            </div>
                            <h3
                                className="text-[26px] leading-[1.15] tracking-[-0.01em] text-[#1A1A1A]"
                                style={SERIF}
                            >
                                {s.title}
                            </h3>
                            <p className="mt-3 text-[14px] leading-[1.65] text-[#4A4A4A] max-w-sm">
                                {s.line}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Deep feature: Style DNA                                             */
/* ------------------------------------------------------------------ */

function StyleDnaSpotlight() {
    return (
        <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                <motion.div {...fadeUp} className="lg:col-span-6 order-2 lg:order-1">
                    <StyleDnaMock />
                </motion.div>

                <motion.div {...fadeUp} className="lg:col-span-6 order-1 lg:order-2">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        Deep dive · Style DNA
                    </span>
                    <h2
                        className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em] max-w-xl"
                        style={SERIF}
                    >
                        A style profile that earns its own conclusions.
                    </h2>
                    <p className="mt-5 text-[15px] leading-[1.7] text-[#4A4A4A] max-w-xl">
                        Most tools ask you twelve questions and call it a personality.
                        Vessura watches which outfits you rate, which items you reach for on
                        Tuesdays, which colors you discard. Your profile shifts with you —
                        slowly, accurately, and without a shopping recommendation attached.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {[
                            { k: "Signal source", v: "Wear logs, ratings, outfit saves, calendar context" },
                            { k: "Update cadence", v: "Continuous — recalibrated after every 10 wears" },
                            { k: "What it refuses", v: "Generic archetypes, trend-forcing, quiz personalities" },
                        ].map((row) => (
                            <li key={row.k} className="grid grid-cols-[150px_1fr] gap-6 border-b border-[#ECE4D3] pb-3">
                                <span className="text-[11px] tracking-[0.16em] uppercase text-[#6B6B6B]">
                                    {row.k}
                                </span>
                                <span className="text-[14px] text-[#1A1A1A]">{row.v}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
}

function StyleDnaMock() {
    // Radar chart — six style axes
    const axes = [
        { label: "Minimal", value: 0.88 },
        { label: "Tailored", value: 0.72 },
        { label: "Romantic", value: 0.34 },
        { label: "Utility", value: 0.58 },
        { label: "Editorial", value: 0.81 },
        { label: "Relaxed", value: 0.46 },
    ];
    const size = 340;
    const center = size / 2;
    const radius = 130;

    const point = (i: number, r: number) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        return {
            x: center + Math.cos(angle) * r,
            y: center + Math.sin(angle) * r,
        };
    };

    const rings = [0.25, 0.5, 0.75, 1];
    const poly = axes
        .map((a, i) => {
            const p = point(i, radius * a.value);
            return `${p.x},${p.y}`;
        })
        .join(" ");

    return (
        <div className="relative rounded-2xl border border-[#E8E0CF] bg-white p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(26,26,26,0.2)]">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-[#6B6B6B]">
                        Style DNA
                    </div>
                    <div className="text-[20px] text-[#1A1A1A]" style={SERIF}>
                        Refined Editorial · <span className="text-[#80163A]">87</span>
                    </div>
                </div>
                <span className="text-[10px] tracking-[0.14em] uppercase text-[#D4AF37]">
                    Evolving · April
                </span>
            </div>

            <div className="flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Style DNA radar chart">
                    <title>Radar chart showing six style axes</title>
                    {/* Rings */}
                    {rings.map((r, idx) => (
                        <polygon
                            key={idx}
                            points={axes
                                .map((_, i) => {
                                    const p = point(i, radius * r);
                                    return `${p.x},${p.y}`;
                                })
                                .join(" ")}
                            fill="none"
                            stroke="#EFE9DC"
                            strokeWidth={1}
                        />
                    ))}
                    {/* Spokes */}
                    {axes.map((_, i) => {
                        const p = point(i, radius);
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={p.x}
                                y2={p.y}
                                stroke="#EFE9DC"
                                strokeWidth={1}
                            />
                        );
                    })}
                    {/* Value polygon */}
                    <polygon
                        points={poly}
                        fill="rgba(128,22,58,0.12)"
                        stroke="#80163A"
                        strokeWidth={1.5}
                    />
                    {/* Value dots */}
                    {axes.map((a, i) => {
                        const p = point(i, radius * a.value);
                        return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#D4AF37" />;
                    })}
                    {/* Labels */}
                    {axes.map((a, i) => {
                        const p = point(i, radius + 24);
                        return (
                            <text
                                key={i}
                                x={p.x}
                                y={p.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={11}
                                fill="#4A4A4A"
                                style={{ letterSpacing: "0.08em" }}
                            >
                                {a.label.toUpperCase()}
                            </text>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                <Stat label="Signature color" value="Burgundy" />
                <Stat label="Core silhouette" value="Tailored" />
                <Stat label="Worn weekly" value="14 pieces" />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-[#FBF7EE] border border-[#EFE9DC] py-2.5 px-3">
            <div className="text-[9px] tracking-[0.14em] uppercase text-[#6B6B6B]">{label}</div>
            <div className="text-[13px] text-[#1A1A1A] mt-0.5" style={SERIF}>
                {value}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Deep feature: Gap Analysis                                          */
/* ------------------------------------------------------------------ */

function GapAnalysisSpotlight() {
    return (
        <section className="py-24 md:py-32 bg-[#FAF6EE] border-y border-[#ECE4D3]">
            <div className="mx-auto max-w-7xl px-6 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                <motion.div {...fadeUp} className="lg:col-span-6">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        Deep dive · Gap Analysis
                    </span>
                    <h2
                        className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em] max-w-xl"
                        style={SERIF}
                    >
                        One precise recommendation is worth a thousand capsule lists.
                    </h2>
                    <p className="mt-5 text-[15px] leading-[1.7] text-[#4A4A4A] max-w-xl">
                        Vessura reads your existing pieces, your calendar, and your Style DNA,
                        then names the exact gap — the structured blazer you keep trying to
                        fake with a cardigan. You get a price range, three shortlisted brands,
                        and the twelve outfits that piece would unlock. Nothing more.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {["Calendar-aware", "Brand-agnostic", "No affiliate pressure"].map((t) => (
                            <span
                                key={t}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DFD0] bg-white/70 px-3 py-1.5 text-[11px] tracking-wide text-[#4A4A4A]"
                            >
                                <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
                                {t}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.div {...fadeUp} className="lg:col-span-6">
                    <GapAnalysisMock />
                </motion.div>
            </div>
        </section>
    );
}

function GapAnalysisMock() {
    return (
        <div className="rounded-2xl border border-[#E8E0CF] bg-white overflow-hidden shadow-[0_20px_60px_-30px_rgba(26,26,26,0.2)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE9DC] bg-[#FDFBF7]">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#80163A]" aria-hidden />
                    <span className="text-[12px] tracking-[0.16em] uppercase text-[#1A1A1A]">
                        Gap Analysis · April
                    </span>
                </div>
                <span className="text-[10px] tracking-[0.14em] uppercase text-[#D4AF37]">
                    3 gaps found
                </span>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex items-start gap-5">
                    <div className="flex-1">
                        <div className="text-[10px] tracking-[0.18em] uppercase text-[#6B6B6B]">
                            Missing essential · Priority 01
                        </div>
                        <h3
                            className="mt-2 text-[28px] leading-[1.15] tracking-[-0.01em] text-[#1A1A1A]"
                            style={SERIF}
                        >
                            Structured wool blazer
                            <span className="italic text-[#80163A]">, navy or charcoal.</span>
                        </h3>
                        <p className="mt-3 text-[14px] leading-[1.65] text-[#4A4A4A] max-w-md">
                            You have three client-facing events before May 20 and no
                            tailored top layer. This piece connects eleven existing outfits
                            across work and evening.
                        </p>
                    </div>

                    <div className="shrink-0 rounded-lg border border-[#EFE9DC] bg-[#FBF7EE] p-3">
                        <GarmentSilhouette shape="jacket" tone="#2B3347" />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#EFE9DC] bg-[#FBF7EE] p-4">
                        <div className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                            Price range
                        </div>
                        <div className="mt-1 text-[20px] text-[#1A1A1A]" style={SERIF}>
                            $180 – $340
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#EFE9DC] bg-[#FBF7EE] p-4">
                        <div className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                            Outfits unlocked
                        </div>
                        <div className="mt-1 text-[20px] text-[#1A1A1A]" style={SERIF}>
                            +12
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#EFE9DC] bg-[#FBF7EE] p-4">
                        <div className="text-[10px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                            CPW target
                        </div>
                        <div className="mt-1 text-[20px] text-[#1A1A1A]" style={SERIF}>
                            &lt; $3.50
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="text-[10px] tracking-[0.18em] uppercase text-[#6B6B6B] mb-3">
                        Shortlist
                    </div>
                    <ul className="divide-y divide-[#EFE9DC] border-y border-[#EFE9DC]">
                        {[
                            { brand: "Toteme", item: "Double-breasted wool blazer", price: "$295" },
                            { brand: "COS", item: "Tailored recycled wool", price: "$210" },
                            { brand: "Theory", item: "Clairene wool twill", price: "$325" },
                        ].map((row) => (
                            <li key={row.brand} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-7 w-7 rounded-full bg-[#1A1A1A] text-[#FDFBF7] text-[10px] tracking-wide flex items-center justify-center">
                                        {row.brand.slice(0, 1)}
                                    </span>
                                    <div>
                                        <div className="text-[13px] text-[#1A1A1A]">{row.brand}</div>
                                        <div className="text-[11px] text-[#6B6B6B]">{row.item}</div>
                                    </div>
                                </div>
                                <div className="text-[13px] text-[#1A1A1A] tabular-nums" style={SERIF}>
                                    {row.price}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

function Testimonials() {
    const quotes = [
        {
            name: "Amara Okafor",
            role: "Marketing Director",
            quote:
                "Vessura replaced three apps and a spreadsheet. I know what I own, what it costs me per wear, and what I'm genuinely missing — without the shopping-funnel noise.",
            initials: "AO",
        },
        {
            name: "Noor El-Sayed",
            role: "Independent Stylist",
            quote:
                "I've used every wardrobe tool on the market for clients. The Atelier is the first one that moves the way I actually think about a look.",
            initials: "NE",
        },
        {
            name: "Jamie Lindqvist",
            role: "Strategy Consultant",
            quote:
                "The wear journal changed the conversation with my own closet. Cost-per-wear isn't abstract anymore; it's the number I check before I buy.",
            initials: "JL",
        },
    ];
    return (
        <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <motion.div {...fadeUp} className="max-w-2xl mb-14 md:mb-20">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        Said plainly
                    </span>
                    <h2
                        className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em]"
                        style={SERIF}
                    >
                        Used by people whose wardrobes are their instruments.
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {quotes.map((q, i) => (
                        <motion.figure
                            key={q.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                            className="relative rounded-2xl border border-[#E8E0CF] bg-white p-8 flex flex-col h-full"
                        >
                            <span
                                aria-hidden
                                className="absolute top-5 left-6 text-[64px] leading-none text-[#D4AF37]/60"
                                style={SERIF}
                            >
                                &ldquo;
                            </span>
                            <blockquote
                                className="mt-10 text-[16px] leading-[1.65] text-[#1A1A1A] flex-1"
                                style={SERIF}
                            >
                                {q.quote}
                            </blockquote>
                            <figcaption className="mt-6 pt-5 border-t border-[#EFE9DC] flex items-center gap-3">
                                <span
                                    className="h-10 w-10 rounded-full border border-[#D4AF37]/60 text-[#80163A] flex items-center justify-center text-[12px] tracking-[0.12em]"
                                    aria-hidden
                                >
                                    {q.initials}
                                </span>
                                <div>
                                    <div className="text-[13px] text-[#1A1A1A]">{q.name}</div>
                                    <div className="text-[11px] tracking-wide text-[#6B6B6B]">
                                        {q.role}
                                    </div>
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Comparison / Pricing                                                */
/* ------------------------------------------------------------------ */

function CompareTable() {
    const rows = [
        { label: "You know what you own", without: false, with_: true },
        { label: "Outfits composed in under 60 seconds", without: false, with_: true },
        { label: "Cost-per-wear, calculated automatically", without: false, with_: true },
        { label: "A style profile that evolves from real wear", without: false, with_: true },
        { label: "Missing essentials surfaced with price ranges", without: false, with_: true },
        { label: "Pack for a trip by destination weather", without: false, with_: true },
        { label: "Impulse-buys quietly discouraged", without: false, with_: true },
    ];
    return (
        <section id="pricing" className="py-24 md:py-32 bg-[#FAF6EE] border-y border-[#ECE4D3]">
            <div className="mx-auto max-w-5xl px-6 md:px-10">
                <motion.div {...fadeUp} className="text-center mb-14 md:mb-16">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-[#80163A]">
                        Early access
                    </span>
                    <h2
                        className="mt-3 text-[34px] md:text-[48px] leading-[1.08] tracking-[-0.01em]"
                        style={SERIF}
                    >
                        Free during beta. A considered pricing tier will follow.
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-[15px] leading-[1.7] text-[#4A4A4A]">
                        Every feature, unlimited pieces, full intelligence — for everyone who
                        joins before public launch.
                    </p>
                </motion.div>

                <motion.div {...fadeUp} className="rounded-2xl border border-[#E8E0CF] bg-white overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-[#EFE9DC] bg-[#FDFBF7]">
                        <div className="p-5 md:p-6 text-[11px] tracking-[0.18em] uppercase text-[#6B6B6B]">
                            Capability
                        </div>
                        <div className="p-5 md:p-6 border-l border-[#EFE9DC] text-center">
                            <div className="text-[11px] tracking-[0.18em] uppercase text-[#6B6B6B]">
                                Without Vessura
                            </div>
                            <div className="text-[13px] mt-1 text-[#9A9A9A]" style={SERIF}>
                                The default
                            </div>
                        </div>
                        <div className="p-5 md:p-6 border-l border-[#EFE9DC] text-center bg-[#FBF3DE]">
                            <div className="text-[11px] tracking-[0.18em] uppercase text-[#80163A]">
                                With Vessura
                            </div>
                            <div className="text-[13px] mt-1 text-[#1A1A1A]" style={SERIF}>
                                Your wardrobe, legible
                            </div>
                        </div>
                    </div>

                    {rows.map((r, i) => (
                        <div
                            key={r.label}
                            className={`grid grid-cols-3 ${
                                i !== rows.length - 1 ? "border-b border-[#EFE9DC]" : ""
                            }`}
                        >
                            <div className="p-5 md:p-6 text-[14px] text-[#1A1A1A]">{r.label}</div>
                            <div className="p-5 md:p-6 border-l border-[#EFE9DC] flex items-center justify-center">
                                <span className="h-7 w-7 rounded-full border border-[#E5DFD0] flex items-center justify-center">
                                    <Minus className="h-3.5 w-3.5 text-[#9A9A9A]" aria-label="Not available" />
                                </span>
                            </div>
                            <div className="p-5 md:p-6 border-l border-[#EFE9DC] flex items-center justify-center bg-[#FBF7EE]">
                                <span className="h-7 w-7 rounded-full bg-[#80163A] flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-[#FDFBF7]" aria-label="Included" />
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="p-6 md:p-8 bg-[#FDFBF7] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE9DC]">
                        <div>
                            <div className="text-[12px] tracking-[0.16em] uppercase text-[#6B6B6B]">
                                Beta access
                            </div>
                            <div className="text-[22px] text-[#1A1A1A] mt-1" style={SERIF}>
                                $0 <span className="text-[#9A9A9A] text-[14px]">— for now</span>
                            </div>
                        </div>
                        <Link href="/auth">
                            <a className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-[#FDFBF7] px-6 py-3.5 text-[14px] tracking-wide hover:bg-[#80163A] transition-colors">
                                Claim your seat
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </a>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
    const [email, setEmail] = useState("");
    return (
        <section className="relative py-28 md:py-40 overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 -z-10"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(800px 500px at 50% 30%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(900px 600px at 50% 110%, rgba(128,22,58,0.10), transparent 65%), linear-gradient(180deg, #FDFBF7 0%, #F8F2E4 100%)",
                }}
            />
            <div className="mx-auto max-w-4xl px-6 md:px-10 text-center">
                <motion.h2
                    {...fadeUp}
                    className="text-[48px] sm:text-[64px] md:text-[88px] leading-[0.95] tracking-[-0.02em] text-[#1A1A1A]"
                    style={SERIF}
                >
                    Dress
                    <span className="italic text-[#80163A]"> deliberately.</span>
                </motion.h2>
                <motion.p
                    {...fadeUp}
                    className="mt-6 max-w-xl mx-auto text-[16px] leading-[1.7] text-[#4A4A4A]"
                >
                    Stop managing your wardrobe by memory. Bring it into a system designed
                    with the same care as the pieces inside it.
                </motion.p>

                <motion.form
                    {...fadeUp}
                    className="mt-10 mx-auto max-w-lg flex flex-col sm:flex-row gap-3"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label htmlFor="cta-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="cta-email"
                        type="email"
                        required
                        placeholder="you@considered.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 rounded-full border border-[#E5DFD0] bg-white/80 px-5 py-3.5 text-[14px] text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#80163A] transition-colors"
                    />
                    <Link href="/auth">
                        <a className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A1A] text-[#FDFBF7] px-6 py-3.5 text-[14px] tracking-wide hover:bg-[#80163A] transition-colors">
                            Request access
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </a>
                    </Link>
                </motion.form>

                <p className="mt-4 text-[11px] tracking-wide text-[#9A9A9A]">
                    No marketing blasts. One note when your seat opens.
                </p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function SiteFooter() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-[#E8E0CF] bg-[#FDFBF7]">
            <div className="mx-auto max-w-7xl px-6 md:px-10 py-14 md:py-16 grid md:grid-cols-12 gap-10">
                <div className="md:col-span-5">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[22px] tracking-tight text-[#1A1A1A]" style={SERIF}>
                            Vessura
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#80163A]" aria-hidden />
                    </div>
                    <p className="mt-4 text-[13px] leading-[1.65] text-[#6B6B6B] max-w-sm">
                        An intelligence layer for the clothes you already own. Built with
                        quiet care, in public beta.
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD0] px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-[#6B6B6B]">
                            <CalendarDays className="h-3 w-3" aria-hidden />
                            Established 2026
                        </span>
                    </div>
                </div>

                <FooterCol
                    heading="Product"
                    links={[
                        { label: "Features", href: "#features" },
                        { label: "How it works", href: "#how" },
                        { label: "Pricing", href: "#pricing" },
                        { label: "Get started", href: "/auth" },
                    ]}
                />
                <FooterCol
                    heading="Platform"
                    links={[
                        { label: "The Atelier", href: "#features" },
                        { label: "Style DNA", href: "#features" },
                        { label: "Gap Analysis", href: "#features" },
                        { label: "Wardrobe Health", href: "#features" },
                    ]}
                />
                <FooterCol
                    heading="Legal"
                    links={[
                        { label: "Privacy", href: "#" },
                        { label: "Terms", href: "#" },
                        { label: "Cookies", href: "#" },
                        { label: "Contact", href: "#" },
                    ]}
                />
            </div>
            <div className="border-t border-[#EFE9DC]">
                <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] tracking-wide text-[#9A9A9A]">
                        © {year} Vessura. All rights reserved.
                    </span>
                    <span className="text-[11px] tracking-[0.18em] uppercase text-[#9A9A9A]">
                        Designed in quiet
                    </span>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({
    heading,
    links,
}: {
    heading: string;
    links: { label: string; href: string }[];
}) {
    return (
        <nav className="md:col-span-2" aria-label={heading}>
            <div className="text-[11px] tracking-[0.18em] uppercase text-[#6B6B6B] mb-4">
                {heading}
            </div>
            <ul className="space-y-2.5">
                {links.map((l) => (
                    <li key={l.label}>
                        {l.href.startsWith("/") ? (
                            <Link href={l.href}>
                                <a className="text-[13px] text-[#1A1A1A] hover:text-[#80163A] transition-colors">
                                    {l.label}
                                </a>
                            </Link>
                        ) : (
                            <a
                                href={l.href}
                                className="text-[13px] text-[#1A1A1A] hover:text-[#80163A] transition-colors"
                            >
                                {l.label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
