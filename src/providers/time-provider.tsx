"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const TimeContext = createContext<number>(Date.now());

/**
 * Global time provider.
 * Updates current timestamp every minute so relative time
 * components can re-render without each having its own timer.
 */
export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    /**
     * Update every minute to keep relative times fresh.
     * Using one global interval prevents performance issues
     * when rendering large video lists.
     */
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return <TimeContext.Provider value={now}>{children}</TimeContext.Provider>;
}

export function useNow() {
  return useContext(TimeContext);
}
