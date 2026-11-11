"use client";

import { useAdminContext } from "../context/AdminContext";

/**
 * Hook to access the Admin Context.
 * Must be called inside a component wrapped by AdminProvider.
 */
export function useAdmin() {
  return useAdminContext();
}
