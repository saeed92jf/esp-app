
"use client";

import { useRef } from "react";
import { motion, Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import mortezaAvatar from "../avatars/morteza-shafiee.webp";
import saeedAvatar from "../avatars/saeed-jalili-fard.webp";
import peymanAvatar from "../avatars/peyman-sharifi.webp";
import pouriaAvatar from "../avatars/pooria-yavari.webp";
import mohammadSaeedAvatar from "../avatars/mohammad-saeedkhani.webp";
import behzadAvatar from "../avatars/behzad-saeedi.webp";
import seyedMohammadAvatar from "../avatars/mohammad-hoseini-fard.webp";
import sinaAvatar from "../avatars/sina-jahanbakhsh.webp";

interface TeamMember {
  id: string;
  keyName: string;
  roleKey: string;
  github: string;
  email: string;
  gradient: string;
  avatar: string;
}

const leadershipTeam: TeamMember[] = [
  {
    id: "m1",
    keyName: "morteza",
    roleKey: "head",
    github: "morteza-sh",
    email: "shafiei@euroslotpars.com",
    gradient: "from-blue-500/30 to-cyan-500/30",
    avatar: mortezaAvatar.src,
  },
];

const engineeringTeam: TeamMember[] = [
  {
    id: "e1",
    keyName: "saeed",
    roleKey: "frontend",
    github: "saeed92jf",
    email: "saeed92jf@gmail.com",
    gradient: "from-violet-500/30 to-fuchsia-500/30",
    avatar: saeedAvatar.src,
  },
  {
    id: "e2",
    keyName: "peyman",
    roleKey: "backend",
    github: "peymansh72",
    email: "peyman@example.com",
    gradient: "from-amber-500/30 to-orange-500/30",
    avatar: peymanAvatar.src,
  },
  {
    id: "e3",
    keyName: "pouria",
    roleKey: "server",
    github: "p-yavari",
    email: "pouria@example.com",
    gradient: "from-emerald-500/30 to-teal-500/30",
    avatar: pouriaAvatar.src,
  },
];

const contentTeam: TeamMember[] = [
  {
    id: "c1",
    keyName: "mohammadSaeed",
    roleKey: "content",
    github: "msaeed-content",
    email: "msaeed@example.com",
    gradient: "from-rose-500/30 to-red-500/30",
    avatar: mohammadSaeedAvatar.src,
  },
  {
    id: "c2",
    keyName: "behzad",
    roleKey: "content",
    github: "behzad-creative",
    email: "behzad@example.com",
    gradient: "from-indigo-500/30 to-blue-500/30",
    avatar: behzadAvatar.src,
  },
  {
    id: "c3",
    keyName: "seyedMohammad",
    roleKey: "content",
    github: "smohammad-media",
    email: "smohammad@example.com",
    gradient: "from-fuchsia-500/30 to-pink-500/30",
    avatar: seyedMohammadAvatar.src,
  },
  {
    id: "c4",
    keyName: "sina",
    roleKey: "content",
    github: "sina-social",
    email: "sina@example.com",
    gradient: "from-cyan-500/30 to-sky-500/30",
    avatar: sinaAvatar.src,
  },
];

// ─── الگوی باینری پس‌زمینه (محاسبه یک‌بار در module) ─────────────────────────
const BINARY_BG = Array.from({ length: 60 }, (_, row) =>
  Array.from({ length: 220 }, (_, col) =>
    (row * 31 + col * 17) % 5 > 2 ? "1" : "0"
  ).join(" ")
).join("\n");

// ─── Variants (خارج از کامپوننت تا در هر render دوباره ساخته نشن) ────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const imgZoomVariants: Variants = {
  rest: { scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.04, transition: { duration: 0.5, ease: "easeOut" } },
};

const glowVariants: Variants = {
  rest: { opacity: 0, transition: { duration: 0.4, ease: "easeOut" } },
  hover: { opacity: 0.45, transition: { duration: 0.35, ease: "easeOut" } },
};

