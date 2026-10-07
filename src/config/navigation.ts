import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  House,
  Compass,
  SpeakerHifi,
  ShareNetwork,
  PaperPlaneTilt,
  ChartPolar,
  Kanban,
  ListChecks,
  Calendar,
  PresentationChart,
  GridFour,
  Archive,
  Files,
  PenNib,
  Invoice,
  Article,
  UsersThree,
  Buildings,
  Fingerprint,
  PiggyBank,
  PlayCircle,
  Image as Images,
  VideoCamera,
  Headphones,
  BookOpenText,
  Cpu,
} from "@phosphor-icons/react";

/**
 * Semantic color tokens for navigation items and groups.
 * Using tokens (not raw Tailwind classes) keeps the config
 * framework-agnostic and avoids Tailwind purge issues.
 * Consumers map these tokens to actual classes as needed.
 */
export type NavColor =
  | "rose"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo"
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "emerald"
  | "green"
  | "lime"
  | "yellow"
  | "amber"
  | "orange"
  | "red"
  | "sunset"
  | "ocean"
  | "forest"
  | "berry"
  | "grape"
  | "mango"
  | "slate";

export const NAV_COLOR_MAP: Record<
  NavColor,
  {
    icon: string;
    iconHover: string;
    iconBg: string;
    bg: string;
    ring: string;
    hover: string;
  }
