"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Calendar,
  User,
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

export function CommunityPage() {
  const t = useTranslations("Community");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();

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

  // Load posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPosts(activeCategory, searchQuery);
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch community posts:", err);
      toast.error(isRtl ? "خطا در دریافت گفتگوها" : "Failed to load discussions");
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

  // Upload file for new post
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast.success(isRtl ? "فایل پیوست شد" : "File attached successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در آپلود فایل" : "Failed to upload file"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Upload file for a reply
  const handleReplyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Submit new post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
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
        authorName: user?.fullName || user?.name || "Euroslot Member",
        authorRole: user?.role || "staff",
        authorAvatar: user?.avatar,
        attachments: postAttachments,
      });

      setPosts((prev) => [newPost, ...prev]);
      setPostTitle("");
      setPostContent("");
      setPostAttachments([]);
      setIsComposerOpen(false);
      toast.success(isRtl ? "پیام شما با موفقیت منتشر شد" : "Post published successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ثبت پیام" : "Failed to publish post"));
    } finally {
      setIsSubmitting(false);
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
      } catch (err) {
        console.error("Failed to load thread:", err);
      } finally {
        setLoadingThreads((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Submit reply
  const handleSubmitReply = async (postId: string) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;

    try {
      setReplySubmitting((prev) => ({ ...prev, [postId]: true }));
      const newReply = await communityService.addReply(postId, {
        content: text,
        authorName: user?.fullName || user?.name || "Euroslot Member",
        authorRole: user?.role || "staff",
        authorAvatar: user?.avatar,
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
      toast.success(isRtl ? "پاسخ ارسال شد" : "Reply added");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در ارسال پاسخ" : "Failed to post reply"));
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Like post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await communityService.toggleLike(postId, user?.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const likedBy = p.likedBy || [];
            const effectiveId = user?.id || "current_user";
            const isLiked = likedBy.includes(effectiveId);
            return {
              ...p,
              likes: res.likes,
              likedBy: isLiked ? likedBy.filter((id) => id !== effectiveId) : [...likedBy, effectiveId],
            };
          }
          return p;
        })
      );
    } catch {
      toast.error(isRtl ? "خطا در ثبت لایک" : "Failed to update like");
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

        {/* ── Sticky Sidebar Navigation (Matching Profile page) ── */}
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
                  ? "اشتراک‌گذاری تجربیات فنی، مستندات مهندسی و تعامل مستقیم میان تیم‌های تخصصی"
                  : "Collaborative engineering exchange, technical documentation, and inter-team discussions"}
              </p>
            </div>

            <Button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="rounded-full gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              {isComposerOpen ? <X className="size-4" /> : <Plus className="size-4" />}
              <span>{isComposerOpen ? (isRtl ? "بستن فرم" : "Close") : (isRtl ? "مبحث جدید" : "New Discussion")}</span>
            </Button>
          </div>

          {/* ── New Post Composer Card ── */}
          {isComposerOpen && (
            <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md transition-all duration-200">
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
              <Button
                onClick={() => setIsComposerOpen(true)}
                size="sm"
                className="mt-4 rounded-full gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                <span>{isRtl ? "ایجاد مبحث جدید" : "Start First Discussion"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const categoryDef = CATEGORIES.find((c) => c.id === post.category) || CATEGORIES[4];
                const isLiked = (post.likedBy || []).includes(user?.id || "current_user");
                const isExpanded = !!expandedThreads[post.id];
                const replies = threadReplies[post.id] || [];
                const isLoadingReplies = !!loadingThreads[post.id];
                const currentReplyAtts = replyAttachments[post.id] || [];

                return (
                  <article
                    key={post.id}
                    className="bg-card border border-border/60 hover:border-border/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200"
                  >
                    {/* Top Row: Author info, category, and pin */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="size-9 border border-border/60">
                          {post.authorAvatar && <AvatarImage src={post.authorAvatar} alt={post.authorName} />}
                          <AvatarFallback className="text-xs font-semibold">
                            {post.authorName?.slice(0, 2).toUpperCase() || "EU"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                              {post.authorName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono px-1.5 py-0 h-4 capitalize"
                            >
                              {post.authorRole}
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
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-muted/30 border border-border/40 rounded-xl p-3 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="size-6 border border-border/50">
                                      {reply.authorAvatar && (
                                        <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                                      )}
                                      <AvatarFallback className="text-[10px]">
                                        {reply.authorName?.slice(0, 2).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-foreground">{reply.authorName}</span>
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 capitalize">
                                      {reply.authorRole}
                                    </Badge>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleTimeString(isRtl ? "fa-IR" : "en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
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
                            ))}
                          </div>
                        )}

                        {/* Reply Composer */}
                        <div className="bg-card/80 border border-border/60 rounded-xl p-3 space-y-2 mt-3">
                          <Textarea
                            placeholder={isRtl ? "پاسخ خود را بنویسید..." : "Write your reply..."}
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
