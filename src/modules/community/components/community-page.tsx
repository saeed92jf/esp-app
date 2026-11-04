"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { communityService } from "../services/community.service";
import type { CommunityPost, CommunityReply, CommunityAttachment } from "../types/community";
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
  Heart,
  MessageCircle,
  Pin,
  FileText,
  Download,
  X,
  Loader2,
  AlertCircle,
  LogIn,
  Trash2,
  Sparkles,
} from "lucide-react";

interface CategoryItem {
  id: string;
  labelKey: string;
  labelEn: string;
  labelFa: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { id: "all", labelKey: "all", labelEn: "All Topics", labelFa: "همه گفتگوها", icon: MessageSquare },
  { id: "announcements", labelKey: "announcements", labelEn: "Announcements", labelFa: "اطلاعیه‌ها", icon: Megaphone },
  { id: "engineering", labelKey: "engineering", labelEn: "Engineering", labelFa: "فنی و مهندسی", icon: Wrench },
  { id: "quality", labelKey: "quality", labelEn: "Quality & QC", labelFa: "کنترل کیفیت", icon: CheckCircle2 },
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
  const chosenName = isRtl
    ? (nameFa || name || nameEn || "کاربر")
    : (nameEn || name || nameFa || "User");

  const initial = (chosenName.trim().charAt(0) || (isRtl ? "ک" : "U")).toUpperCase();

  const hasPhoto = Boolean(
    avatarMode !== "initials" &&
    avatar &&
    typeof avatar === "string" &&
    avatar.trim() !== "" &&
    !avatar.includes("unsplash.com") &&
    !avatar.includes("/team/")
  );

  const sizeClass = size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-11 text-sm" : "size-9 text-xs";

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