> = {
  rose: {
    icon: "text-rose-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-rose-500/10 group-hover:bg-gradient-to-br group-hover:from-rose-400 group-hover:to-red-600",
    bg: "group-hover:bg-rose-500/5",
    ring: "group-hover:border-rose-500/40",
    hover: "group-hover:bg-rose-500/10",
  },
  pink: {
    icon: "text-pink-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-pink-500/10 group-hover:bg-gradient-to-br group-hover:from-pink-400 group-hover:to-rose-600",
    bg: "group-hover:bg-pink-500/5",
    ring: "group-hover:border-pink-500/40",
    hover: "group-hover:bg-pink-500/10",
  },
  fuchsia: {
    icon: "text-fuchsia-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-fuchsia-500/10 group-hover:bg-gradient-to-br group-hover:from-fuchsia-400 group-hover:to-purple-600",
    bg: "group-hover:bg-fuchsia-500/5",
    ring: "group-hover:border-fuchsia-500/40",
    hover: "group-hover:bg-fuchsia-500/10",
  },
  purple: {
    icon: "text-purple-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-purple-500/10 group-hover:bg-gradient-to-br group-hover:from-purple-400 group-hover:to-indigo-600",
    bg: "group-hover:bg-purple-500/5",
    ring: "group-hover:border-purple-500/40",
    hover: "group-hover:bg-purple-500/10",
  },
  violet: {
    icon: "text-violet-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-violet-500/10 group-hover:bg-gradient-to-br group-hover:from-violet-400 group-hover:to-purple-600",
    bg: "group-hover:bg-violet-500/5",
    ring: "group-hover:border-violet-500/40",
    hover: "group-hover:bg-violet-500/10",
  },
  indigo: {
    icon: "text-indigo-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-indigo-500/10 group-hover:bg-gradient-to-br group-hover:from-indigo-400 group-hover:to-blue-700",
    bg: "group-hover:bg-indigo-500/5",
    ring: "group-hover:border-indigo-500/40",
    hover: "group-hover:bg-indigo-500/10",
  },
  blue: {
    icon: "text-blue-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-blue-500/10 group-hover:bg-gradient-to-br group-hover:from-blue-400 group-hover:to-cyan-600",
    bg: "group-hover:bg-blue-500/5",
    ring: "group-hover:border-blue-500/40",
    hover: "group-hover:bg-blue-500/10",
  },
  sky: {
    icon: "text-sky-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-sky-500/10 group-hover:bg-gradient-to-br group-hover:from-sky-400 group-hover:to-blue-600",
    bg: "group-hover:bg-sky-500/5",
    ring: "group-hover:border-sky-500/40",
    hover: "group-hover:bg-sky-500/10",
  },
  cyan: {
    icon: "text-cyan-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-cyan-500/10 group-hover:bg-gradient-to-br group-hover:from-cyan-400 group-hover:to-blue-500",
    bg: "group-hover:bg-cyan-500/5",
    ring: "group-hover:border-cyan-500/40",
    hover: "group-hover:bg-cyan-500/10",
  },
  teal: {
    icon: "text-teal-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-teal-500/10 group-hover:bg-gradient-to-br group-hover:from-teal-400 group-hover:to-emerald-600",
    bg: "group-hover:bg-teal-500/5",
    ring: "group-hover:border-teal-500/40",
    hover: "group-hover:bg-teal-500/10",
  },
  emerald: {
    icon: "text-emerald-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-emerald-500/10 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-green-600",
    bg: "group-hover:bg-emerald-500/5",
    ring: "group-hover:border-emerald-500/40",
    hover: "group-hover:bg-emerald-500/10",
  },
  green: {
    icon: "text-green-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-green-500/10 group-hover:bg-gradient-to-br group-hover:from-green-400 group-hover:to-emerald-600",
    bg: "group-hover:bg-green-500/5",
    ring: "group-hover:border-green-500/40",
    hover: "group-hover:bg-green-500/10",
  },
  lime: {
    icon: "text-lime-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-lime-500/10 group-hover:bg-gradient-to-br group-hover:from-lime-400 group-hover:to-green-500",
    bg: "group-hover:bg-lime-500/5",
    ring: "group-hover:border-lime-500/40",
    hover: "group-hover:bg-lime-500/10",
  },
  yellow: {
    icon: "text-yellow-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-yellow-500/10 group-hover:bg-gradient-to-br group-hover:from-yellow-400 group-hover:to-amber-500",
    bg: "group-hover:bg-yellow-500/5",
    ring: "group-hover:border-yellow-500/40",
    hover: "group-hover:bg-yellow-500/10",
  },
  amber: {
    icon: "text-amber-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-amber-500/10 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-orange-500",
    bg: "group-hover:bg-amber-500/5",
    ring: "group-hover:border-amber-500/40",
    hover: "group-hover:bg-amber-500/10",
  },
  orange: {
    icon: "text-orange-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-orange-500/10 group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-red-500",
    bg: "group-hover:bg-orange-500/5",
    ring: "group-hover:border-orange-500/40",
    hover: "group-hover:bg-orange-500/10",
  },
  red: {
    icon: "text-red-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-red-500/10 group-hover:bg-gradient-to-br group-hover:from-red-400 group-hover:to-rose-600",
    bg: "group-hover:bg-red-500/5",
    ring: "group-hover:border-red-500/40",
    hover: "group-hover:bg-red-500/10",
  },
  sunset: {
    icon: "text-orange-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-orange-500/10 group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-pink-500",
    bg: "group-hover:bg-orange-500/5",
    ring: "group-hover:border-orange-500/40",
    hover: "group-hover:bg-orange-500/10",
  },
  ocean: {
    icon: "text-cyan-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-cyan-500/10 group-hover:bg-gradient-to-br group-hover:from-cyan-400 group-hover:to-blue-600",
    bg: "group-hover:bg-cyan-500/5",
    ring: "group-hover:border-cyan-500/40",
    hover: "group-hover:bg-cyan-500/10",
  },
  forest: {
    icon: "text-emerald-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-emerald-500/10 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-600",
    bg: "group-hover:bg-emerald-500/5",
    ring: "group-hover:border-emerald-500/40",
    hover: "group-hover:bg-emerald-500/10",
  },
  berry: {
    icon: "text-fuchsia-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-fuchsia-500/10 group-hover:bg-gradient-to-br group-hover:from-fuchsia-400 group-hover:to-rose-500",
    bg: "group-hover:bg-fuchsia-500/5",
    ring: "group-hover:border-fuchsia-500/40",
    hover: "group-hover:bg-fuchsia-500/10",
  },
  grape: {
    icon: "text-purple-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-purple-500/10 group-hover:bg-gradient-to-br group-hover:from-purple-400 group-hover:to-pink-500",
    bg: "group-hover:bg-purple-500/5",
    ring: "group-hover:border-purple-500/40",
    hover: "group-hover:bg-purple-500/10",
  },
  mango: {
    icon: "text-yellow-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-yellow-500/10 group-hover:bg-gradient-to-br group-hover:from-yellow-400 group-hover:to-orange-500",
    bg: "group-hover:bg-yellow-500/5",
    ring: "group-hover:border-yellow-500/40",
    hover: "group-hover:bg-yellow-500/10",
  },
  slate: {
    icon: "text-slate-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-slate-500/10 group-hover:bg-gradient-to-br group-hover:from-slate-400 group-hover:to-gray-600",
    bg: "group-hover:bg-slate-500/5",
    ring: "group-hover:border-slate-500/40",
    hover: "group-hover:bg-slate-500/10",
  },
};

