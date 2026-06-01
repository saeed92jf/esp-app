// src/config/navigation.ts
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  LayoutDashboard,
  Megaphone,
  Share2,
  Mail,
  BarChart3,
  Search,
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
} from 'lucide-react';

// A single clickable link inside a group.
export interface NavItem {
  // i18n key resolved against the "Menu.items" namespace.
  labelKey: string;
  // App-relative href (no /[locale] prefix; navigation helper adds it).
  href: string;
  // Optional icon shown before the label.
  icon?: LucideIcon;
}

// A titled, collapsible section in the SideMenu.
export interface NavGroup {
  // Stable id used as the Accordion item value + defaultOpen logic.
  id: string;
  // i18n key resolved against the "Menu.sections" namespace.
  labelKey: string;
  icon?: LucideIcon;
  items: NavItem[];
}

// Full navigation tree. Order here is the render order in the menu.
export const NAVIGATION: NavGroup[] = [
  {
    id: 'main',
    labelKey: 'main',
    icon: Home,
    items: [
      { labelKey: 'home', href: '/', icon: Home },
      { labelKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'marketing',
    labelKey: 'marketing',
    icon: Megaphone,
    items: [
      { labelKey: 'campaigns', href: '/marketing/campaigns', icon: Megaphone },
      { labelKey: 'socialMedia', href: '/marketing/social', icon: Share2 },
      { labelKey: 'emailMarketing', href: '/marketing/email', icon: Mail },
      {
        labelKey: 'marketingAnalytics',
        href: '/marketing/analytics',
        icon: BarChart3,
      },
      { labelKey: 'seo', href: '/marketing/seo', icon: Search },
    ],
  },
  {
    id: 'projectManagement',
    labelKey: 'projectManagement',
    icon: FolderKanban,
    items: [
      { labelKey: 'projects', href: '/projects', icon: FolderKanban },
      { labelKey: 'tasks', href: '/projects/tasks', icon: ListChecks },
      { labelKey: 'calendar', href: '/projects/calendar', icon: Calendar },
      {
        labelKey: 'projectReports',
        href: '/projects/reports',
        icon: FileBarChart,
      },
      { labelKey: 'kanban', href: '/projects/kanban', icon: LayoutGrid },
    ],
  },
  {
    id: 'documentArchive',
    labelKey: 'documentArchive',
    icon: Archive,
    items: [
      { labelKey: 'allDocuments', href: '/documents', icon: Files },
      {
        labelKey: 'contracts',
        href: '/documents/contracts',
        icon: FileSignature,
      },
      { labelKey: 'invoices', href: '/documents/invoices', icon: Receipt },
      { labelKey: 'templates', href: '/documents/templates', icon: FileText },
    ],
  },
  {
    id: 'employees',
    labelKey: 'employees',
    icon: Users,
    items: [
      { labelKey: 'employeeList', href: '/employees', icon: Users },
      {
        labelKey: 'departments',
        href: '/employees/departments',
        icon: Building2,
      },
      {
        labelKey: 'attendance',
        href: '/employees/attendance',
        icon: CalendarCheck,
      },
      { labelKey: 'payroll', href: '/employees/payroll', icon: Wallet },
    ],
  },
  {
    id: 'multimedia',
    labelKey: 'multimedia',
    icon: Clapperboard,
    items: [
      { labelKey: 'imageGallery', href: '/media/images', icon: ImageIcon },
      { labelKey: 'videos', href: '/media/videos', icon: Video },
      { labelKey: 'audio', href: '/media/audio', icon: AudioLines },
      { labelKey: 'mediaLibrary', href: '/media/library', icon: Library },
    ],
  },
];

// Top-level links surfaced inline in the desktop Header.
// Derived from the "main" group so there is one source of truth.
export const PRIMARY_NAV: NavItem[] =
  NAVIGATION.find((g) => g.id === 'main')?.items ?? [];
