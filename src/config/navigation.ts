import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  Megaphone,
  Share2,
  Mail,
  BarChart3,
  FolderKanban,
  ListChecks,
  Calendar,
  FileBarChart,
  LayoutGrid,
  Archive,
  Files,
  FileSignature,
  Receipt,
  FileText,
  Users,
  Building2,
  CalendarCheck,
  Wallet,
  Clapperboard,
  Image as ImageIcon,
  Video,
  AudioLines,
  Library,
  Settings,
} from "lucide-react";

/**
 * Semantic color tokens for navigation items and groups.
 * Using tokens (not raw Tailwind classes) keeps the config
 * framework-agnostic and avoids Tailwind purge issues.
 * Consumers map these tokens to actual classes as needed.
 */
export type NavColor =
  | "sky"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "orange"
  | "cyan"
  | "pink"
  | "indigo"
  | "teal"
  | "slate";

export const NAV_COLOR_MAP: Record<
  NavColor,
  {
    icon: string; // icon color (normal)
    iconHover: string; // icon color (hover) → white
    iconBg: string; // icon bg: muted → colored
    bg: string; // card bg: transparent → tinted
    ring: string; // card border tint on hover
    hover: string; // (QuickAccessCard use)
  }
> = {
  sky: {
    icon: "text-sky-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-sky-500",
    bg: "group-hover:bg-sky-200/10",
    ring: "group-hover:border-sky-500/40",
    hover: "group-hover:bg-sky-500/10",
  },
  violet: {
    icon: "text-violet-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-violet-500",
    bg: "group-hover:bg-violet-200/10",
    ring: "group-hover:border-violet-500/40",
    hover: "group-hover:bg-violet-500/10",
  },
  rose: {
    icon: "text-rose-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-rose-500",
    bg: "group-hover:bg-rose-200/10",
    ring: "group-hover:border-rose-500/40",
    hover: "group-hover:bg-rose-500/10",
  },
  amber: {
    icon: "text-amber-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-amber-500",
    bg: "group-hover:bg-amber-200/10",
    ring: "group-hover:border-amber-500/40",
    hover: "group-hover:bg-amber-500/10",
  },
  emerald: {
    icon: "text-emerald-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-emerald-500",
    bg: "group-hover:bg-emerald-200/10",
    ring: "group-hover:border-emerald-500/40",
    hover: "group-hover:bg-emerald-500/10",
  },
  orange: {
    icon: "text-orange-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-orange-500",
    bg: "group-hover:bg-orange-200/10",
    ring: "group-hover:border-orange-500/40",
    hover: "group-hover:bg-orange-500/10",
  },
  cyan: {
    icon: "text-cyan-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-cyan-500",
    bg: "group-hover:bg-cyan-200/10",
    ring: "group-hover:border-cyan-500/40",
    hover: "group-hover:bg-cyan-500/10",
  },
  pink: {
    icon: "text-pink-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-pink-500",
    bg: "group-hover:bg-pink-200/10",
    ring: "group-hover:border-pink-500/40",
    hover: "group-hover:bg-pink-500/10",
  },
  indigo: {
    icon: "text-indigo-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-indigo-500",
    bg: "group-hover:bg-indigo-200/10",
    ring: "group-hover:border-indigo-500/40",
    hover: "group-hover:bg-indigo-500/10",
  },
  teal: {
    icon: "text-teal-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-teal-500",
    bg: "group-hover:bg-teal-200/10",
    ring: "group-hover:border-teal-500/40",
    hover: "group-hover:bg-teal-500/10",
  },
  slate: {
    icon: "text-slate-500",
    iconHover: "group-hover:text-white",
    iconBg: "bg-muted group-hover:bg-slate-500",
    bg: "group-hover:bg-slate-200/10",
    ring: "group-hover:border-slate-500/40",
    hover: "group-hover:bg-slate-500/10",
  },
};

export interface NavItem {
  labelKey: string;
  href: string;
  icon?: LucideIcon;
  /** Optional semantic color token for this nav item. */
  color?: NavColor;
  public?: boolean;
  welcome?: boolean;
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
  icon?: LucideIcon;
  /** Default color applied to items that don't specify their own color. */
  color?: NavColor;
  items: NavItem[];
  custom?: "settings";
}

