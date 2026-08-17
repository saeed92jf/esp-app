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
  { id: "m1", keyName: "morteza", roleKey: "head", github: "morteza-sh", email: "shafiei@euroslotpars.com", gradient: "from-blue-500/20 to-cyan-500/20", avatar: mortezaAvatar.src },
];

const engineeringTeam: TeamMember[] = [
  { id: "e1", keyName: "saeed", roleKey: "frontend", github: "saeed92jf", email: "saeed92jf@gmail.com", gradient: "from-violet-500/20 to-fuchsia-500/20", avatar: saeedAvatar.src },
  { id: "e2", keyName: "peyman", roleKey: "backend", github: "peymansh72", email: "peyman@example.com", gradient: "from-amber-500/20 to-orange-500/20", avatar: peymanAvatar.src },
  { id: "e3", keyName: "pouria", roleKey: "server", github: "p-yavari", email: "pouria@example.com", gradient: "from-emerald-500/20 to-teal-500/20", avatar: pouriaAvatar.src },
];

const contentTeam: TeamMember[] = [
  { id: "c1", keyName: "mohammadSaeed", roleKey: "content", github: "msaeed-content", email: "msaeed@example.com", gradient: "from-rose-500/20 to-red-500/20", avatar: mohammadSaeedAvatar.src },
  { id: "c2", keyName: "behzad", roleKey: "content", github: "behzad-creative", email: "behzad@example.com", gradient: "from-indigo-500/20 to-blue-500/20", avatar: behzadAvatar.src },
  { id: "c3", keyName: "seyedMohammad", roleKey: "content", github: "smohammad-media", email: "smohammad@example.com", gradient: "from-fuchsia-500/20 to-pink-500/20", avatar: seyedMohammadAvatar.src },
  { id: "c4", keyName: "sina", roleKey: "content", github: "sina-social", email: "sina@example.com", gradient: "from-cyan-500/20 to-sky-500/20", avatar: sinaAvatar.src },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function MemberCard({ member, isLarge = false }: { member: TeamMember, isLarge?: boolean }) {
  const t = useTranslations("Team");

  return (
    <motion.div 
      variants={itemVariants}
      className={`relative h-full ${isLarge ? 'md:col-span-2 lg:col-span-4 max-w-sm mx-auto w-full' : 'w-full'}`}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="relative w-full rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm transition-shadow duration-500 hover:shadow-xl hover:border-primary/30 aspect-[4/5] sm:aspect-[3/4] cursor-default"
      >
        
        {/* Background Gradient */}
        <motion.div 
          variants={{ rest: { opacity: 0.1 }, hover: { opacity: 0.4 } }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${member.gradient} z-0 pointer-events-none`} 
        />
        
        {/* Abstract Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 pointer-events-none" />

        {/* AI Avatar */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted/10 z-0">
          <motion.div
            variants={{ rest: { opacity: 0.9 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Image 
              src={member.avatar} 
              alt={t(`members.${member.keyName}`)} 
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </div>

        {/* Info & Social Panel */}
        <motion.div 
          variants={{ rest: { y: 0 }, hover: { y: "101%" } }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Buttery smooth custom easing
          className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-4 border-t border-border/30 bg-card/95 z-10 will-change-transform"
        >
          <div className="text-center">
            <h3 className={`font-bold text-foreground mb-1 tracking-tight leading-tight h-[3.5rem] flex items-center justify-center ${isLarge ? 'text-2xl' : 'text-xl'}`}>
              <span className="line-clamp-2">{t(`members.${member.keyName}`)}</span>
            </h3>
            <p className="text-sm font-medium text-primary/80">
              {t(`roles.${member.roleKey}`)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <a 
              href={`https://github.com/${member.github}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-background/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all duration-300"
            >
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
                className="size-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="text-xs font-semibold">GitHub</span>
            </a>
            <a 
              href={`mailto:${member.email}`} 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-background/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all duration-300"
            >
              <Mail className="size-4" />
              <span className="text-xs font-semibold">Email</span>
            </a>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
export function TeamClient() {
  const t = useTranslations("Team");
  const locale = useLocale();
  const isFa = locale === "fa";

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Animated Glowing Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -right-24 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className={`absolute top-1/2 ${isFa ? '-right-48' : '-left-48'} h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]`}
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6 mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-background/50 backdrop-blur-md border border-border/50 text-muted-foreground text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t("sections.leadership")} & Team</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 space-y-16">
        
        {/* Leadership Section (No Heading) */}
        <section>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {leadershipTeam.map((member) => (
              <MemberCard key={member.id} member={member} isLarge />
            ))}
          </motion.div>
        </section>

        {/* Engineering Section (No Heading) */}
        <section>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {engineeringTeam.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>

        {/* Content Section (No Heading) */}
        <section>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {contentTeam.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>

      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="max-w-3xl mx-auto mt-24 px-4 md:px-6 relative z-10 text-center"
      >
        <div className="flex flex-col items-center gap-6 rounded-[2.5rem] border border-border/50 bg-card/60 px-8 py-12 shadow-xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground relative z-10">
            {t("cta.joinTeam")}
          </h3>
          <p className="max-w-md text-muted-foreground relative z-10">
            {t("cta.joinTeamDesc")}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="group/btn relative overflow-hidden inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105 active:scale-95 z-10"
          >
            <span className="relative z-10">{t("cta.openPositions")}</span>
            <ArrowRight className={`relative z-10 h-5 w-5 transition-transform duration-300 ${isFa ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"}`} />
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
