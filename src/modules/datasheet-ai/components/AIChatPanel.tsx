// src/modules/datasheet-ai/components/AIChatPanel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Cpu,
  FileText,
  CornerDownLeft,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { AIChatMessage, DatasheetDocument } from "../types/datasheet.types";
import { datasheetApi } from "../services/datasheet-api";
import { toast } from "sonner";

interface AIChatPanelProps {
  document?: DatasheetDocument | null;
  onJumpToPage?: (page: number) => void;
  className?: string;
}

const SUGGESTED_PROMPTS = [
  { fa: "فشار طراحی (Design Pressure) تجهیز چقدر است؟", en: "What is the Design Pressure?" },
  { fa: "دمای عملیاتی و دمای طراحی را مقایسه کن.", en: "Compare Design & Operating Temperature." },
  { fa: "متریال مشخص‌شده برای بدنه (Shell) چیست؟", en: "What material is specified for the Shell?" },
  { fa: "چه پارامترهای فنی مهمی در سند مفقود هستند؟", en: "Which technical parameters are missing?" },
  { fa: "مشخصات رادیوگرافی جوش و آزمون PWHT چیست؟", en: "What is the Radiography and PWHT spec?" },
];

export function AIChatPanel({ document, onJumpToPage, className }: AIChatPanelProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: isRtl
        ? "درود! دستیار هوش مصنوعی پردازش دیتاشیت یورواسلات پارس (On-Premise) در خدمت شماست. می‌توانید هر سوال فنی درباره مقادیر، استانداردها، متریال یا شرایط عملیاتی این دیتاشیت بپرسید. تمام پاسخ‌ها مستقیماً با ذکر شماره صفحه و متن اصلی سند ارائه می‌گردند."
        : "Hello! I am your On-Premise Datasheet AI Assistant. Ask any technical questions about operating conditions, materials, design codes, or missing parameters from this equipment document. Answers directly cite the exact source page.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      if (!document) {
        // Fallback demo response
        setTimeout(() => {
          const fallbackMsg: AIChatMessage = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: isRtl
              ? "بر اساس مستندات مهندسی مخازن تحت فشار، فشار طراحی داخلی برابر با ۴۵.۰ بارگیج (barg) در حداکثر دمای ۱۸۵ درجه سانتیگراد تعیین گردیده است."
              : "According to the equipment specifications, Internal Design Pressure is 45.0 barg at a maximum design temperature of 185.0 °C.",
            timestamp: new Date().toISOString(),
            citations: [{ page: 1, snippet: "INTERNAL DESIGN PRESSURE: 45.0 barg @ 185.0 °C", parameterKey: "design_pressure_internal" }],
          };
          setMessages((prev) => [...prev, fallbackMsg]);
          setIsLoading(false);
        }, 800);
        return;
      }

      const reply = await datasheetApi.askQuestion(document.id, text);
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در پردازش هوش مصنوعی" : "AI query failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden h-full", className)}>
      {/* ── Chat Header with On-Premise Badge ── */}
      <div className="flex items-center justify-between p-3.5 border-b border-border/60 bg-muted/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="size-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {isRtl ? "دستیار مهندسی هوش مصنوعی (On-Premise)" : "Industrial AI Assistant"}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-mono">
                Qwen2.5 Local GPU Engine
              </span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] gap-1 bg-background">
          <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span>{isRtl ? "امنیت کامل داخلی" : "Internal Server"}</span>
        </Badge>
      </div>

      {/* ── Chat Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[350px]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 max-w-[88%]",
                isUser ? "ms-auto flex-row-reverse" : "me-auto"
              )}
            >
              <div
                className={cn(
                  "size-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border/60 text-primary"
                )}
              >
                {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>

              <div
                className={cn(
                  "flex flex-col gap-1.5 p-3 rounded-2xl text-xs leading-relaxed shadow-2xs",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-muted/40 border border-border/60 text-foreground rounded-tl-xs"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Citations Pill Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 mt-1 border-t border-border/40">
                    {msg.citations.map((cite, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onJumpToPage?.(cite.page)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border/70 hover:border-primary text-primary text-[10px] font-mono transition-colors cursor-pointer"
                        title={cite.snippet}
                      >
                        <FileText className="size-2.5 shrink-0" />
                        <span>
                          {isRtl ? `ارجاع: صفحه ${cite.page}` : `Ref: Page ${cite.page}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-muted/30 w-fit">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>{isRtl ? "در حال استخراج پاسخ از متن سند فنی..." : "Extracting answer from datasheet..."}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts Chips ── */}
      <div className="px-3 pt-2 pb-1 border-t border-border/40 bg-muted/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <Sparkles className="size-3 text-amber-500 shrink-0" />
        {SUGGESTED_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(isRtl ? p.fa : p.en)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-background hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            {isRtl ? p.fa : p.en}
          </button>
        ))}
      </div>

      {/* ── Input Box Composer ── */}
      <div className="p-3 border-t border-border/60 bg-muted/40 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRtl
                ? "سوال فنی خود درباره این دیتاشیت را بپرسید..."
                : "Ask any technical question about this datasheet..."
            }
            className="h-10 text-xs rounded-xl bg-background"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            size="icon"
            className="size-10 rounded-xl shrink-0 cursor-pointer shadow-2xs"
          >
            <Send className="size-4 rtl:rotate-180" />
          </Button>
        </form>
      </div>
    </div>
  );
}
