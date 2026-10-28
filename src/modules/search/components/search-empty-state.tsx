"use client";

import React from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
  isRtl?: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Fun Animated SVG: The Inquisitive Robot Detective & Scanner
 * High-tech, expressive, whimsical, and fully theme-adaptive.
 */
function FunSearchingRobot({ isRtl }: { isRtl?: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] select-none mx-auto">
      {/* Soft Ambient Radial Blur Behind Illustration (Fixed Cool Cyber Glow) */}
      <motion.div
        animate={{
          scale: [0.92, 1.08, 0.92],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-x-12 top-6 bottom-10 rounded-full blur-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-400/20 to-indigo-500/20 dark:from-cyan-500/25 dark:via-sky-500/20 dark:to-indigo-500/25"
      />

      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" className="dark:[stop-color:#2a314b]" />
            <stop offset="50%" stopColor="#f1f5f9" className="dark:[stop-color:#1c2237]" />
            <stop offset="100%" stopColor="#cbd5e1" className="dark:[stop-color:#141828]" />
          </linearGradient>

          <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b0f19" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* ── 1. Ground Shadow (Breathes with floating robot) ── */}
        <motion.ellipse
          cx="160"
          cy="218"
          rx="52"
          ry="9"
          className="fill-slate-900/15 dark:fill-black/40"
          animate={{
            scaleX: [1, 0.82, 1],
            scaleY: [1, 0.78, 1],
            opacity: [0.25, 0.12, 0.25],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />



        {/* ── 3. Floating Detective Robot (Main Body Group) ── */}
        <motion.g
          animate={{
            y: [0, -10, 0],
            rotate: [-1.2, 1.2, -1.2],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "160px 140px" }}
        >
          {/* Antenna Rod */}
          <path
            d="M 160 74 L 160 52"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-slate-400 dark:text-slate-500"
          />

          {/* Antenna Glowing Signal Sphere (Warm Beacon) */}
          <motion.circle
            cx="160"
            cy="48"
            r="6"
            fill="#fbbf24"
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Antenna Pulse Ripples */}
          <motion.circle
            cx="160"
            cy="48"
            r="6"
            stroke="#fbbf24"
            strokeWidth="2"
            fill="none"
            animate={{
              r: [6, 18],
              opacity: [0.9, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Robot Ears / Side Sensors */}
          <rect
            x="108"
            y="108"
            width="8"
            height="18"
            rx="4"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <circle cx="112" cy="117" r="1.5" fill="#00f5d4" />

          <rect
            x="204"
            y="108"
            width="8"
            height="18"
            rx="4"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <circle cx="208" cy="117" r="1.5" fill="#00f5d4" />

          {/* Main Pod Body (Head + Torso combined in friendly round shape) */}
          <rect
            x="114"
            y="72"
            width="92"
            height="90"
            rx="40"
            fill="url(#robotBodyGrad)"
            className="stroke-slate-300/80 dark:stroke-slate-700/80 shadow-inner"
            strokeWidth="2.5"
          />

          {/* Belly Badge Indicator (Fixed Cyber Cyan) */}
          <circle
            cx="160"
            cy="146"
            r="4.5"
            fill="#00f5d4"
            opacity="0.85"
          />

          {/* Visor Area (Dark curved high-gloss screen) */}
          <rect
            x="125"
            y="90"
            width="70"
            height="42"
            rx="20"
            fill="url(#robotVisorGrad)"
            className="stroke-slate-700/60 dark:stroke-slate-800"
            strokeWidth="1.5"
          />

          {/* Expressive Animated Digital Eyes (Fixed Radiant Cyan with White Pupils) */}
          <motion.g
            animate={{
              x: [0, -4, -4, 4, 4, 0],
              scaleY: [1, 1, 1, 0.12, 1, 1],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              times: [0, 0.25, 0.5, 0.72, 0.78, 1],
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "160px 111px" }}
          >
            {/* Left Eye */}
            <circle
              cx="147"
              cy="111"
              r="6.5"
              fill="#00f5d4"
            />
            <circle cx="149" cy="109" r="2" fill="#ffffff" opacity="0.95" />

            {/* Right Eye */}
            <circle
              cx="173"
              cy="111"
              r="6.5"
              fill="#00f5d4"
            />
            <circle cx="175" cy="109" r="2" fill="#ffffff" opacity="0.95" />
          </motion.g>

          {/* Left Shoulder Joint Socket (Firmly anchored on the robot body) */}
          <circle
            cx="114"
            cy="124"
            r="4.5"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <circle cx="114" cy="124" r="1.5" fill="#00f5d4" opacity="0.85" />

          {/* ── Left Arm with Robotic Claw (Subtle pivot around shoulder joint) ── */}
          <motion.g
            animate={{
              rotate: [-2.5, 3.5, -2.5],
            }}
            transition={{
              duration: 3.0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "114px 124px" }}
          >
            {/* Left Arm Limb extending cleanly from shoulder socket */}
            <path
              d="M 114 124 Q 102 134 96 144"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="text-slate-300 dark:text-slate-600"
            />
            {/* Left Wrist Swivel */}
            <circle
              cx="96"
              cy="144"
              r="4"
              className="fill-slate-400 dark:fill-slate-500"
            />
            <circle cx="96" cy="144" r="1.5" fill="#00f5d4" />

            {/* Left Hand Robotic Claw (چنگک ربات) */}
            <path
              d="M 94 141 C 88 139 84 144 87 149"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-300"
              fill="none"
            />
            <path
              d="M 98 146 C 95 152 101 156 104 150"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-300"
              fill="none"
            />
          </motion.g>

          {/* Right Shoulder Joint Socket (Anchored on the robot body) */}
          <circle
            cx="206"
            cy="122"
            r="4.5"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <circle cx="206" cy="122" r="1.5" fill="#00f5d4" opacity="0.85" />

          {/* ── 4. Right Arm + Gripper Claw + Fixed Magnifying Glass (Subtle pivot around right shoulder) ── */}
          <motion.g
            animate={{
              rotate: isRtl ? [-3, 4, -3] : [-4, 4, -4],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "206px 122px" }}
          >
            {/* Right Arm Limb extending from shoulder to wrist */}
            <path
              d="M 206 122 Q 220 128 226 140"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              className="text-slate-300 dark:text-slate-600"
            />

            {/* Magnifying Glass Handle - Firmly locked through robot gripper at (226, 140) */}
            <path
              d="M 218 150 L 243 118"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-slate-600 dark:text-slate-400"
            />
            {/* Handle Grip Cyan Collar */}
            <path
              d="M 231 133 L 237 125"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Right Wrist Swivel Base */}
            <circle
              cx="226"
              cy="140"
              r="4.5"
              className="fill-slate-400 dark:fill-slate-500"
            />

            {/* Right Hand Robotic Claw (چنگک ربات) clamping securely over the handle */}
            {/* Upper Claw Pincer */}
            <path
              d="M 225 136 C 227 129 237 130 236 137"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-300"
              fill="none"
            />
            {/* Lower Claw Pincer */}
            <path
              d="M 225 144 C 228 150 237 148 235 142"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-300"
              fill="none"
            />
            {/* Wrist Rivet Pin */}
            <circle cx="226" cy="140" r="1.5" fill="#00f5d4" />

            {/* Lens Outer Rim (Positioned clearly to the side at cx=252, cy=102) */}
            <circle
              cx="252"
              cy="102"
              r="22"
              className="fill-slate-100/90 dark:fill-slate-900/90"
              stroke="#0284c7"
              strokeWidth="3.5"
            />

            {/* Lens Glass Fill */}
            <circle
              cx="252"
              cy="102"
              r="18.5"
              fill="url(#lensGrad)"
            />

            {/* Subtle Optical Guide Ring */}
            <circle
              cx="252"
              cy="102"
              r="13"
              stroke="#38bdf8"
              strokeWidth="0.8"
              opacity="0.25"
            />

            {/* Glass Curved Glare / Reflection Arc */}
            <path
              d="M 240 92 A 15 15 0 0 1 264 94"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Center Reticle Dot */}
            <circle
              cx="252"
              cy="102"
              r="2.2"
              fill="#00f5d4"
            />

            {/* Curious Question Mark inside lens (gently pulses in place) */}
            <motion.text
              x="252"
              y="108"
              textAnchor="middle"
              fill="#0284c7"
              className="dark:fill-[#38bdf8] font-bold text-[16px] select-none"
              animate={{
                opacity: [0.75, 1, 0.75],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "252px 102px" }}
            >
              ?
            </motion.text>
          </motion.g>
        </motion.g>

        {/* ── 5. Floating Whimsical Particle Elements ── */}
        {/* Floating Mini Question Mark 1 */}
        <motion.g
          animate={{
            y: [-3, -16, -3],
            x: [-2, 3, -2],
            opacity: [0.2, 0.85, 0.2],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <text
            x="88"
            y="95"
            className="fill-sky-400 font-bold text-sm select-none"
          >
            ?
          </text>
        </motion.g>

        {/* Floating Mini Twinkle Star ✦ (Fixed Amber, Floating Above Lens) */}
        <motion.path
          d="M 270 52 L 272 57 L 277 59 L 272 61 L 270 66 L 268 61 L 263 59 L 268 57 Z"
          fill="#f59e0b"
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [0.7, 1.25, 0.7],
            opacity: [0.35, 0.95, 0.35],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "270px 59px" }}
        />

        {/* Floating Secondary Twinkle Star (Fixed Indigo/Purple) */}
        <motion.path
          d="M 96 160 L 97.5 163.5 L 101 165 L 97.5 166.5 L 96 170 L 94.5 166.5 L 91 165 L 94.5 163.5 Z"
          fill="#818cf8"
          animate={{
            scale: [1, 0.5, 1],
            opacity: [0.85, 0.25, 0.85],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          style={{ transformOrigin: "96px 165px" }}
        />

        {/* Floating Document Sheet (Positioned high up in upper-left, completely clear of the hand) */}
        <motion.g
          animate={{
            y: [0, -8, 0],
            rotate: [-6, 6, -6],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          style={{ transformOrigin: "68px 64px" }}
        >
          {/* Paper Sheet with Folded Corner */}
          <path
            d="M 58 52 H 72 L 78 58 V 76 H 58 Z"
            className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Folded Dog-Ear Corner */}
          <path
            d="M 72 52 V 58 H 78"
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Document Text Lines */}
          <line
            x1="62"
            y1="62"
            x2="71"
            y2="62"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="text-slate-300 dark:text-slate-600"
          />
          <line
            x1="62"
            y1="67"
            x2="74"
            y2="67"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="text-slate-300 dark:text-slate-600"
          />
          <line
            x1="62"
            y1="72"
            x2="68"
            y2="72"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="text-slate-300 dark:text-slate-600"
          />
        </motion.g>


      </svg>
    </div>
  );
}

/**
 * SearchEmptyState Component
 * Displays the original Google-style message box on top,
 * with the animated SVG robot placed cleanly underneath.
 * No extra buttons or keyword tags.
 */
export function SearchEmptyState({
  query,
  isRtl,
  t,
}: SearchEmptyStateProps) {
  return (
    <div className="w-full max-w-3xl mt-6 flex flex-col gap-6 sm:gap-8">
      {/* ── 1. Google-Style No Results Messages Box ── */}
      <div className="w-full rounded-2xl border border-dashed border-border/90 bg-muted/20 p-6 sm:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-5" />
          </div>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              {t("noResultsTitle", { query })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("noResultsSuggestions")}
            </p>
            <ul className="list-disc space-y-1.5 ps-5 text-sm text-muted-foreground/90">
              <li>{t("suggestion1")}</li>
              <li>{t("suggestion2")}</li>
              <li>{t("suggestion3")}</li>
              <li>{t("suggestion4")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 2. Animated Robot SVG Underneath ── */}
      <div className="w-full flex justify-center py-2 sm:py-4">
        <FunSearchingRobot isRtl={isRtl} />
      </div>
    </div>
  );
}