// اسم بالا می‌رود، بعد دکمه‌ها باز می‌شوند
const nameVariants: Variants = {
  rest: { y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  hover: { y: -12, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

const socialBtnVariants: Variants = {
  rest: {
    width: 36,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  hover: {
    width: 100,
    transition: { delay: 0.22, duration: 0.32, ease: [0.4, 0, 0.2, 1] },
  },
};

const socialTextVariants: Variants = {
  rest: {
    opacity: 0,
    x: -5,
    transition: { duration: 0.12, ease: "easeIn" },
  },
  hover: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.56, duration: 0.18, ease: "easeOut" },
  },
};

// متن دکمه راست
const socialTextRightVariants: Variants = {
  rest: {
    opacity: 0,
    x: 5,
    transition: { duration: 0.12, ease: "easeIn" },
  },
  hover: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.56, duration: 0.18, ease: "easeOut" },
  },
};

// ─── GitHubIcon ───────────────────────────────────────────────────────────────
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ─── دکمه اجتماعی (framer-motion برای slide روان) ───────────────────────────
function SocialBtn({
  href,
  label,
  icon,
  external,
  side = "left",
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  side?: "left" | "right";
}) {
  const isRight = side === "right";

  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      variants={socialBtnVariants}
      style={{ willChange: "width" }}
      className={`relative overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors duration-300 h-9 flex items-center ${isRight ? "flex-row-reverse" : ""}`}
      dir="ltr"
    >
      {/* آیکون – absolute، همیشه در گوشه مربوطه */}
      <div className={`absolute inset-y-0 ${isRight ? "right-0" : "left-0"} w-9 flex items-center justify-center pointer-events-none`}>
        {icon}
      </div>
      {/* فضانگه‌دار */}
      <div className="w-9 h-9 flex-shrink-0" />
      {/* متن کشویی */}
      <motion.span
        variants={isRight ? socialTextRightVariants : socialTextVariants}
        className={`text-xs font-medium whitespace-nowrap ${isRight ? "pl-3" : "pr-3"}`}
      >
        {label}
      </motion.span>
    </motion.a>
  );
}

