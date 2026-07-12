// src/lib/fake-dashboard.ts

export type Trend = "up" | "down" | "neutral";
export type IconName =
  | "users"
  | "wallet"
  | "package"
  | "activity"
  | "wrench"
  | "check"
  | "clock"
  | "file"
  | "message";

export interface StatCard {
  id: string;
  labelKey: string;
  value: string;
  delta: string;
  trend: Trend;
  icon: IconName;
}

export interface ChartPoint {
  labelKey: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  titleKey: string;
  timeKey: "minutes" | "hours" | "days";
  count: number;
  status: "success" | "pending" | "error";
}

export interface DashboardData {
  stats: StatCard[];
  chart: ChartPoint[];
  activities: ActivityItem[];
}
