"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Mail, User } from "lucide-react";

interface TeamMember {
  id: string;
  keyName: string;
  roleKey: string;
  github?: string;
  email?: string;
  gradient: string;
}

const allMembers: TeamMember[] = [
  { id: "m1", keyName: "morteza", roleKey: "head", email: "shafiei@euroslotpars.com", gradient: "from-blue-500/20 to-cyan-500/20" },
  { id: "e1", keyName: "saeed", roleKey: "frontend", github: "saeed92jf", email: "saeed92jf@gmail.com", gradient: "from-violet-500/20 to-fuchsia-500/20" },
  { id: "e2", keyName: "peyman", roleKey: "backend", github: "peymansh72", email: "peyman@example.com", gradient: "from-amber-500/20 to-orange-500/20" },
  { id: "e3", keyName: "pouria", roleKey: "server", github: "p-yavari", email: "pouria@example.com", gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: "c1", keyName: "mohammadSaeed", roleKey: "content", gradient: "from-rose-500/20 to-red-500/20" },
  { id: "c2", keyName: "behzad", roleKey: "content", gradient: "from-indigo-500/20 to-blue-500/20" },
  { id: "c3", keyName: "seyedMohammad", roleKey: "content", gradient: "from-fuchsia-500/20 to-pink-500/20" },
  { id: "c4", keyName: "sina", roleKey: "content", gradient: "from-cyan-500/20 to-sky-500/20" },
];

function MemberCard({ member }: { member: TeamMember }) {
  const t = useTranslations("Team");
  const locale = useLocale();
  const isFa = locale === "fa";
  
  return (
    <div className="group relative flex-shrink-0 w-64 md:w-72 h-[22rem] md:h-[26rem] rounded-[2rem] overflow-hidden bg-muted/30 border border-border/40 shadow-sm hover:shadow-2xl hover:border-border/80 transition-all duration-500 cursor-pointer">
      
      {/* Background / Image Placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Abstract Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="absolute inset-0 flex items-center justify-center pb-20">
        <User className="size-32 text-foreground/10 group-hover:text-foreground/20 transition-colors duration-500" />
      </div>

      {/* Social Links (Hidden by default, appear on hover) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-20">
        {member.github && (
          <a href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-colors">
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
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} className="p-3 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-colors">
            <Mail className="size-4" />
          </a>
        )}
      </div>

      {/* Glassmorphism Name Tag at Bottom */}
      <div className="absolute bottom-3 left-3 right-3 p-4 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl group-hover:bg-background/80 group-hover:border-border transition-colors duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight truncate">
          {t(`members.${member.keyName}`)}
        </h3>
        <p className="text-sm font-medium text-muted-foreground truncate">
          {t(`roles.${member.roleKey}`)}
        </p>
      </div>
    </div>
  );
}

export function TeamClient() {
  const t = useTranslations("Team");
  
  // We double the array so the marquee can seamlessly loop
  const duplicatedMembers = [...allMembers, ...allMembers, ...allMembers];

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambient Grid/Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--theme-rgb),0.05),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6 mb-16 md:mb-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
            {t("sections.leadership")} & Team
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </motion.div>
      </div>

      {/* Infinite Marquee Section */}
      <div className="relative w-full overflow-hidden pb-10">
        
        {/* Left and Right Fade Masks for a premium look */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div className="flex group w-max">
          <motion.div
            className="flex gap-6 px-3"
            animate={{ x: ["0%", "-33.333333%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35, // Adjust speed here
            }}
            // Framer motion allows us to pause animations on hover using a whileHover on the wrapper, 
            // but for marquee we can just use simple CSS animation or let Framer Motion handle it.
            // Using a CSS approach for hover pause is often cleaner for infinite scrolling, but Framer Motion is fine.
          >
            {duplicatedMembers.map((member, idx) => (
              <MemberCard key={`${member.id}-${idx}`} member={member} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