export const NAV_COLOR_ICON_GRADIENT_MAP: Partial<Record<NavColor, string>> = {
  rose: "[&_*]:!fill-[url(#grad-rose)]",
  pink: "[&_*]:!fill-[url(#grad-pink)]",
  fuchsia: "[&_*]:!fill-[url(#grad-fuchsia)]",
  purple: "[&_*]:!fill-[url(#grad-purple)]",
  violet: "[&_*]:!fill-[url(#grad-violet)]",
  indigo: "[&_*]:!fill-[url(#grad-indigo)]",
  blue: "[&_*]:!fill-[url(#grad-blue)]",
  sky: "[&_*]:!fill-[url(#grad-sky)]",
  cyan: "[&_*]:!fill-[url(#grad-cyan)]",
  teal: "[&_*]:!fill-[url(#grad-teal)]",
  emerald: "[&_*]:!fill-[url(#grad-emerald)]",
  green: "[&_*]:!fill-[url(#grad-green)]",
  lime: "[&_*]:!fill-[url(#grad-lime)]",
  yellow: "[&_*]:!fill-[url(#grad-yellow)]",
  amber: "[&_*]:!fill-[url(#grad-amber)]",
  orange: "[&_*]:!fill-[url(#grad-orange)]",
  red: "[&_*]:!fill-[url(#grad-red)]",
  sunset: "[&_*]:!fill-[url(#grad-sunset)]",
  ocean: "[&_*]:!fill-[url(#grad-ocean)]",
  forest: "[&_*]:!fill-[url(#grad-forest)]",
  berry: "[&_*]:!fill-[url(#grad-berry)]",
  grape: "[&_*]:!fill-[url(#grad-grape)]",
  mango: "[&_*]:!fill-[url(#grad-mango)]",
  slate: "[&_*]:!fill-[url(#grad-slate)]",
};

export function resolveNavIconGradient(color?: NavColor): string {
  if (!color || !NAV_COLOR_ICON_GRADIENT_MAP[color]) {
    return "[&_*]:!fill-[url(#grad-primary)]";
  }
  return NAV_COLOR_ICON_GRADIENT_MAP[color]!;
}

export interface NavItem {
  labelKey: string;
  href: string;
  icon?: PhosphorIcon;
  /** Optional semantic color token for this nav item. */
  color?: NavColor;
  public?: boolean;
  free?: boolean;
}

/**
 * A logical group of navigation items rendered as a titled section/card grid.
 * - id       : stable identifier, also used as a React key.
 * - labelKey : i18n key resolved under `Menu.sections.*`.
 * - icon     : section icon.
 * - color    : optional default color for all items in this group (can be
 *              overridden per-item).
 * - items    : leaf items belonging to this group.
 */
export interface NavGroup {
  id: string;
  labelKey: string;
  icon?: PhosphorIcon;
  /** Default color applied to items that don't specify their own color. */
  color?: NavColor;
  items: NavItem[];
  custom?: "Cpu";
}

