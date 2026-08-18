
"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

// آیکون گیت‌هاب (SVG)
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ------------------------------------------------------------
//  MemberCard
// ------------------------------------------------------------
function MemberCard({ member, isLarge = false }: { member: TeamMember; isLarge?: boolean }) {
  const t = useTranslations("Team");
  const locale = useLocale();
  const isFa = locale === "fa";

  // پنل پایین – ارتفاع ثابت
  const panelVariants: Variants = {
    rest: {
      height: "100px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    hover: {
      height: "100px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  // دکمه‌های اجتماعی – با استفاده از as const برای transition
  const socialButtonVariants: Variants = {
    rest: {
      width: "36px",
      padding: "6px 0",
      transition: { type: "tween", duration: 0.25, ease: "easeOut" } as const,
    },
    hover: {
      width: "92px",
      padding: "6px 16px",
      transition: { type: "tween", duration: 0.25, ease: "easeOut" } as const,
    },
  };

  // متن دکمه‌ها – برای RTL تنظیم شده
  const socialTextVariants: Variants = {
    rest: { opacity: 0, width: 0, margin: 0, display: "none" },
    hover: {
      opacity: 1,
      width: "auto",
      marginLeft: isFa ? "0" : "6px",
      marginRight: isFa ? "6px" : "0",
      display: "inline-block",
      transition: { delay: 0.06, duration: 0.15, ease: "easeOut" } as const,
    },
  };

  // انیمیشن اسم – بزرگ‌تر شدن با origin مناسب
  const nameVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 20 } },
  };

  const nameOrigin = isFa ? "origin-bottom-right" : "origin-bottom-left";

  // ترتیب دکمه‌ها در فارسی برعکس می‌شود
  const socialButtons = isFa ? (
    <>
      <motion.a
        href={`mailto:${member.email}`}
        variants={socialButtonVariants}
        className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors duration-300 overflow-hidden whitespace-nowrap will-change-[width,padding]"
      >
        <Mail className="size-4 flex-shrink-0" />
        <motion.span
          variants={socialTextVariants}
          className="text-xs font-medium overflow-hidden"
          style={{ direction: "ltr" }}
        >
          ایمیل
        </motion.span>
      </motion.a>
      <motion.a
        href={`https://github.com/${member.github}`}
        target="_blank"
        rel="noreferrer"
        variants={socialButtonVariants}
        className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors duration-300 overflow-hidden whitespace-nowrap will-change-[width,padding]"
      >
        <GitHubIcon className="size-4 flex-shrink-0" />
        <motion.span
          variants={socialTextVariants}
          className="text-xs font-medium overflow-hidden"
          style={{ direction: "ltr" }}
        >
          گیت‌هاب
        </motion.span>
      </motion.a>
    </>
  ) : (
    <>
      <motion.a
        href={`https://github.com/${member.github}`}
        target="_blank"
        rel="noreferrer"
        variants={socialButtonVariants}
        className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors duration-300 overflow-hidden whitespace-nowrap will-change-[width,padding]"
      >
        <GitHubIcon className="size-4 flex-shrink-0" />
        <motion.span
          variants={socialTextVariants}
          className="text-xs font-medium overflow-hidden"
        >
          GitHub
        </motion.span>
      </motion.a>
      <motion.a
        href={`mailto:${member.email}`}
        variants={socialButtonVariants}
        className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors duration-300 overflow-hidden whitespace-nowrap will-change-[width,padding]"
      >
        <Mail className="size-4 flex-shrink-0" />
        <motion.span
          variants={socialTextVariants}
          className="text-xs font-medium overflow-hidden"
        >
          Email
        </motion.span>
      </motion.a>
    </>
  );

  return (
    <motion.div
      variants={itemVariants}
      className={`relative h-full ${isLarge ? "md:col-span-2 lg:col-span-4 max-w-sm mx-auto w-full" : "w-full"}`}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="group relative w-full rounded-2xl overflow-hidden bg-card border border-border/40 shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/40 aspect-[4/7] sm:aspect-[4/6.5] cursor-default"
      >
        {/* عکس پس‌زمینه */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted/5">
          <motion.div
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.05 },
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Image
              src={member.avatar}
              alt={t(`members.${member.keyName}`)}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={isLarge}
            />
          </motion.div>
        </div>

        {/* گرادینت از پایین */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Glow رنگی روی هاور */}
        <motion.div
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 0.5 },
          }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none mix-blend-overlay`}
        />

        {/* پنل پایین */}
        <motion.div
          variants={panelVariants}
          className="absolute bottom-0 left-0 right-0 z-10 px-5 py-4 overflow-visible"
        >
          <div className="flex flex-col justify-end h-full">
            {/* اسم و نقش */}
            <motion.div
              variants={nameVariants}
              className={`space-y-0.5 ${nameOrigin}`}
            >
              <h3 className="text-2xl font-extrabold tracking-tight leading-tight drop-shadow-lg text-white">
                {t(`members.${member.keyName}`)}
              </h3>
              <p className="text-sm font-medium text-white/80 drop-shadow-md">
                {t(`roles.${member.roleKey}`)}
              </p>
            </motion.div>

            {/* دکمه‌های اجتماعی */}
            <div className="flex items-center gap-2 mt-3">{socialButtons}</div>
          </div>
        </motion.div>

        {/* خط تزئینی پایین */}
        <motion.div
          variants={{
            rest: { width: "0%" },
            hover: { width: "100%" },
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}

// ------------------------------------------------------------
//  TeamClient
// ------------------------------------------------------------
export function TeamClient() {
  const t = useTranslations("Team");
  const locale = useLocale();
  const isFa = locale === "fa";

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* اورب‌های متحرک */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 120, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[180px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className={`absolute top-1/2 ${isFa ? "-right-64" : "-left-64"} h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[160px]`}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-fuchsia-500/10 blur-[200px]"
        />
      </div>

      {/* هدر */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-background/40 backdrop-blur-md border border-border/40 text-muted-foreground text-sm font-semibold shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t("sections.leadership")}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-foreground leading-[1.1]">
            {t("title")}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </motion.div>
      </div>

      {/* بخش‌های تیم */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 space-y-20">
        <section>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {leadershipTeam.map((member) => (
              <MemberCard key={member.id} member={member} isLarge />
            ))}
          </motion.div>
        </section>

        <section>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {engineeringTeam.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>

        <section>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {contentTeam.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="max-w-3xl mx-auto mt-28 px-4 md:px-6 relative z-10 text-center"
      >
        <div className="relative flex flex-col items-center gap-6 rounded-[3rem] border border-border/40 bg-card/40 px-8 py-14 shadow-2xl backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground relative z-10">
            {t("cta.joinTeam")}
          </h3>
          <p className="max-w-md text-muted-foreground relative z-10 text-lg">
            {t("cta.joinTeamDesc")}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="group/btn relative overflow-hidden inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-10 py-5 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 z-10"
          >
            <span className="relative z-10">{t("cta.openPositions")}</span>
            <ArrowRight
              className={`relative z-10 h-5 w-5 transition-transform duration-300 ${
                isFa ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"
              }`}
            />
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