// ─── MemberCard ───────────────────────────────────────────────────────────────
function MemberCard({
  member,
  isLarge = false,
  fillHeight = false,
}: {
  member: TeamMember;
  isLarge?: boolean;
  fillHeight?: boolean;
}) {
  const t = useTranslations("Team");
  const locale = useLocale();

  return (
    <motion.div
      variants={itemVariants}
      className={`relative h-full ${
        isLarge ? "max-w-[280px] mx-auto w-full" : "w-full"
      }`}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        style={{ willChange: "transform" }}
        className={`group relative w-full rounded-2xl overflow-hidden bg-card border border-border/40 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-shadow duration-300 cursor-default ${
          fillHeight ? "h-full" : "aspect-[4/7] sm:aspect-[4/6.5]"
        }`}
      >
        {/* عکس پس‌زمینه */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted/5">
          <motion.div
            variants={imgZoomVariants}
            style={{ willChange: "transform" }}
            className="w-full h-full"
          >
            <Image
              src={member.avatar}
              alt={t(`members.${member.keyName}`)}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={isLarge}
            />
          </motion.div>
        </div>

        {/* گرادینت از پایین – استاتیک */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Glow رنگی روی هاور */}
        <motion.div
          variants={glowVariants}
          style={{ willChange: "opacity" }}
          className={`absolute inset-0 bg-gradient-to-br ${member.gradient} pointer-events-none mix-blend-overlay`}
        />

        {/* پنل پایین – اسم و نقش وسط‌چین، با هاور بالا می‌رود */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-14 pt-4">
          <motion.div variants={nameVariants} style={{ willChange: "transform" }} className="text-center space-y-0.5">
            <h3 className="text-2xl font-extrabold tracking-tight leading-tight drop-shadow-lg text-white">
              {t(`members.${member.keyName}`)}
            </h3>
            <p className="text-sm font-medium text-white/80 drop-shadow-md">
              {t(`roles.${member.roleKey}`)}
            </p>
          </motion.div>
        </div>

        {/* دکمه چپ – گوشه پایین چپ، به سمت راست باز می‌شه */}
        <div className="absolute bottom-4 left-3 z-20">
          <SocialBtn
            href={`https://github.com/${member.github}`}
            label={locale === "fa" ? "گیت‌هاب" : "GitHub"}
            icon={<GitHubIcon />}
            external
            side="left"
          />
        </div>

        {/* دکمه راست – گوشه پایین راست، به سمت چپ باز می‌شه */}
        <div className="absolute bottom-4 right-3 z-20">
          <SocialBtn
            href={`mailto:${member.email}`}
            label={locale === "fa" ? "ایمیل" : "Email"}
            icon={<Mail className="size-4 flex-shrink-0" />}
            side="right"
          />
        </div>

      </motion.div>
    </motion.div>
  );
}

// ─── TeamClient ───────────────────────────────────────────────────────────────
export function TeamClient() {
  const t = useTranslations("Team");
  const locale = useLocale();
  const isFa = locale === "fa";
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);

  return (
    <div className="relative">
      {/* الگوی باینری – fixed تا در همه سکشن‌ها دیده بشه */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none font-mono text-[10px] leading-[18px] tracking-wider text-foreground/[0.055] whitespace-pre"
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        {BINARY_BG}
      </div>

      {/* ═══ Section 1: هدر + کارت رهبری ═══ */}
      <section className="h-dvh min-h-[580px] flex flex-col items-center pt-28 pb-10 px-4 md:px-6 relative z-10">
        {/* هدر */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-background/40 backdrop-blur-md border border-border/40 text-muted-foreground text-sm font-semibold shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t("sections.leadership")}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-foreground leading-[1.15]">
            {t("title")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </motion.div>

        {/* کارت رهبری – وسط، با ارتفاع کشیده */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center justify-center w-full py-4"
        >
          <div className="w-[220px] sm:w-[260px] h-full max-h-[480px]">
            <MemberCard member={leadershipTeam[0]} isLarge fillHeight />
          </div>
        </motion.div>

        {/* دکمه اسکرول */}
        <motion.button
          onClick={() => section2Ref.current?.scrollIntoView({ behavior: "smooth" })}
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 cursor-pointer"
          aria-label="scroll to engineering team"
        >
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">scroll</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </section>

      {/* ═══ Section 2: تیم مهندسی (۳ کارت) ═══ */}
      <section
        ref={section2Ref}
        className="h-dvh min-h-[580px] flex items-center justify-center px-4 md:px-6 py-20 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          dir="ltr"
          className="grid gap-5 grid-cols-1 sm:grid-cols-3 w-full max-w-4xl"
          style={{ height: "min(calc(100dvh - 160px), 520px)" }}
        >
          {engineeringTeam.map((member) => (
            <MemberCard key={member.id} member={member} fillHeight />
          ))}
        </motion.div>
      </section>

      {/* ═══ Section 3: تیم محتوا (۴ کارت) ═══ */}
      <section
        ref={section3Ref}
        className="h-dvh min-h-[580px] flex items-center justify-center px-4 md:px-6 py-20 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          dir="ltr"
          className="grid gap-5 grid-cols-2 sm:grid-cols-4 w-full max-w-5xl"
          style={{ height: "min(calc(100dvh - 160px), 480px)" }}
        >
          {contentTeam.map((member) => (
            <MemberCard key={member.id} member={member} fillHeight />
          ))}
        </motion.div>
      </section>

      {/* \u2500\u2500\u2500 \u0628\u0631\u06af\u0634\u062a \u0628\u0647 \u062e\u0627\u0646\u0647 \u2500\u2500\u2500 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center gap-6 py-24 px-4 relative z-10"
      >
        {/* خط جداکننده */}
        <div className="w-16 h-px bg-border/50" />

        <p className="text-sm text-muted-foreground/60 tracking-wider uppercase">
          {isFa ? "پایان" : "end of page"}
        </p>

        {/* دکمه برگشت */}
        <Link
          href={`/${locale}`}
          className="group inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-background/60 backdrop-blur-sm px-7 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:border-border transition-all duration-300 hover:shadow-sm"
        >
          <ArrowRight
            className={`h-4 w-4 transition-transform duration-300 ${
              isFa
                ? "group-hover:translate-x-1"
                : "rotate-180 group-hover:-translate-x-1"
            }`}
          />
          <span>{isFa ? "بازگشت به خانه" : "Back to Home"}</span>
        </Link>
      </motion.div>
    </div>
  );
}