export const NAVIGATION: NavGroup[] = [
  {
    id: "marketing",
    labelKey: "marketing",
    icon: SpeakerHifi,
    color: "rose",
    items: [
      {
        labelKey: "campaigns",
        href: "/marketing/campaigns",
        icon: SpeakerHifi,
        color: "rose",
      },
      {
        labelKey: "social",
        href: "/marketing/social",
        icon: ShareNetwork,
        color: "pink",
      },
      {
        labelKey: "email",
        href: "/marketing/email",
        icon: PaperPlaneTilt,
        color: "fuchsia",
      },
      {
        labelKey: "analytics",
        href: "/marketing/analytics",
        icon: ChartPolar,
        color: "purple",
      },
    ],
  },
  {
    id: "projectManagement",
    labelKey: "projectManagement",
    icon: Kanban,
    color: "amber",
    items: [
      {
        labelKey: "projects",
        href: "/projects",
        icon: Kanban,
        color: "blue",
      },
      {
        labelKey: "tasks",
        href: "/projects/tasks",
        icon: ListChecks,
        color: "sky",
      },
      {
        labelKey: "calendar",
        href: "/projects/calendar",
        icon: Calendar,
        color: "cyan",
      },
      {
        labelKey: "reports",
        href: "/projects/reports",
        icon: PresentationChart,
        color: "teal",
      },
      {
        labelKey: "board",
        href: "/projects/board",
        icon: GridFour,
        color: "emerald",
      },
    ],
  },
  {
    id: "documentArchive",
    labelKey: "documentArchive",
    icon: Archive,
    color: "teal",
    items: [
      {
        labelKey: "documents",
        href: "/archive/documents",
        icon: Files,
        color: "green",
      },
      {
        labelKey: "contracts",
        href: "/archive/contracts",
        icon: PenNib,
        color: "lime",
      },
      {
        labelKey: "invoices",
        href: "/archive/invoices",
        icon: Invoice,
        color: "yellow",
      },
      {
        labelKey: "letters",
        href: "/archive/letters",
        icon: Article,
        color: "amber",
      },
    ],
  },
  {
    id: "employees",
    labelKey: "employees",
    icon: UsersThree,
    color: "violet",
    items: [
      { labelKey: "staff", href: "/employees", icon: UsersThree, color: "orange" },
      {
        labelKey: "departments",
        href: "/employees/departments",
        icon: Buildings,
        color: "red",
      },
      {
        labelKey: "attendance",
        href: "/employees/attendance",
        icon: Fingerprint,
        color: "sunset",
      },
      {
        labelKey: "payroll",
        href: "/employees/payroll",
        icon: PiggyBank,
        color: "ocean",
      },
    ],
  },
  {
    id: "multimedia",
    labelKey: "multimedia",
    icon: PlayCircle,
    color: "orange",
    items: [
      {
        labelKey: "imageGallery",
        href: "/media/images",
        icon: Images,
        color: "forest",
        public: true,
        free: true,
      },
      {
        labelKey: "videos",
        href: "/aparat",
        icon: VideoCamera,
        color: "berry",
        public: true,
        free: true,
      },
      {
        labelKey: "audio",
        href: "/media/audio",
        icon: Headphones,
        color: "grape",
        public: true,
        free: true,
      },
      {
        labelKey: "mediaLibrary",
        href: "/media/BookOpenText",
        icon: BookOpenText,
        color: "mango",
        public: true,
        free: false,
      },
    ],
  },
  {
    id: "engineering",
    labelKey: "engineering",
    icon: Cpu,
    color: "slate",
    items: [
      {
        labelKey: "ESP-Flow",
        href: "/ESP-Flow",
        icon: GridFour,
        color: "violet",
        public: true,
        free: false,
      },
      {
        labelKey: "Weight-Flow",
        href: "/Weight-Flow",
        icon: GridFour,
        color: "indigo",
        public: true,
        free: false,
      },
    ],
  },
];

/** Primary navigation derived from the `main` group (top bar). */
export const PRIMARY_NAV: NavItem[] =
  NAVIGATION.find((group) => group.id === "main")?.items ?? [];

/** All items flagged as public (visible without authentication). */
export const PUBLIC_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) =>
  group.items.filter((item) => item.public),
);
