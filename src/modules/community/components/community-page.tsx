"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { formatPersonName } from "@/lib/person-names";
import { communityService } from "../services/community.service";
import type {
  CommunityPost,
  CommunityReply,
  CommunityAttachment,
  CommunitySortOption,
} from "../types/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  MessageSquare,
  Megaphone,
  Wrench,
  CheckCircle2,
  Coffee,
  Search,
  Plus,
  Paperclip,
  Send,
  Pin,
  FileText,
  Download,
  X,
  Loader2,
  AlertCircle,
  LogIn,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check,
  Tag,
  Code,
  Eye,
  Clock,
  Flame,
  Radio,
  HelpCircle,
  Award,
  Layers,
  Home,
  Settings,
} from "lucide-react";

interface CategoryItem {
  id: string;
  labelKey: string;
  labelEn: string;
  labelFa: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { id: "all", labelKey: "all", labelEn: "All Topics", labelFa: "همه موضوعات", icon: MessageSquare },
  { id: "engineering", labelKey: "engineering", labelEn: "Engineering", labelFa: "فنی و مهندسی", icon: Wrench },
  { id: "quality", labelKey: "quality", labelEn: "Quality & QC", labelFa: "کنترل کیفیت", icon: CheckCircle2 },
  { id: "announcements", labelKey: "announcements", labelEn: "Announcements", labelFa: "اطلاعیه‌ها", icon: Megaphone },
  { id: "general", labelKey: "general", labelEn: "General", labelFa: "عمومی و متفرقه", icon: Coffee },
];


