"use client";

import React, { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AdminSidebar } from "./AdminSidebar";
import { useAdmin } from "../hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ServerConnectionError,
} from "@/components/ui/server-connection-error";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { usePathname } from "@/i18n/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

const tabMotionVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.14,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    loading,
    users,
    requests,
    connectionError,
    setConnectionError,
    fetchData,
    isRetrying,
    activeTab,
    navigateToTab,
  } = useAdmin();

  return (
    <div className="flex flex-col flex-1 min-h-full bg-background font-sans w-full relative">
      {/* Top Header */}
      <AppHeader
        tag="Admin"
        onToggleMenu={() => setSidebarOpen((prev) => !prev)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Sidebar Navigation */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={navigateToTab}
          currentUser={currentUser}
        />

        {/* Main Content Area */}
        <div className="flex-1 bg-transparent w-full relative z-10 p-2.5 sm:p-3.5 lg:p-4 xl:p-5 flex flex-col min-h-0">
          <AnimatePresence initial={false}>
            {loading && users.length === 0 && requests.length === 0 ? (
              <motion.div
                key="admin-loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr] 2xl:grid-cols-[360px_1fr] gap-3 w-full max-w-[1600px] mx-auto items-stretch pb-6 min-h-full"
              >
                <Skeleton className="col-span-1 h-[650px] w-full rounded-[1.5rem] opacity-40 bg-muted/50" />
                <Skeleton className="col-span-1 h-[650px] w-full rounded-[1.5rem] opacity-40 bg-muted/50" />
              </motion.div>
            ) : connectionError && users.length === 0 && requests.length === 0 ? (
              <ServerConnectionError
                key="server-connection-error-full"
                error={connectionError}
                onRetry={fetchData}
                isRetrying={isRetrying}
                targetUrl={BACKEND_URL}
                variant="full"
              />
            ) : (
              <motion.div
                key={pathname}
                variants={tabMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full min-h-full flex flex-col flex-1"
              >
                {connectionError && (
                  <ServerConnectionError
                    error={connectionError}
                    onRetry={fetchData}
                    isRetrying={isRetrying}
                    targetUrl={BACKEND_URL}
                    variant="banner"
                    className="mb-4"
                    onDismiss={() => setConnectionError(null)}
                  />
                )}
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
