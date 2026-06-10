// src/config/navigation.ts
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

export interface NavItem {
  labelKey: string;
  href: string;
  icon?: LucideIcon;
  public?: boolean;
  welcome?: boolean;
}

/**
 * A logical group of navigation items rendered as a titled section/card grid.
 * - id       : stable identifier, also used as a React key.
 * - labelKey : i18n key resolved under `Menu.sections.*`.
 * - icon     : section icon.
 * - items    : leaf items belonging to this group.
 */
export interface NavGroup {
  id: string;
  labelKey: string;
  icon?: LucideIcon;
  items: NavItem[];
  custom?: "settings";
}

/**
 * Full application navigation tree.
 * Grouping + sub-items are preserved exactly; only the `multimedia`
 * group exposes public/welcome items.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: "main",
    labelKey: "main",
    icon: Home,
    items: [
      { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "marketing",
    labelKey: "marketing",
    icon: Megaphone,
    items: [
      { labelKey: "campaigns", href: "/marketing/campaigns", icon: Megaphone },
      { labelKey: "social", href: "/marketing/social", icon: Share2 },
      { labelKey: "email", href: "/marketing/email", icon: Mail },
      { labelKey: "analytics", href: "/marketing/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "projectManagement",
    labelKey: "projectManagement",
    icon: FolderKanban,
    items: [
      { labelKey: "projects", href: "/projects", icon: FolderKanban },
      { labelKey: "tasks", href: "/projects/tasks", icon: ListChecks },
      { labelKey: "calendar", href: "/projects/calendar", icon: Calendar },
      { labelKey: "reports", href: "/projects/reports", icon: FileBarChart },
      { labelKey: "board", href: "/projects/board", icon: LayoutGrid },
    ],
  },
  {
    id: "documentArchive",
    labelKey: "documentArchive",
    icon: Archive,
    items: [
      { labelKey: "documents", href: "/archive/documents", icon: Files },
      {
        labelKey: "contracts",
        href: "/archive/contracts",
        icon: FileSignature,
      },
      { labelKey: "invoices", href: "/archive/invoices", icon: Receipt },
      { labelKey: "letters", href: "/archive/letters", icon: FileText },
    ],
  },
  {
    id: "employees",
    labelKey: "employees",
    icon: Users,
    items: [
      { labelKey: "staff", href: "/employees", icon: Users },
      {
        labelKey: "departments",
        href: "/employees/departments",
        icon: Building2,
      },
      {
        labelKey: "attendance",
        href: "/employees/attendance",
        icon: CalendarCheck,
      },
      { labelKey: "payroll", href: "/employees/payroll", icon: Wallet },
    ],
  },
  {
    id: "multimedia",
    labelKey: "multimedia",
    icon: Clapperboard,
    items: [
      {
        labelKey: "imageGallery",
        href: "/media/images",
        icon: ImageIcon,
        public: true,
        welcome: true,
      },
      {
        labelKey: "videos",
        href: "/aparat",
        icon: Video,
        public: true,
        welcome: true,
      },
      {
        labelKey: "audio",
        href: "/media/audio",
        icon: AudioLines,
        public: true,
        welcome: true,
      },
      {
        labelKey: "mediaLibrary",
        href: "/media/library",
        icon: Library,
        public: true,
        welcome: true,
      },
    ],
  },
  {
    id: "settings",
    labelKey: "settings",
    icon: Settings,
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