  const currentUserName = isRtl
    ? (user?.fullNameFa || user?.name || user?.fullName || "کاربر")
    : (user?.fullName || user?.name || user?.fullNameFa || "User");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post Form State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);

  // Load posts from Real API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPosts(activeCategory, searchQuery);
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to fetch community posts:", err);
      toast.error(err.message || (isRtl ? "خطا در دریافت گفتگوها" : "Failed to load discussions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
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
      toast.error(isRtl ? "لطفاً عنوان و متن پیام را وارد کنید" : "Please enter title and content");
      return;
    }

    try {
      setIsSubmitting(true);
      const newPost = await communityService.createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
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
      setPostAttachments([]);
      setIsComposerOpen(false);
      toast.success(isRtl ? "گفتگوی شما با موفقیت منتشر شد" : "Discussion published successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت پیام" : "Failed to publish post"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) return;
    const confirmMsg = isRtl
      ? "آیا از حذف این گفتگو اطمینان دارید؟ تمامی پاسخ‌های مربوط به آن نیز حذف خواهند شد."
      : "Are you sure you want to delete this discussion and all its replies?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success(isRtl ? "گفتگو با موفقیت حذف شد" : "Discussion deleted successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در حذف گفتگو" : "Failed to delete discussion"));
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

  // Like post
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated || !user) {
      toast.error(isRtl ? "برای ثبت پسندیدن باید وارد حساب کاربری شوید." : "Please log in to like discussions.");
      return;
    }

    try {
      const res = await communityService.toggleLike(postId, user.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const likedBy = p.likedBy || [];
            const isLiked = res.isLiked;
            return {
              ...p,
              likes: res.likes,
              likedBy: isLiked ? [...likedBy, user.id] : likedBy.filter((id) => id !== user.id),
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت واکنش" : "Failed to update like"));
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
                placeholder={isRtl ? "جستجو در مباحث و گفتگوها..." : "Search discussions..."}
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
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const label = isRtl ? cat.labelFa : cat.labelEn;

                const buttonElement = (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
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
                    <Tooltip key={cat.id}>
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
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isRtl ? "تالار گفتگو و دانش سازمانی" : "Euroslot Knowledge & Community"}
                </h1>
                <Badge variant="outline" className="text-xs font-mono font-medium border-primary/30 text-primary">
                  CORE v2.0
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isRtl
                  ? "اشتراک‌گذاری تجربیات فنی، مستندات مهندسی و تعامل مستقیم میان تیم‌های تخصصی یورواسلات پارس"
                  : "Collaborative engineering exchange, technical documentation, and inter-team discussions"}
              </p>
            </div>

            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning(
                    isRtl
                      ? "برای ایجاد گفتگوی جدید، لطفاً با حساب کاربری خود وارد شوید."
                      : "Please sign in to start a new discussion."
                  );
                  return;
                }
                setIsComposerOpen(!isComposerOpen);
              }}
              className="rounded-full gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              {isComposerOpen ? <X className="size-4" /> : <Plus className="size-4" />}
              <span>{isComposerOpen ? (isRtl ? "بستن فرم" : "Close") : (isRtl ? "مبحث جدید" : "New Discussion")}</span>
            </Button>
          </div>

          {/* Guest Warning Banner if not logged in */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {isRtl
                    ? "شما در حالت مشاهده مهمان هستید. برای ایجاد بحث، ثبت نظر و پیوست فایل‌های مهندسی، با حساب پرسنلی خود وارد شوید."
                    : "You are currently browsing as a guest. Please log in with your verified credentials to create topics and post replies."}
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

          {/* ── New Post Composer Card (Visible to Authenticated Users) ── */}
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
                    <span className="text-[10px] text-muted-foreground ms-1.5">
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
                <span>{isRtl ? "ایجاد مبحث جدید" : "Create New Discussion"}</span>
              </h3>

              <form onSubmit={handleSubmitPost} className="space-y-3.5">
                <div>
                  <Input
                    placeholder={isRtl ? "عنوان بحث یا پرسش فنی..." : "Discussion title or topic..."}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="font-medium"
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

                <div>
                  <Textarea
                    placeholder={
                      isRtl
                        ? "شرح پیام، توضیحات مهندسی یا سوال فنی خود را بنویسید..."
                        : "Describe the issue, operational insight, or question in detail..."
                    }
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    required
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
                      className="rounded-full gap-1.5 text-xs cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                      <span>{isRtl ? "انتشار گفتگو" : "Publish"}</span>
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

          {/* ── Discussions List ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{isRtl ? "در حال دریافت مباحث..." : "Loading discussions..."}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-border/70 rounded-2xl bg-card/40">
              <MessageSquare className="size-10 mx-auto text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold text-foreground">
                {isRtl ? "گفتگویی یافت نشد" : "No discussions yet"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isRtl
                  ? "اولین نفری باشید که در این دسته مبحث جدیدی ایجاد می‌کند."
                  : "Be the first to start a conversation in this topic category."}
              </p>
              {isAuthenticated ? (
                <Button
                  onClick={() => setIsComposerOpen(true)}
                  size="sm"
                  className="mt-4 rounded-full gap-1.5 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>{isRtl ? "ایجاد مبحث جدید" : "Start First Discussion"}</span>
                </Button>
              ) : (
                <Button asChild size="sm" className="mt-4 rounded-full gap-1.5 text-xs">
                  <Link href="/login">
                    <LogIn className="size-3.5" />
                    <span>{isRtl ? "ورود جهت ایجاد مبحث" : "Sign in to start"}</span>
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const categoryDef = CATEGORIES.find((c) => c.id === post.category) || CATEGORIES[4];
                const isLiked = (post.likedBy || []).includes(user?.id || "");
                const isExpanded = !!expandedThreads[post.id];
                const replies = threadReplies[post.id] || [];
                const isLoadingReplies = !!loadingThreads[post.id];
                const currentReplyAtts = replyAttachments[post.id] || [];

                const canDeletePost =
                  isAuthenticated &&
                  user &&
                  (user.id === post.authorId ||
                    user.email?.toLowerCase() === post.authorEmail?.toLowerCase() ||
                    user.role === "superadmin" ||
                    user.role === "admin");

                const roleBadge = getRoleBadge(post.authorRole, isRtl);

                const postAuthorDisplayName = isRtl
                  ? (post.authorNameFa || post.authorName || post.authorNameEn || "کاربر")
                  : (post.authorNameEn || post.authorName || post.authorNameFa || "User");

                return (
                  <article
                    key={post.id}
                    className="bg-card border border-border/60 hover:border-border/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200"
                  >
                    {/* Top Row: Author info, category, pin & delete */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          name={postAuthorDisplayName}
                          nameFa={post.authorNameFa}
                          nameEn={post.authorNameEn}
                          avatar={post.authorAvatar}
                          avatarColor={post.authorAvatarColor}
                          avatarMode={post.authorAvatarMode}
                          size="md"
                          isRtl={isRtl}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                              {postAuthorDisplayName}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn("text-[10px] px-1.5 py-0 h-4 border", roleBadge.className)}
                            >
                              {roleBadge.label}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
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

                      <div className="flex items-center gap-2 shrink-0">
                        {post.pinned && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
                            <Pin className="size-3" />
                            <span>{isRtl ? "سنجاق شده" : "Pinned"}</span>
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[11px] text-muted-foreground border-border/60">
                          {isRtl ? categoryDef.labelFa : categoryDef.labelEn}
                        </Badge>
                        {canDeletePost && (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded-md transition-colors cursor-pointer"
                            title={isRtl ? "حذف گفتگو" : "Delete discussion"}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 leading-snug">
                      {isRtl && post.titleFa ? post.titleFa : post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-3.5">
                      {post.content}
                    </p>

                    {/* Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3.5">
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

                    {/* Bottom Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors cursor-pointer",
                            isLiked
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "hover:bg-muted/60 border-transparent hover:border-border/60"
                          )}
                        >
                          <Heart className={cn("size-3.5", isLiked && "fill-rose-500 text-rose-500")} />
                          <span className="font-semibold">{post.likes || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleThread(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors cursor-pointer",
                            isExpanded
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "hover:bg-muted/60 border-transparent hover:border-border/60"
                          )}
                        >
                          <MessageCircle className="size-3.5" />
                          <span>{post.repliesCount || 0}</span>
                          <span className="hidden sm:inline">{isRtl ? "پاسخ" : "Replies"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleThread(post.id)}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {isExpanded
                          ? isRtl
                            ? "بستن پاسخ‌ها"
                            : "Hide replies"
                          : isRtl
                          ? "مشاهده و ارسال پاسخ"
                          : "View & reply"}
                      </button>
                    </div>

                    {/* ── Threaded Replies Area ── */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                        {isLoadingReplies ? (
                          <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>{isRtl ? "در حال دریافت پاسخ‌ها..." : "Loading replies..."}</span>
                          </div>
                        ) : replies.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic text-center py-2">
                            {isRtl ? "هنوز پاسخی ثبت نشده است. اولین پاسخ را ارسال کنید." : "No replies yet. Be the first to answer."}
                          </p>
                        ) : (
                          <div className="space-y-2.5">
                            {replies.map((reply) => {
                              const replyRoleBadge = getRoleBadge(reply.authorRole, isRtl);
                              const canDeleteReply =
                                isAuthenticated &&
                                user &&
                                (user.id === reply.authorId ||
                                  user.email?.toLowerCase() === reply.authorEmail?.toLowerCase() ||
                                  user.role === "superadmin" ||
                                  user.role === "admin");

                              const replyAuthorDisplayName = isRtl
                                ? (reply.authorNameFa || reply.authorName || reply.authorNameEn || "کاربر")
                                : (reply.authorNameEn || reply.authorName || reply.authorNameFa || "User");

                              return (
                                <div
                                  key={reply.id}
                                  className="bg-muted/30 border border-border/40 rounded-xl p-3 text-xs"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
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
                                  <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed ms-8">
                                    {reply.content}
                                  </p>
                                  {reply.attachments && reply.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2 ms-8">
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
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Composer (Strictly for authenticated users) */}
                        {isAuthenticated && user ? (
                          <div className="bg-card/80 border border-border/60 rounded-xl p-3 space-y-2 mt-3">
                            <div className="flex items-center gap-2 mb-1">
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
                              <span className="text-[11px] font-semibold text-foreground">
                                {currentUserName}
                              </span>
                            </div>

                            <Textarea
                              placeholder={isRtl ? "پاسخ تخصصی یا نظر خود را بنویسید..." : "Write your verified reply..."}
                              value={replyInputs[post.id] || ""}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              rows={2}
                              className="text-xs"
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
                                <span>{isRtl ? "پیوست" : "Attach"}</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                disabled={replySubmitting[post.id] || !(replyInputs[post.id] || "").trim()}
                                onClick={() => handleSubmitReply(post.id)}
                                className="rounded-full gap-1.5 text-xs h-7 px-3.5 cursor-pointer"
                              >
                                {replySubmitting[post.id] ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Send className="size-3" />
                                )}
                                <span>{isRtl ? "ارسال پاسخ" : "Reply"}</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/30 border border-border/40 rounded-xl text-center">
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
        </div>
      </div>
    </div>
  );
}
