// Public API for Admin Module
export { AdminLayout } from "./components/AdminLayout";
export { AdminSidebar, ADMIN_NAV_ITEMS } from "./components/AdminSidebar";
export { AdminHeader } from "./components/AdminHeader";
export { AdminDashboard } from "./components/AdminDashboard";

// Section Components
export { AdminOverviewSection } from "./components/sections/AdminOverviewSection";
export { AdminUsersSection } from "./components/sections/AdminUsersSection";
export { AdminConfigSection } from "./components/sections/AdminConfigSection";
export { AdminRequestsSection } from "./components/sections/AdminRequestsSection";
export { AdminModuleRequestsSection } from "./components/sections/AdminModuleRequestsSection";
export { AdminAuditLogsSection } from "./components/sections/AdminAuditLogsSection";
export { AdminSettingsSection } from "./components/sections/AdminSettingsSection";

// Context & Hook
export {
  AdminProvider,
  useAdminContext,
  ADMIN_TAB_ROUTES,
  type AdminTab,
  type AdminContextValue,
} from "./context/AdminContext";
export { useAdmin } from "./hooks/useAdmin";

// Types
export * from "./types/admin.types";
