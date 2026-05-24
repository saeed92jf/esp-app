import React from "react";
import { ChannelStatsProps } from "@/types";

export const ChannelStats: React.FC<ChannelStatsProps> = ({
  videoCount,
  followerCount,
  followedCount,
  official,
}) => {
  const stats = [
    {
      label: "Videos",
      value: videoCount.toLocaleString(),
      icon: "🎬",
      color: "text-primary-500",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
    },
    {
      label: "Followers",
      value: followerCount.toLocaleString(),
      icon: "👥",
      color: "text-success-500",
      bgColor: "bg-success-50 dark:bg-success-900/20",
    },
    {
      label: "Following",
      value: followedCount.toLocaleString(),
      icon: "➕",
      color: "text-info-500",
      bgColor: "bg-info-50 dark:bg-info-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.bgColor} text-2xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-tertiary font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};