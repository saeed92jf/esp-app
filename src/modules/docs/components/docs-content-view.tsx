// src/modules/docs/components/docs-content-view.tsx
"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  DocArticle,
  DocCategory,
  DocCallout,
  DocStep,
} from "../types/docs.types";
import {
  Clock,
  Calendar,
  Share2,
  Check,
  Copy,
  Sparkles,
  Info,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Calculator,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsContentViewProps {
  article: DocArticle;
  category?: DocCategory;
  prevArticle?: DocArticle | null;
  nextArticle?: DocArticle | null;
  onSelectArticle: (articleId: string) => void;
}

export function DocsContentView({
  article,
  category,
  prevArticle,
  nextArticle,
  onSelectArticle,
}: DocsContentViewProps) {
  const t = useTranslations("Docs");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const renderCallout = (callout: DocCallout) => {
    const title = isRtl ? callout.titleFa : callout.titleEn;
    const content = isRtl ? callout.contentFa : callout.contentEn;

    const config = {
      tip: {
        icon: Lightbulb,
        bg: "bg-emerald-500/10 dark:bg-emerald-950/20",
        border: "border-emerald-500/30",
        text: "text-emerald-700 dark:text-emerald-300",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
      important: {
        icon: ShieldCheck,
        bg: "bg-purple-500/10 dark:bg-purple-950/20",
        border: "border-purple-500/30",
        text: "text-purple-700 dark:text-purple-300",
        iconColor: "text-purple-600 dark:text-purple-400",
      },
      note: {
        icon: Info,
        bg: "bg-blue-500/10 dark:bg-blue-950/20",
        border: "border-blue-500/30",
        text: "text-blue-700 dark:text-blue-300",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      warning: {
        icon: AlertTriangle,
        bg: "bg-amber-500/10 dark:bg-amber-950/20",
        border: "border-amber-500/30",
        text: "text-amber-700 dark:text-amber-300",
        iconColor: "text-amber-600 dark:text-amber-400",
      },
    }[callout.type];

    const Icon = config.icon;

    return (
      <div
        className={cn(
          "rounded-xl border p-4 my-4 flex items-start gap-3.5 shadow-xs transition-colors",
          config.bg,
          config.border
        )}
      >
        <div className={cn("p-1.5 rounded-lg shrink-0", config.bg)}>
          <Icon className={cn("size-5", config.iconColor)} />
        </div>
        <div className="space-y-1 text-sm">
          <div className={cn("font-bold text-sm", config.text)}>{title}</div>
          <div className="text-muted-foreground leading-relaxed font-normal">
            {content}
          </div>
        </div>
      </div>
    );
  };

  const renderStep = (step: DocStep) => {
    const title = isRtl ? step.titleFa : step.titleEn;
    const description = isRtl ? step.descriptionFa : step.descriptionEn;
    const tip = isRtl ? step.tipFa : step.tipEn;

    return (
      <div
        key={step.number}
        className="relative flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card/60 dark:bg-card/40 hover:bg-card/90 transition-colors shadow-xs"
      >
        <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 fa-num border border-primary/20">
          {step.number}
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {tip && (
            <div className="inline-flex items-center gap-1.5 text-xs text-primary/90 bg-primary/5 border border-primary/15 rounded-md px-2.5 py-1 mt-1 font-medium">
              <Sparkles className="size-3 shrink-0" />
              <span>{tip}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const articleTitle = isRtl ? article.titleFa : article.titleEn;
  const articleSubtitle = isRtl ? article.subtitleFa : article.subtitleEn;
  const categoryTitle = category
    ? isRtl
      ? category.titleFa
      : category.titleEn
    : "";

  return (
    <article className="flex-1 min-w-0 max-w-4xl mx-auto space-y-10 pb-16">
      {/* Article Header */}
      <header className="space-y-4 border-b border-border/60 pb-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>{t("brandTitle")}</span>
            <span className="text-border">/</span>
            <span className="text-foreground/80">{categoryTitle}</span>
            <span className="text-border">/</span>
            <span className="text-primary font-semibold truncate max-w-[200px]">
              {articleTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/70 hover:bg-muted/70 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
              title={t("copyLink")}
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t("copied")}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5" />
                  <span>{t("copyLink")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {articleTitle}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {articleSubtitle}
          </p>
        </div>

        {/* Badges / Metadata */}
        <div className="flex items-center gap-3 flex-wrap pt-2 text-xs text-muted-foreground fa-num">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 font-medium">
            <Clock className="size-3.5 text-primary" />
            <span>
              {article.readingTimeMinutes} {t("minRead")}
            </span>
          </div>

          {article.standardRef && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
              <ShieldCheck className="size-3.5" />
              <span>{article.standardRef}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>
              {t("lastUpdated")}: {article.lastUpdated}
            </span>
          </div>

          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-secondary/80 text-secondary-foreground"
            >
              <Tag className="size-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Sections List */}
      <div className="space-y-12">
        {article.sections.map((section) => {
          const sectionTitle = isRtl ? section.titleFa : section.titleEn;
          const sectionContent = isRtl ? section.contentFa : section.contentEn;

          return (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 space-y-4"
            >
              <h2 className="text-xl font-bold text-foreground border-s-4 border-primary ps-3 tracking-tight">
                {sectionTitle}
              </h2>

              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-normal whitespace-pre-line">
                {sectionContent}
              </p>

              {/* Callout */}
              {section.callout && renderCallout(section.callout)}

              {/* Formula Block */}
              {section.formula && (
                <div className="my-5 rounded-xl border border-border/70 bg-gradient-to-br from-card/80 to-muted/30 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <Calculator className="size-4" />
                      <span>{section.formula.reference}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `formula-${section.id}`,
                          section.formula?.latex || ""
                        )
                      }
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/60 transition-colors"
                      title={t("copyFormula")}
                    >
                      {copiedCodeId === `formula-${section.id}` ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>
                        {copiedCodeId === `formula-${section.id}`
                          ? t("copied")
                          : t("copyFormula")}
                      </span>
                    </button>
                  </div>

                  {/* Latex Equation Display */}
                  <div className="overflow-x-auto py-3 px-4 bg-background/80 dark:bg-background/50 rounded-lg border border-border/40 font-mono text-center text-sm md:text-base font-semibold tracking-wider text-primary select-all ltr">
                    {section.formula.latex}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isRtl
                      ? section.formula.descriptionFa
                      : section.formula.descriptionEn}
                  </p>
                </div>
              )}

              {/* Steps List */}
              {section.steps && section.steps.length > 0 && (
                <div className="space-y-3 pt-2">
                  {section.steps.map((step) => renderStep(step))}
                </div>
              )}

              {/* Code Snippet */}
              {section.codeSnippet && (
                <div className="my-5 rounded-xl border border-border/70 overflow-hidden bg-card/90 shadow-xs">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Code2 className="size-3.5 text-primary" />
                      <span className="font-mono uppercase font-semibold">
                        {section.codeSnippet.language}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `code-${section.id}`,
                          section.codeSnippet?.code || ""
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                    >
                      {copiedCodeId === `code-${section.id}` ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span>{t("copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>{t("copyCode")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed bg-background/50 ltr text-left">
                    <code>{section.codeSnippet.code}</code>
                  </pre>
                  {(section.codeSnippet.captionFa ||
                    section.codeSnippet.captionEn) && (
                    <div className="px-4 py-2 border-t border-border/40 text-[11px] text-muted-foreground bg-muted/20">
                      {isRtl
                        ? section.codeSnippet.captionFa
                        : section.codeSnippet.captionEn}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Article Feedback Section */}
      <div className="border-t border-border/60 pt-8 mt-12">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {t("feedbackQuestion")}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t("feedbackDescription")}
            </p>
          </div>

          {feedback ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20">
              <Check className="size-4" />
              <span>{t("feedbackThanks")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeedback("yes")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium transition-colors cursor-pointer"
              >
                <ThumbsUp className="size-3.5" />
                <span>{t("feedbackYes")}</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedback("no")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-medium transition-colors cursor-pointer"
              >
                <ThumbsDown className="size-3.5" />
                <span>{t("feedbackNo")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination: Previous & Next Article */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
        {prevArticle ? (
          <button
            type="button"
            onClick={() => onSelectArticle(prevArticle.id)}
            className="flex flex-col items-start p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-card hover:bg-card/90 transition-colors text-start group cursor-pointer shadow-xs"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
              {isRtl ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronLeft className="size-3.5" />
              )}
              {t("previousArticle")}
            </span>
            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {isRtl ? prevArticle.titleFa : prevArticle.titleEn}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextArticle && (
          <button
            type="button"
            onClick={() => onSelectArticle(nextArticle.id)}
            className="flex flex-col items-end p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-card hover:bg-card/90 transition-colors text-end group cursor-pointer shadow-xs sm:col-start-2"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
              {t("nextArticle")}
              {isRtl ? (
                <ChevronLeft className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </span>
            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {isRtl ? nextArticle.titleFa : nextArticle.titleEn}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