export const NAVIGATION: NavGroup[] = [
  {
    id: "main",
    labelKey: "main",
    icon: Home,
    color: "sky",
    items: [
      {
        labelKey: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        color: "sky",
      },
    ],
  },
  {
    id: "marketing",
    labelKey: "marketing",
    icon: Megaphone,
    color: "rose",
    items: [
      {
        labelKey: "campaigns",
        href: "/marketing/campaigns",
        icon: Megaphone,
        color: "rose",
      },
      {
        labelKey: "social",
        href: "/marketing/social",
        icon: Share2,
        color: "pink",
      },
      {
        labelKey: "email",
        href: "/marketing/email",
        icon: Mail,
        color: "violet",
      },
      {
        labelKey: "analytics",
        href: "/marketing/analytics",
        icon: BarChart3,
        color: "indigo",
      },
    ],
  },
  {
    id: "projectManagement",
    labelKey: "projectManagement",
    icon: FolderKanban,
    color: "amber",
    items: [
      {
        labelKey: "projects",
        href: "/projects",
        icon: FolderKanban,
        color: "amber",
      },
      {
        labelKey: "tasks",
        href: "/projects/tasks",
        icon: ListChecks,
        color: "orange",
      },
      {
        labelKey: "calendar",
        href: "/projects/calendar",
        icon: Calendar,
        color: "emerald",
      },
      {
        labelKey: "reports",
        href: "/projects/reports",
        icon: FileBarChart,
        color: "teal",
      },
      {
        labelKey: "board",
        href: "/projects/board",
        icon: LayoutGrid,
        color: "cyan",
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
        color: "teal",
      },
      {
        labelKey: "contracts",
        href: "/archive/contracts",
        icon: FileSignature,
        color: "emerald",
      },
      {
        labelKey: "invoices",
        href: "/archive/invoices",
        icon: Receipt,
        color: "amber",
      },
      {
        labelKey: "letters",
        href: "/archive/letters",
        icon: FileText,
        color: "sky",
      },
    ],
  },
  {
    id: "employees",
    labelKey: "employees",
    icon: Users,
    color: "violet",
    items: [
      { labelKey: "staff", href: "/employees", icon: Users, color: "violet" },
      {
        labelKey: "departments",
        href: "/employees/departments",
        icon: Building2,
        color: "indigo",
      },
      {
        labelKey: "attendance",
        href: "/employees/attendance",
        icon: CalendarCheck,
        color: "cyan",
      },
      {
        labelKey: "payroll",
        href: "/employees/payroll",
        icon: Wallet,
        color: "emerald",
      },
    ],
  },
  {
    id: "multimedia",
    labelKey: "multimedia",
    icon: Clapperboard,
    color: "orange",
    items: [
      {
        labelKey: "imageGallery",
        href: "/media/images",
        icon: ImageIcon,
        color: "orange",
        public: true,
        welcome: true,
      },
      {
        labelKey: "videos",
        href: "/aparat",
        icon: Video,
        color: "rose",
        public: true,
        welcome: true,
      },
      {
        labelKey: "audio",
        href: "/media/audio",
        icon: AudioLines,
        color: "violet",
        public: true,
        welcome: true,
      },
      {
        labelKey: "mediaLibrary",
        href: "/media/library",
        icon: Library,
        color: "amber",
        public: true,
        welcome: true,
      },
    ],
  },
  {
    id: "settings",
    labelKey: "settings",
    icon: Settings,
    color: "slate",
    custom: "settings",
    items: [],
  },
];

/** Primary navigation derived from the `main` group (top bar). */
export const PRIMARY_NAV: NavItem[] =
  NAVIGATION.find((group) => group.id === "main")?.items ?? [];

/** All items flagged as public (visible without authentication). */
export const PUBLIC_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) =>
  group.items.filter((item) => item.public),
);

/** Items rendered on the Welcome screen for unauthenticated visitors. */
export const PUBLIC_WELCOME_ITEMS: NavItem[] = NAVIGATION.flatMap((group) =>
  group.items.filter((item) => item.welcome),
);
