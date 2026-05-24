import React from "react";
import { ChannelHeaderProps } from "@/types";
import Image from "next/image";

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel }) => {
  return (
    <div className="relative bg-linear-to-r from-primary-600 to-info-600 rounded-xl overflow-hidden shadow-lg">
      {/* Cover Image */}
      {channel.cover_src && (
        <div className="absolute inset-0">
          <img
            src={channel.cover_src}
            alt="Cover"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
        {/* Avatar */}
        <div className="shrink-0">
          {channel.pic_b || channel.pic_m || channel.pic_s ? (
            <img
              src={channel.pic_b || channel.pic_m || channel.pic_s}
              alt={channel.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-linear-to-br from-primary-400 to-info-400 flex items-center justify-center text-4xl">
              📺
            </div>
          )}
        </div>
        
        {/* Channel Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {channel.name}
          </h1>
          <p className="text-primary-200 mt-1">@{channel.username}</p>
          {channel.descr && (
            <p className="text-white/80 mt-2 max-w-2xl text-sm leading-relaxed">
              {channel.descr}
            </p>
          )}
          {channel.official === "yes" && (
            <span className="inline-block mt-2 px-2 py-1 bg-warning-500 text-warning-900 text-xs font-semibold rounded-full shadow-sm">
              ✓ Official Channel
            </span>
          )}
        </div>
        
        {/* Channel Link */}
        {channel.url && (
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-all duration-fast hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Channel
          </a>
        )}
      </div>
    </div>
  );
};