function getRoleBadge(role?: string, isRtl = false) {
  const r = (role || "").toLowerCase();
  if (r === "superadmin") {
    return {
      label: isRtl ? "مدیر ارشد" : "Super Admin",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }
  if (r === "admin") {
    return {
      label: isRtl ? "مدیر سیستم" : "Admin",
      className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    };
  }
  if (r === "engineer") {
    return {
      label: isRtl ? "کارشناس مهندسی" : "Engineer",
      className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    };
  }
  if (r === "manager") {
    return {
      label: isRtl ? "مدیر واحد" : "Manager",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  return {
    label: isRtl ? "پرسنل" : "Staff",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  };
}

function UserAvatar({
  name,
  nameFa,
  nameEn,
  avatar,
  avatarColor,
  avatarMode,
  size = "md",
  isRtl = false,
}: {
  name?: string;
  nameFa?: string;
  nameEn?: string;
  avatar?: string | null;
  avatarColor?: string;
  avatarMode?: string;
  size?: "sm" | "md" | "lg";
  isRtl?: boolean;
}) {
  const rawCandidate = nameFa || name || nameEn || "";
  const chosenName = rawCandidate
    ? formatPersonName(rawCandidate, isRtl ? "fa" : "en")
    : (isRtl ? "کاربر" : "User");

  const initial = (chosenName.trim().charAt(0) || (isRtl ? "ک" : "U")).toUpperCase();

  const hasPhoto = Boolean(
    avatarMode !== "initials" &&
    avatar &&
    typeof avatar === "string" &&
    avatar.trim() !== "" &&
    !avatar.includes("unsplash.com") &&
    !avatar.includes("/team/")
  );

  const sizeClass =
    size === "sm"
      ? "size-6 text-[10px]"
      : size === "lg"
      ? "size-11 text-sm"
      : "size-8 text-xs";

  return (
    <Avatar className={cn(sizeClass, "border border-border/60 shrink-0 font-semibold select-none overflow-hidden")}>
      {hasPhoto && (
        <AvatarImage
          src={avatar!}
          alt={chosenName}
          className="size-full object-cover"
        />
      )}
      <AvatarFallback
        style={{ backgroundColor: avatarColor || "#0284c7", color: "#ffffff" }}
        className="size-full flex items-center justify-center font-bold text-white transition-colors"
      >
        <span className={cn(isRtl && "-translate-y-0.5")}>{initial}</span>
      </AvatarFallback>
    </Avatar>
  );
}

export function CommunityPage() {
  const t = useTranslations("Community");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();
  const isAuthenticated = Boolean(user && user.id);

  const rawCurrent = user?.fullNameFa || user?.name || user?.fullName || "";
  const currentUserName = rawCurrent
    ? formatPersonName(rawCurrent, locale)
    : (isRtl ? "کاربر" : "User");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Role check and Community Navigation state
  const isAdmin = Boolean(user && (user.role === "superadmin" || user.role === "admin"));
  const [activeNav, setActiveNav] = useState<"home" | "settings">("home");

  useEffect(() => {
    if (!isAdmin && activeNav === "settings") {
      setActiveNav("home");
    }
  }, [isAdmin, activeNav]);

  const communityNavItems = [
    {
      id: "home" as const,
      labelFa: "صفحه اصلی",
      labelEn: "Home",
      icon: Home,
    },
    ...(isAdmin
      ? [
          {
            id: "settings" as const,
            labelFa: "تنظیمات",
            labelEn: "Settings",
            icon: Settings,
          },
        ]
      : []),
  ];
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<CommunitySortOption>("newest");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Auto-Sync state
  const [lastActivity, setLastActivity] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef(false);

  // New Post Form State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("engineering");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [postAttachments, setPostAttachments] = useState<CommunityAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded Replies Thread state (postId -> replies array)
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [threadReplies, setThreadReplies] = useState<Record<string, CommunityReply[]>>({});
  const [loadingThreads, setLoadingThreads] = useState<Record<string, boolean>>({});

  // Active reply inputs per post (postId -> text)
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyAttachments, setReplyAttachments] = useState<Record<string, CommunityAttachment[]>>({});
  const [replySubmitting, setReplySubmitting] = useState<Record<string, boolean>>({});

  // Dynamic Popular Tags State (Genuinely computed from real posts in database)
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);

  const fetchPopularTags = useCallback(async () => {
    try {
      const serverTags = await communityService.getPopularTags(20);
      if (serverTags && serverTags.length > 0) {
        setPopularTags(serverTags);
        return;
      }
    } catch {}

    // Fallback: derive dynamically from current real posts
    const counts = new Map<string, number>();
    for (const post of posts) {
      if (Array.isArray(post.tags)) {
        for (const t of post.tags) {
          const clean = String(t).trim();
          if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
        }
      }
    }
    const derived = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
    setPopularTags(derived);
  }, [posts]);

  useEffect(() => {
    fetchPopularTags();
  }, [posts, fetchPopularTags]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);

  // Load posts from Real API
  const fetchPosts = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const data = await communityService.getPosts(
          activeCategory,
          searchQuery,
          activeTag || undefined,
          activeSort
        );
        // Ensure pinned posts are strictly placed at the very top of all views
        const sortedData = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setPosts(sortedData);
      } catch (err: any) {
        if (!silent) {
          console.error("Failed to fetch community posts:", err);
          toast.error(err.message || (isRtl ? "خطا در دریافت گفتگوها" : "Failed to load discussions"));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [activeCategory, searchQuery, activeTag, activeSort, isRtl]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Background Real-Time Auto-Sync Engine (No manual refresh required) ──
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const performSync = async () => {
      if (document.visibilityState === "hidden" || isSyncingRef.current) return;

      try {
        isSyncingRef.current = true;
        setIsSyncing(true);

        const status = await communityService.syncStatus();
        if (status.latestActivity && status.latestActivity !== lastActivity) {
          setLastActivity(status.latestActivity);
          // Silently fetch updated posts without full screen loader
          await fetchPosts(true);

          // If any threads are currently expanded, refresh their replies silently
          const expandedIds = Object.keys(expandedThreads).filter((id) => expandedThreads[id]);
          if (expandedIds.length > 0) {
            for (const postId of expandedIds) {
              try {
                const detail = await communityService.getPostDetail(postId);
                setThreadReplies((prev) => ({
                  ...prev,
                  [postId]: detail.replies || [],
                }));
              } catch {
                // Ignore individual thread refresh failures during background sync
              }
            }
          }
        }
      } catch {
        // Silent catch for background polling
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
      }
    };

    // Run polling every 3.5 seconds
    timer = setInterval(performSync, 3500);

    // Also trigger immediately on visibility change (when user returns to this tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performSync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lastActivity, fetchPosts, expandedThreads]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  // Tag helper
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#+/, "");
    if (!clean) return;
    if (!postTags.includes(clean)) {
      setPostTags([...postTags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostTags(postTags.filter((t) => t !== tagToRemove));
  };

  // Upload file for new post (enforces authentication)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast.error(isRtl ? "برای پیوست فایل باید وارد حساب کاربری خود شوید." : "Please sign in to attach files.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRtl ? "حداکثر حجم فایل ۱۰ مگابایت است" : "Maximum file size is 10 MB");
      return;
    }

    try {
      setIsUploading(true);
      const att = await communityService.uploadAttachment(file);
      setPostAttachments((prev) => [...prev, att]);
      toast.success(isRtl ? "فایل با موفقیت پیوست شد" : "File attached successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در آپلود فایل" : "Failed to upload file"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Upload file for a reply
  const handleReplyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast.error(isRtl ? "برای پیوست فایل باید وارد حساب کاربری خود شوید." : "Please sign in to attach files.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file || !activeReplyPostId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRtl ? "حداکثر حجم فایل ۱۰ مگابایت است" : "Maximum file size is 10 MB");
      return;
    }

    try {
      setIsUploading(true);
      const att = await communityService.uploadAttachment(file);
      setReplyAttachments((prev) => ({
        ...prev,
        [activeReplyPostId]: [...(prev[activeReplyPostId] || []), att],
      }));
      toast.success(isRtl ? "فایل پیوست شد" : "File attached successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در آپلود فایل" : "Failed to upload file"));
    } finally {
      setIsUploading(false);
      if (replyFileInputRef.current) replyFileInputRef.current.value = "";
      setActiveReplyPostId(null);
    }
  };

  // Submit new post (strictly by real authenticated user)
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error(isRtl ? "برای ایجاد گفتگوی جدید، لطفاً ابتدا وارد حساب کاربری خود شوید." : "Please log in to start a discussion.");
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      toast.error(isRtl ? "لطفاً عنوان و متن پرسش را وارد کنید" : "Please enter title and content");
      return;
    }

    try {
      setIsSubmitting(true);
      const newPost = await communityService.createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
        tags: postTags,
        authorId: user.id,
        authorEmail: user.email,
        authorName: currentUserName,
        authorNameFa: user.fullNameFa || user.name || user.fullName,
        authorNameEn: user.fullName || user.name || user.fullNameFa,
        authorAvatar: user.avatar,
        attachments: postAttachments,
      });

      setPosts((prev) => [newPost, ...prev]);
      setPostTitle("");
      setPostContent("");
      setPostTags([]);
      setPostAttachments([]);
      setIsComposerOpen(false);
      toast.success(isRtl ? "پرسش فنی شما با موفقیت ثبت شد" : "Question published successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت پیام" : "Failed to publish question"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post (Strictly Admin / Superadmin only)
  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated || !user || (user.role !== "superadmin" && user.role !== "admin")) {
      toast.error(isRtl ? "قابلیت حذف فقط برای مدیران و سوپرادمین‌ها فراهم است." : "Deleting is only available for admins and superadmins.");
      return;
    }
    const confirmMsg = isRtl
      ? "آیا از حذف این پرسش اطمینان دارید؟ تمامی پاسخ‌های مربوط به آن نیز حذف خواهند شد."
      : "Are you sure you want to delete this question and all its replies?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success(isRtl ? "پرسش با موفقیت حذف شد" : "Question deleted successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در حذف پرسش" : "Failed to delete question"));
    }
  };

  // Toggle Pin (Strictly Admin / Superadmin only)
  const handleTogglePin = async (postId: string) => {
    if (!isAuthenticated || !user || (user.role !== "superadmin" && user.role !== "admin")) {
      toast.error(isRtl ? "قابلیت پین کردن فقط برای مدیران و سوپرادمین‌ها فراهم است." : "Pinning is only available for admins and superadmins.");
      return;
    }
    try {
      const res = await communityService.togglePinPost(postId);
      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === postId ? { ...p, pinned: res.pinned } : p
        );
        return [...updated].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      });
      toast.success(
        res.pinned
          ? isRtl
            ? "پرسش با موفقیت پین شد و در صدر قرار گرفت"
            : "Question pinned to top"
          : isRtl
          ? "پین پرسش برداشته شد"
          : "Question unpinned"
      );
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در تغییر وضعیت پین" : "Failed to toggle pin"));
    }
  };

  // Toggle Thread Replies
  const handleToggleThread = async (postId: string) => {
    const isCurrentlyExpanded = !!expandedThreads[postId];
    if (isCurrentlyExpanded) {
      setExpandedThreads((prev) => ({ ...prev, [postId]: false }));
      return;
    }

    setExpandedThreads((prev) => ({ ...prev, [postId]: true }));
    if (!threadReplies[postId]) {
      try {
        setLoadingThreads((prev) => ({ ...prev, [postId]: true }));
        const postDetail = await communityService.getPostDetail(postId);
        setThreadReplies((prev) => ({ ...prev, [postId]: postDetail.replies || [] }));
        if (typeof postDetail.views === "number") {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, views: postDetail.views } : p))
          );
        }
      } catch (err: any) {
        console.error("Failed to load thread:", err);
        toast.error(err.message || (isRtl ? "خطا در دریافت پاسخ‌ها" : "Failed to load replies"));
      } finally {
        setLoadingThreads((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Submit reply (strictly by real authenticated user)
  const handleSubmitReply = async (postId: string) => {
    if (!isAuthenticated || !user) {
      toast.error(isRtl ? "برای ارسال نظر یا پاسخ، ابتدا وارد حساب کاربری خود شوید." : "Please sign in to post a reply.");
      return;
    }

    const text = replyInputs[postId]?.trim();
    if (!text) return;

    try {
      setReplySubmitting((prev) => ({ ...prev, [postId]: true }));
      const newReply = await communityService.addReply(postId, {
        content: text,
        authorId: user.id,
        authorEmail: user.email,
        authorName: currentUserName,
        authorNameFa: user.fullNameFa || user.name || user.fullName,
        authorNameEn: user.fullName || user.name || user.fullNameFa,
        authorAvatar: user.avatar,
        attachments: replyAttachments[postId] || [],
      });

      setThreadReplies((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newReply],
      }));
      setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
      setReplyAttachments((prev) => ({ ...prev, [postId]: [] }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p))
      );
      toast.success(isRtl ? "پاسخ شما با موفقیت ثبت شد" : "Reply added successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ارسال پاسخ" : "Failed to post reply"));
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Delete reply
  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!isAuthenticated) return;
    const confirmMsg = isRtl ? "آیا از حذف این پاسخ اطمینان دارید؟" : "Are you sure you want to delete this reply?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await communityService.deleteReply(postId, replyId);
      setThreadReplies((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((r) => r.id !== replyId),
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, repliesCount: Math.max(0, (p.repliesCount || 1) - 1) } : p))
      );
      toast.success(isRtl ? "پاسخ با موفقیت حذف شد" : "Reply deleted successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در حذف پاسخ" : "Failed to delete reply"));
    }
  };

  // StackOverflow Voting: Post Upvote / Downvote
  const handleVotePost = async (postId: string, direction: "up" | "down") => {
    if (!isAuthenticated || !user) {
      toast.error(isRtl ? "برای ثبت رأی باید وارد حساب کاربری شوید." : "Please log in to vote.");
      return;
    }

    try {
      const res = await communityService.votePost(postId, direction);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const upvotes = p.upvotes || [];
            const downvotes = p.downvotes || [];
            const uid = user.id;

            let nextUp = [...upvotes];
            let nextDown = [...downvotes];

            if (direction === "up") {
              if (nextUp.includes(uid)) {
                nextUp = nextUp.filter((id) => id !== uid);
              } else {
                nextUp.push(uid);
                nextDown = nextDown.filter((id) => id !== uid);
              }
            } else {
              if (nextDown.includes(uid)) {
                nextDown = nextDown.filter((id) => id !== uid);
              } else {
                nextDown.push(uid);
                nextUp = nextUp.filter((id) => id !== uid);
              }
            }

            return {
              ...p,
              score: res.score,
              likes: Math.max(0, res.score),
              upvotes: nextUp,
              downvotes: nextDown,
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت رأی" : "Failed to vote"));
    }
  };

  // StackOverflow Voting: Reply Upvote / Downvote
  const handleVoteReply = async (postId: string, replyId: string, direction: "up" | "down") => {
    if (!isAuthenticated || !user) {
      toast.error(isRtl ? "برای ثبت رأی باید وارد حساب کاربری شوید." : "Please log in to vote.");
      return;
    }

    try {
      const res = await communityService.voteReply(postId, replyId, direction);
      setThreadReplies((prev) => {
        const currentList = prev[postId] || [];
        return {
          ...prev,
          [postId]: currentList.map((r) => {
            if (r.id === replyId) {
              const uid = user.id;
              let nextUp = [...(r.upvotes || [])];
              let nextDown = [...(r.downvotes || [])];

              if (direction === "up") {
                if (nextUp.includes(uid)) {
                  nextUp = nextUp.filter((id) => id !== uid);
                } else {
                  nextUp.push(uid);
                  nextDown = nextDown.filter((id) => id !== uid);
                }
              } else {
                if (nextDown.includes(uid)) {
                  nextDown = nextDown.filter((id) => id !== uid);
                } else {
                  nextDown.push(uid);
                  nextUp = nextUp.filter((id) => id !== uid);
                }
              }

              return {
                ...r,
                score: res.score,
                upvotes: nextUp,
                downvotes: nextDown,
              };
            }
            return r;
          }),
        };
      });
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت رأی پاسخ" : "Failed to vote reply"));
    }
  };

  // StackOverflow Accepted Answer (Mark solution with green checkmark)
  const handleAcceptReply = async (postId: string, replyId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const res = await communityService.acceptReply(postId, replyId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, acceptedReplyId: res.acceptedReplyId } : p))
      );

      setThreadReplies((prev) => {
        const currentList = prev[postId] || [];
        const updated = currentList.map((r) => ({
          ...r,
          isAccepted: r.id === res.acceptedReplyId,
        }));
        // Pinned accepted answer to the very top
        updated.sort((a, b) => {
          if (a.isAccepted) return -1;
          if (b.isAccepted) return 1;
          return (b.score || 0) - (a.score || 0);
        });
        return {
          ...prev,
          [postId]: updated,
        };
      });

      toast.success(
        res.isAccepted
          ? isRtl
            ? "پاسخ به عنوان راه‌حل تایید شد"
            : "Marked as accepted answer"
          : isRtl
          ? "تایید پاسخ برداشته شد"
          : "Unmarked accepted answer"
      );
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت پاسخ تایید شده" : "Failed to accept reply"));
    }
  };

  // Helper to insert code markdown
  const insertCodeSnippet = (postId?: string) => {
    const snippet = "\n```\n// " + (isRtl ? "کد یا مشخصات فنی" : "Technical code or spec") + "\n\n```\n";
    if (postId) {
      setReplyInputs((prev) => ({
        ...prev,
        [postId]: (prev[postId] || "") + snippet,
      }));
    } else {
      setPostContent((prev) => prev + snippet);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── Top Header ── */}
      <AppHeader
        tag="Community"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      >
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs md:max-w-sm ms-2 sm:ms-4">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={isRtl ? "جستجو در پرسش‌ها، پاسخ‌ها و برچسب‌ها..." : "Search Q&A discussions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8.5 rounded-full bg-background/80 hover:bg-muted/70 border border-border/60 ps-8 pe-3 text-xs"
              />
            </div>
          </form>
        </div>
      </AppHeader>

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sticky Sidebar Navigation ── */}
        <aside
          className={cn(
            "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6",
            "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
            sidebarOpen
              ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
          )}
        >
          <TooltipProvider>
            <nav
              className={cn(
                "flex flex-col gap-2.5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
                sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
              )}
            >
              {communityNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      if (item.id === "home") {
                        setActiveCategory("all");
                      }
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}
            </nav>
          </TooltipProvider>
        </aside>

        {/* ── Main Community Content Area ── */}
        <div className="flex-1 bg-transparent w-full relative z-10 p-3 sm:p-6 pb-24 min-h-0 max-w-5xl mx-auto">
          {activeNav === "settings" ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Settings Header Action Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Settings className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {isRtl ? "تنظیمات تالار گفتگو" : "Community Settings"}
                      </h1>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                      >
                        {isRtl ? "ویژه مدیران" : "Admin Only"}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {isRtl
                        ? "مدیریت و پیکربندی اختصاصی بخش تالار گفتگوی تخصصی"
                        : "Dedicated management and configuration for Community discussions"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveNav("home")}
                  className="rounded-full gap-2 text-xs cursor-pointer"
                >
                  <Home className="size-3.5" />
                  <span>{isRtl ? "بازگشت به صفحه اصلی" : "Back to Home"}</span>
                </Button>
              </div>

              {/* Empty placeholder view as requested: و خالیه */}
              <div className="bg-card/40 border border-dashed border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] shadow-xs">
                <div className="size-14 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-3 text-muted-foreground">
                  <Settings className="size-6 stroke-[1.5]" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                  {isRtl ? "تنظیماتی برای نمایش وجود ندارد" : "No Settings Configured"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                  {isRtl
                    ? "این بخش در حال حاضر خالی است."
                    : "This section is currently empty."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header Action Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isRtl ? "تالار گفتگو و پرسش و پاسخ (Q&A)" : "Community & Technical Q&A"}
                </h1>
                {/* 🟢 Live Sync status indicator */}
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                    isSyncing
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted/60 border-border/60 text-muted-foreground"
                  )}
                  title={isRtl ? "همگام‌سازی لحظه‌ای بدون نیاز به رفرش صفحه فعال است" : "Real-time auto-sync is active without page refresh"}
                >
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                  </span>
                  <span>{isRtl ? "همگام‌سازی زنده" : "Live Sync"}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isRtl
                  ? "مرجع تبادل دانش فنی، پاسخ به پرسش‌های مهندسی پمپ‌های ESP و هم‌اندیشی تیم‌های یورواسلات پارس"
                  : "Collaborative engineering exchange, ESP technical Q&A, and inter-team discussions"}
              </p>
            </div>

            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning(
                    isRtl
                      ? "برای طرح پرسش جدید، لطفاً با حساب کاربری خود وارد شوید."
                      : "Please sign in to ask a technical question."
                  );
                  return;
                }
                setIsComposerOpen(!isComposerOpen);
              }}
              className="rounded-full gap-2 shrink-0 cursor-pointer shadow-xs font-medium"
            >
              {isComposerOpen ? <X className="size-4" /> : <Plus className="size-4" />}
              <span>{isComposerOpen ? (isRtl ? "بستن فرم" : "Close") : (isRtl ? "طرح پرسش جدید" : "Ask Question")}</span>
            </Button>
          </div>

          {/* Guest Warning Banner if not logged in */}
          {!isAuthenticated && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {isRtl
                    ? "شما در حالت مشاهده مهمان هستید. برای ایجاد بحث، ثبت نظر، رأی دادن و پیوست فایل‌های مهندسی، با حساب پرسنلی خود وارد شوید."
                    : "You are currently browsing as a guest. Please log in with your verified credentials to ask questions, vote, and post answers."}
                </p>
              </div>
              <Button asChild size="sm" className="rounded-full gap-1.5 shrink-0 text-xs">
                <Link href="/login">
                  <LogIn className="size-3.5" />
                  <span>{isRtl ? "ورود به سیستم" : "Sign In"}</span>
                </Link>
              </Button>
            </div>
          )}

          {/* ── StackOverflow Sorting Tabs & Tag Filter Bar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-card/40 border border-border/50 rounded-xl p-2.5">
            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveSort("newest")}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeSort === "newest"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="size-3.5" />
                <span>{isRtl ? "جدیدترین" : "Newest"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSort("active")}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeSort === "active"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Flame className="size-3.5 text-amber-500" />
                <span>{isRtl ? "فعال‌ترین" : "Active"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSort("votes")}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeSort === "votes"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ChevronUp className="size-3.5 text-blue-500" />
                <span>{isRtl ? "بیشترین رأی" : "Votes"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSort("unanswered")}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeSort === "unanswered"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HelpCircle className="size-3.5 text-rose-500" />
                <span>{isRtl ? "بدون پاسخ" : "Unanswered"}</span>
              </button>
            </div>

            {/* Active Tag Pill */}
            {activeTag && (
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-2.5 py-1 rounded-full">
                <Tag className="size-3" />
                <span className="font-semibold">#{activeTag}</span>
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="hover:text-destructive ms-1 cursor-pointer"
                  title={isRtl ? "حذف فیلتر برچسب" : "Clear tag filter"}
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Popular Tag Chips (Genuinely used tags on real posts only) */}
          {popularTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
              <span className="text-muted-foreground shrink-0 text-[11px] font-medium me-1">
                {isRtl ? "برچسب‌های پرکاربرد:" : "Popular Tags:"}
              </span>
              {popularTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-colors shrink-0 cursor-pointer font-mono text-[11px]",
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/50 hover:text-foreground"
                  )}
                  title={isRtl ? `${count} پرسش با این برچسب` : `${count} questions with this tag`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] opacity-75 font-sans">({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* ── New Question Composer Card (StackOverflow Style) ── */}
          {isComposerOpen && isAuthenticated && user && (
            <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md transition-all duration-200">
              {/* Authenticated Author Badge */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    name={currentUserName}
                    nameFa={user.fullNameFa || user.name}
                    nameEn={user.fullName || user.name}
                    avatar={user.avatar}
                    avatarColor={user.avatarColor}
                    avatarMode={user.avatarMode}
                    size="sm"
                    isRtl={isRtl}
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      {currentUserName}
                    </span>
                    <span className="text-[10px] text-muted-foreground ms-1.5" dir="ltr">
                      ({user.email})
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-2 py-0.5", getRoleBadge(user.role, isRtl).className)}
                >
                  {getRoleBadge(user.role, isRtl).label}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Sparkles className="size-4 text-primary" />
                <span>{isRtl ? "طرح پرسش یا چالش فنی جدید" : "Ask a Technical Question"}</span>
              </h3>

              <form onSubmit={handleSubmitPost} className="space-y-3.5">
                <div>
                  <Input
                    placeholder={
                      isRtl
                        ? "عنوان دقیق سوال (مثلاً: علت افزایش ارتعاشات پمپ ESP در فرکانس ۵۵ هرتز چیست؟)"
                        : "Specific question title (e.g. ESP pump vibration threshold at 55Hz)..."
                    }
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="font-medium text-sm"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground me-1">{isRtl ? "دسته‌بندی:" : "Category:"}</span>
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPostCategory(cat.id)}
                      className={cn(
                        "text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer",
                        postCategory === cat.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/50"
                      )}
                    >
                      {isRtl ? cat.labelFa : cat.labelEn}
                    </button>
                  ))}
                </div>

                {/* Tags input bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={isRtl ? "افزودن برچسب (مثلاً: پمپ_ESP) و فشردن Enter..." : "Add tag and press Enter..."}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTag(tagInput)}
                      className="h-8 text-xs shrink-0 cursor-pointer"
                    >
                      <Tag className="size-3 me-1" />
                      <span>{isRtl ? "افزودن برچسب" : "Add Tag"}</span>
                    </Button>
                  </div>
                  {postTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {postTags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs border border-border/60"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-destructive text-muted-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground">
                      {isRtl ? "توضیحات، پارامترهای فنی و شرایط کارکرد:" : "Detailed description & operating conditions:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => insertCodeSnippet()}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      <Code className="size-3" />
                      <span>{isRtl ? "درج بلوک کد / فرمول" : "Insert Code Block"}</span>
                    </button>
                  </div>
                  <Textarea
                    placeholder={
                      isRtl
                        ? "شرح جزئیات فنی، شرایط تست، ارقام داده‌های عملیاتی و آنچه تاکنون بررسی کرده‌اید..."
                        : "Describe the issue, operational insights, parameters and what has been tested..."
                    }
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={5}
                    required
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Uploaded attachments preview */}
                {postAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {postAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 bg-muted/60 text-xs px-2.5 py-1 rounded-lg border border-border/60"
                      >
                        <FileText className="size-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                        <span className="text-[10px] text-muted-foreground">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => setPostAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.zip"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="rounded-full gap-1.5 text-xs cursor-pointer"
                    >
                      {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Paperclip className="size-3.5" />}
                      <span>{isRtl ? "پیوست فایل (حداکثر ۱۰ مگ)" : "Attach File (max 10MB)"}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsComposerOpen(false)}
                      className="rounded-full text-xs"
                    >
                      {isRtl ? "انصراف" : "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || !postTitle.trim() || !postContent.trim()}
                      className="rounded-full gap-1.5 text-xs cursor-pointer font-medium"
                    >
                      {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                      <span>{isRtl ? "انتشار پرسش" : "Publish Question"}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Hidden file input for reply attachments */}
          <input
            type="file"
            ref={replyFileInputRef}
            onChange={handleReplyFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.zip"
          />

          {/* ── Discussions List (StackOverflow Style Layout) ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{isRtl ? "در حال دریافت پرسش‌ها..." : "Loading questions..."}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-border/70 rounded-2xl bg-card/40">
              <MessageSquare className="size-10 mx-auto text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold text-foreground">
                {isRtl ? "پرسشی در این بخش یافت نشد" : "No questions found"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isRtl
                  ? "اولین نفری باشید که در این زمینه یک پرسش فنی مطرح می‌کند."
                  : "Be the first to ask a technical question in this category."}
              </p>
              {isAuthenticated ? (
                <Button
                  onClick={() => setIsComposerOpen(true)}
                  size="sm"
                  className="mt-4 rounded-full gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>{isRtl ? "طرح پرسش جدید" : "Ask First Question"}</span>
                </Button>
              ) : (
                <Button asChild size="sm" className="mt-4 rounded-full gap-1.5 text-xs">
                  <Link href="/login">
                    <LogIn className="size-3.5" />
                    <span>{isRtl ? "ورود جهت طرح پرسش" : "Sign in to ask"}</span>
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const categoryDef = CATEGORIES.find((c) => c.id === post.category) || CATEGORIES[1];
                const isExpanded = !!expandedThreads[post.id];
                const replies = threadReplies[post.id] || [];
                const isLoadingReplies = !!loadingThreads[post.id];
                const currentReplyAtts = replyAttachments[post.id] || [];

                const userUpvoted = (post.upvotes || []).includes(user?.id || "");
                const userDownvoted = (post.downvotes || []).includes(user?.id || "");
                const hasAcceptedAnswer = Boolean(post.acceptedReplyId);

                const isAdminOrSuperAdmin =
                  isAuthenticated &&
                  Boolean(user && (user.role === "superadmin" || user.role === "admin"));

                const canDeletePost = isAdminOrSuperAdmin;
                const canPinPost = isAdminOrSuperAdmin;

                const isPostAuthorOrAdmin =
                  isAuthenticated &&
                  user &&
                  (user.id === post.authorId ||
                    user.email?.toLowerCase() === post.authorEmail?.toLowerCase() ||
                    user.role === "superadmin" ||
                    user.role === "admin");

                const roleBadge = getRoleBadge(post.authorRole, isRtl);

                const rawAuthor = post.authorNameFa || post.authorName || post.authorNameEn || "";
                const postAuthorDisplayName = rawAuthor
                  ? formatPersonName(rawAuthor, locale)
                  : (isRtl ? "کاربر" : "User");

                return (
                  <article
                    key={post.id}
                    className={cn(
                      "bg-card border rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200",
                      post.pinned && "border-amber-500/50 bg-amber-500/[0.03] dark:bg-amber-500/[0.04] ring-1 ring-amber-500/25",
                      !post.pinned && hasAcceptedAnswer && "border-emerald-500/40 hover:border-emerald-500/70",
                      !post.pinned && !hasAcceptedAnswer && "border-border/60 hover:border-border/90"
                    )}
                  >
                    {/* Top Container: StackOverflow Metrics Column + Question Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* ── Left Metrics Box (StackOverflow Metric Badges) ── */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 sm:gap-2 shrink-0 sm:w-24 text-center">
                        {/* Votes Metric */}
                        <div className="flex flex-col items-center justify-center min-w-[54px] sm:w-full py-1">
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {post.score ?? (post.likes || 0)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isRtl ? "رأی" : "votes"}
                          </span>
                        </div>

                        {/* Answers Metric (Green badge if solved/accepted) */}
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center min-w-[58px] sm:w-full py-1 px-2 rounded-lg border text-xs font-semibold transition-colors",
                            hasAcceptedAnswer
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : (post.repliesCount || 0) > 0
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-border/60 text-muted-foreground"
                          )}
                          title={
                            hasAcceptedAnswer
                              ? isRtl
                                ? "این پرسش دارای پاسخ تایید شده است"
                                : "This question has an accepted answer"
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-1">
                            {hasAcceptedAnswer && <Check className="size-3.5 stroke-[3]" />}
                            <span className="text-sm font-bold">{post.repliesCount || 0}</span>
                          </div>
                          <span className="text-[10px] opacity-90">
                            {isRtl ? "پاسخ" : "answers"}
                          </span>
                        </div>

                        {/* Views Metric */}
                        <div className="flex flex-col items-center justify-center min-w-[48px] sm:w-full py-0.5 text-muted-foreground">
                          <span className="text-xs font-semibold">{post.views || 0}</span>
                          <span className="text-[10px]">{isRtl ? "بازدید" : "views"}</span>
                        </div>
                      </div>

                      {/* ── Main Question Details ── */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Title & Pinned/Category Header */}
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h2
                            onClick={() => handleToggleThread(post.id)}
                            className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-2"
                          >
                            {isRtl ? (post.titleFa || post.title) : (post.titleEn || post.title)}
                          </h2>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {post.pinned && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[10px]">
                                <Pin className="size-3" />
                                <span>{isRtl ? "سنجاق شده" : "Pinned"}</span>
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                              {isRtl ? categoryDef.labelFa : categoryDef.labelEn}
                            </Badge>
                            {canPinPost && (
                              <button
                                type="button"
                                onClick={() => handleTogglePin(post.id)}
                                className={cn(
                                  "p-1 rounded-md transition-colors cursor-pointer",
                                  post.pinned
                                    ? "text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25"
                                    : "text-muted-foreground hover:text-amber-600 hover:bg-muted"
                                )}
                                title={
                                  post.pinned
                                    ? isRtl
                                      ? "برداشتن سنجاق (پین)"
                                      : "Unpin question"
                                    : isRtl
                                    ? "سنجاق (پین) کردن در بالای تالار"
                                    : "Pin question to top"
                                }
                              >
                                <Pin className={cn("size-3.5", post.pinned && "fill-current")} />
                              </button>
                            )}
                            {canDeletePost && (
                              <button
                                type="button"
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                                title={isRtl ? "حذف پرسش" : "Delete question"}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content Snippet */}
                        <p
                          onClick={() => handleToggleThread(post.id)}
                          className={cn(
                            "text-xs sm:text-sm text-foreground/80 leading-relaxed mb-3 cursor-pointer whitespace-pre-line",
                            !isExpanded && (post.pinned ? "line-clamp-6" : "line-clamp-3")
                          )}
                        >
                          {isRtl ? (post.contentFa || post.content) : (post.contentEn || post.content)}
                        </p>

                        {/* Tags Row */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTag(tag);
                                }}
                                className="inline-flex items-center gap-0.5 bg-muted/70 hover:bg-primary/10 hover:text-primary text-muted-foreground text-[11px] font-mono px-2 py-0.5 rounded border border-border/60 transition-colors cursor-pointer"
                              >
                                <span>#{tag}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Attachments */}
                        {post.attachments && post.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 bg-muted/50 hover:bg-muted text-foreground text-xs px-2.5 py-1 rounded-lg border border-border/60 transition-colors"
                              >
                                <FileText className="size-3.5 text-primary shrink-0" />
                                <span className="truncate max-w-[180px] font-medium">{att.name}</span>
                                <span className="text-[10px] text-muted-foreground">({att.size})</span>
                                <Download className="size-3 text-muted-foreground ms-1" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Bottom Row: Voting Actions + Author Signature Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
                          {/* Voting arrows & answer button */}
                          <div className="flex items-center gap-2">
                            {/* StackOverflow Question Voting */}
                            <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 p-0.5">
                              <button
                                type="button"
                                onClick={() => handleVotePost(post.id, "up")}
                                className={cn(
                                  "p-1 rounded-full hover:bg-muted transition-colors cursor-pointer",
                                  userUpvoted && "text-emerald-600 bg-emerald-500/15"
                                )}
                                title={isRtl ? "مفید بود (رأی مثبت)" : "Upvote"}
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <span className="font-bold px-1.5 text-xs text-foreground min-w-[20px] text-center">
                                {post.score ?? (post.likes || 0)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleVotePost(post.id, "down")}
                                className={cn(
                                  "p-1 rounded-full hover:bg-muted transition-colors cursor-pointer",
                                  userDownvoted && "text-rose-600 bg-rose-500/15"
                                )}
                                title={isRtl ? "مفید نبود (رأی منفی)" : "Downvote"}
                              >
                                <ChevronDown className="size-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleThread(post.id)}
                              className="text-xs text-primary hover:underline cursor-pointer ms-2 font-medium"
                            >
                              {isExpanded
                                ? isRtl
                                  ? "بستن پاسخ‌ها"
                                  : "Hide answers"
                                : isRtl
                                ? `مشاهده و ثبت پاسخ (${post.repliesCount || 0})`
                                : `Answers (${post.repliesCount || 0})`}
                            </button>
                          </div>

                          {/* Author Signature Box */}
                          <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40 self-end sm:self-auto">
                            <UserAvatar
                              name={postAuthorDisplayName}
                              nameFa={post.authorNameFa}
                              nameEn={post.authorNameEn}
                              avatar={post.authorAvatar}
                              avatarColor={post.authorAvatarColor}
                              avatarMode={post.authorAvatarMode}
                              size="sm"
                              isRtl={isRtl}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {postAuthorDisplayName}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={cn("text-[9px] px-1 py-0 h-3.5 border", roleBadge.className)}
                                >
                                  {roleBadge.label}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground block">
                                {new Date(post.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Threaded Answers (StackOverflow Answers Section) ── */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-border/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span>{replies.length}</span>
                            <span>{isRtl ? "پاسخ ثبت شده" : "Answers"}</span>
                          </h3>
                        </div>

                        {isLoadingReplies ? (
                          <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>{isRtl ? "در حال دریافت پاسخ‌ها..." : "Loading answers..."}</span>
                          </div>
                        ) : replies.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic text-center py-3 bg-muted/20 rounded-xl border border-dashed border-border/60">
                            {isRtl ? "هنوز پاسخی برای این پرسش ثبت نشده است. اولین پاسخ تخصصی را ارسال کنید." : "No answers yet. Be the first to answer this question."}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {replies.map((reply) => {
                              const replyRoleBadge = getRoleBadge(reply.authorRole, isRtl);
                              const isAccepted = Boolean(reply.isAccepted || post.acceptedReplyId === reply.id);
                              const replyUpvoted = (reply.upvotes || []).includes(user?.id || "");
                              const replyDownvoted = (reply.downvotes || []).includes(user?.id || "");

                              const canDeleteReply =
                                isAuthenticated &&
                                user &&
                                (user.id === reply.authorId ||
                                  user.email?.toLowerCase() === reply.authorEmail?.toLowerCase() ||
                                  user.role === "superadmin" ||
                                  user.role === "admin");

                              const rawReplyAuthor = reply.authorNameFa || reply.authorName || reply.authorNameEn || "";
                              const replyAuthorDisplayName = rawReplyAuthor
                                ? formatPersonName(rawReplyAuthor, locale)
                                : (isRtl ? "کاربر" : "User");

                              return (
                                <div
                                  key={reply.id}
                                  className={cn(
                                    "rounded-2xl p-4 text-xs transition-all relative border border-s-4 shadow-xs",
                                    isAccepted
                                      ? "bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.04] to-transparent border-emerald-500/50 border-s-emerald-600 ring-1 ring-emerald-500/20"
                                      : "bg-gradient-to-br from-slate-100/90 via-slate-50/70 to-white/90 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-card/90 border-slate-200/90 dark:border-slate-800/90 border-s-primary/70 dark:border-s-primary hover:border-primary/40 ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
                                  )}
                                >
                                  {/* Accepted Answer Banner if marked */}
                                  {isAccepted && (
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-2.5 pb-2 border-b border-emerald-500/30">
                                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      <span>
                                        {isRtl ? "پاسخ تایید شده توسط نویسنده پرسش" : "Accepted Answer by question author"}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-start gap-3">
                                    {/* Left: StackOverflow Answer Voting Column */}
                                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleVoteReply(post.id, reply.id, "up")}
                                        className={cn(
                                          "p-1 rounded-full hover:bg-muted transition-colors cursor-pointer",
                                          replyUpvoted && "text-emerald-600 bg-emerald-500/15"
                                        )}
                                        title={isRtl ? "مفید بود" : "Upvote"}
                                      >
                                        <ChevronUp className="size-4" />
                                      </button>
                                      <span className="font-bold text-xs text-foreground min-w-[18px] text-center">
                                        {reply.score || 0}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleVoteReply(post.id, reply.id, "down")}
                                        className={cn(
                                          "p-1 rounded-full hover:bg-muted transition-colors cursor-pointer",
                                          replyDownvoted && "text-rose-600 bg-rose-500/15"
                                        )}
                                        title={isRtl ? "مفید نبود" : "Downvote"}
                                      >
                                        <ChevronDown className="size-4" />
                                      </button>

                                      {/* Accept Answer Checkmark Button (Only for Question Author or Admin) */}
                                      {isPostAuthorOrAdmin ? (
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptReply(post.id, reply.id)}
                                          className={cn(
                                            "mt-1 p-1 rounded-full border transition-all cursor-pointer",
                                            isAccepted
                                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                              : "text-muted-foreground border-border/60 hover:text-emerald-600 hover:border-emerald-500"
                                          )}
                                          title={
                                            isAccepted
                                              ? isRtl
                                                ? "لغو تایید پاسخ"
                                                : "Unmark accepted"
                                              : isRtl
                                              ? "تایید به عنوان پاسخ منتخب"
                                              : "Mark as accepted answer"
                                          }
                                        >
                                          <Check className="size-3.5 stroke-[3]" />
                                        </button>
                                      ) : isAccepted ? (
                                        <div
                                          className="mt-1 p-1 rounded-full bg-emerald-600 text-white border border-emerald-600"
                                          title={isRtl ? "پاسخ تایید شده" : "Accepted answer"}
                                        >
                                          <Check className="size-3.5 stroke-[3]" />
                                        </div>
                                      ) : null}
                                    </div>

                                    {/* Right: Answer Content + Author info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <UserAvatar
                                            name={replyAuthorDisplayName}
                                            nameFa={reply.authorNameFa}
                                            nameEn={reply.authorNameEn}
                                            avatar={reply.authorAvatar}
                                            avatarColor={reply.authorAvatarColor}
                                            avatarMode={reply.authorAvatarMode}
                                            size="sm"
                                            isRtl={isRtl}
                                          />
                                          <span className="font-semibold text-foreground">{replyAuthorDisplayName}</span>
                                          <Badge
                                            variant="outline"
                                            className={cn("text-[9px] px-1 py-0 h-3.5", replyRoleBadge.className)}
                                          >
                                            {replyRoleBadge.label}
                                          </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-muted-foreground">
                                            {new Date(reply.createdAt).toLocaleTimeString(isRtl ? "fa-IR" : "en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                          {canDeleteReply && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteReply(post.id, reply.id)}
                                              className="text-muted-foreground hover:text-destructive p-0.5 rounded cursor-pointer"
                                              title={isRtl ? "حذف پاسخ" : "Delete reply"}
                                            >
                                              <Trash2 className="size-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {reply.content}
                                      </p>

                                      {reply.attachments && reply.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                          {reply.attachments.map((att) => (
                                            <a
                                              key={att.id}
                                              href={att.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              download
                                              className="inline-flex items-center gap-1 bg-background text-[11px] px-2 py-0.5 rounded border border-border/50 text-foreground"
                                            >
                                              <FileText className="size-3 text-primary shrink-0" />
                                              <span className="truncate max-w-[140px]">{att.name}</span>
                                              <Download className="size-2.5 text-muted-foreground" />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Composer (Strictly for authenticated users) */}
                        {isAuthenticated && user ? (
                          <div className="bg-card/90 border border-border/70 rounded-xl p-3.5 space-y-2.5 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={currentUserName}
                                  nameFa={user.fullNameFa || user.name}
                                  nameEn={user.fullName || user.name}
                                  avatar={user.avatar}
                                  avatarColor={user.avatarColor}
                                  avatarMode={user.avatarMode}
                                  size="sm"
                                  isRtl={isRtl}
                                />
                                <span className="text-xs font-semibold text-foreground">
                                  {isRtl ? "پاسخ تخصصی شما:" : "Your Answer:"}
                                </span>
                              </div>


                            </div>

                            <Textarea
                              placeholder={
                                isRtl
                                  ? "پاسخ خود را همراه با دلایل فنی، استانداردها یا ارجاعات مهندسی بنویسید..."
                                  : "Write your verified technical answer with references and operating data..."
                              }
                              value={replyInputs[post.id] || ""}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              rows={3}
                              className="text-xs font-mono leading-relaxed"
                            />

                            {/* Reply attachments preview */}
                            {currentReplyAtts.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {currentReplyAtts.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-1.5 bg-muted/70 text-[11px] px-2 py-0.5 rounded border border-border/60"
                                  >
                                    <FileText className="size-3 text-primary" />
                                    <span className="truncate max-w-[140px]">{att.name}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReplyAttachments((prev) => ({
                                          ...prev,
                                          [post.id]: (prev[post.id] || []).filter((a) => a.id !== att.id),
                                        }))
                                      }
                                      className="hover:text-destructive text-muted-foreground ms-1"
                                    >
                                      <X className="size-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isUploading}
                                onClick={() => {
                                  setActiveReplyPostId(post.id);
                                  replyFileInputRef.current?.click();
                                }}
                                className="rounded-full gap-1 text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <Paperclip className="size-3" />
                                <span>{isRtl ? "پیوست فایل" : "Attach"}</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                disabled={replySubmitting[post.id] || !(replyInputs[post.id] || "").trim()}
                                onClick={() => handleSubmitReply(post.id)}
                                className="rounded-full gap-1.5 text-xs h-7 px-4 cursor-pointer font-medium"
                              >
                                {replySubmitting[post.id] ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Send className="size-3" />
                                )}
                                <span>{isRtl ? "ارسال پاسخ" : "Post Answer"}</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-muted/30 border border-border/40 rounded-xl text-center">
                            <p className="text-xs text-muted-foreground">
                              {isRtl
                                ? "جهت ثبت پاسخ در این گفتگو، لطفاً با حساب کاربری خود وارد شوید."
                                : "Please sign in to reply to this discussion."}
                            </p>
                            <Button asChild size="sm" variant="outline" className="mt-2 rounded-full text-xs">
                              <Link href="/login">
                                <LogIn className="size-3.5 me-1" />
                                <span>{isRtl ? "ورود به سیستم" : "Sign In"}</span>
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
