// src/modules/datasheet-ai/pages/DatasheetAIPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileSearch,
  Bot,
  Sparkles,
  Layers,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { datasheetApi } from "../services/datasheet-api";
import {
  DatasheetDocument,
  TechnicalParameter,
  ExtractionSummaryData,
} from "../types/datasheet.types";
import { DatasheetUploader } from "../components/DatasheetUploader";
import { DatasheetFileList } from "../components/DatasheetFileList";
import { ExtractionSummary } from "../components/ExtractionSummary";
import { ParameterTable } from "../components/ParameterTable";
import { DatasheetViewer } from "../components/DatasheetViewer";
import { AIChatPanel } from "../components/AIChatPanel";
import { toast } from "sonner";

export function DatasheetAIPage() {
  const t = useTranslations("DatasheetAI");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [documents, setDocuments] = useState<DatasheetDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DatasheetDocument | null>(null);
  const [parameters, setParameters] = useState<TechnicalParameter[]>([]);
  const [summary, setSummary] = useState<ExtractionSummaryData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"workspace" | "upload">("workspace");

  // Load documents
  const loadData = async () => {
    setIsLoading(true);
    try {
      const docs = await datasheetApi.listDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        handleSelectDocument(docs[0]);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDocument = async (doc: DatasheetDocument) => {
    setSelectedDoc(doc);
    setCurrentPage(1);
    try {
      const { summary: sum, parameters: params } = await datasheetApi.getParameters(doc.id);
      setSummary(sum || doc.summary || null);
      setParameters(params);
    } catch {
      // ignore
    }
  };

  const handleUploadSuccess = (newDoc: DatasheetDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    handleSelectDocument(newDoc);
    setActiveTab("workspace");
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await datasheetApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        const next = documents.find((d) => d.id !== docId) || null;
        if (next) handleSelectDocument(next);
        else {
          setSelectedDoc(null);
          setParameters([]);
          setSummary(null);
        }
      }
      toast.success(isRtl ? "دیتاشیت حذف شد." : "Datasheet deleted.");
    } catch {
      toast.error(isRtl ? "خطا در حذف دیتاشیت" : "Failed to delete datasheet");
    }
  };

  const handleUpdateParameter = async (
    paramId: string,
    updates: Partial<TechnicalParameter>
  ) => {
    if (!selectedDoc) return;
    await datasheetApi.updateParameter(selectedDoc.id, paramId, updates);
    setParameters((prev) =>
      prev.map((p) => (p.id === paramId ? { ...p, ...updates } : p))
    );
  };

  const handleJumpToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/20 dark:bg-background pb-12">
      {/* ── Top Header / Breadcrumbs Bar ── */}
      <div className="sticky top-0 z-20 border-b border-border/70 bg-card/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-sm">
            <FileSearch className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-foreground">
                {isRtl ? "سامانه هوشمند استخراج دیتاشیت (Datasheet AI)" : "Industrial Datasheet AI Module"}
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono gap-1 border-primary/30 text-primary bg-primary/5">
                <Cpu className="size-3" />
                <span>On-Premise GTX 1650 / Qwen2.5</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "پردازش محلی اسناد مهندسی، استخراج خودکار پارامترهای فنی ASME/TEMA و دستیار پرسش و پاسخ"
                : "Private on-premise parsing, ASME/TEMA parameter extraction & technical AI assistant"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={activeTab === "workspace" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("workspace")}
            className="rounded-xl text-xs gap-1.5 h-9 cursor-pointer"
          >
            <Layers className="size-3.5" />
            <span>{isRtl ? "میز کار تحلیل" : "Analysis Workspace"}</span>
          </Button>

          <Button
            type="button"
            variant={activeTab === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("upload")}
            className="rounded-xl text-xs gap-1.5 h-9 cursor-pointer"
          >
            <UploadCloud className="size-3.5" />
            <span>{isRtl ? "بارگذاری سند جدید" : "Upload Document"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={loadData}
            className="size-9 rounded-xl hover:bg-muted cursor-pointer"
            title={isRtl ? "بروزرسانی داده‌ها" : "Refresh"}
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {activeTab === "upload" ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <DatasheetUploader onUploadSuccess={handleUploadSuccess} />
            {documents.length > 0 && (
              <DatasheetFileList
                documents={documents}
                selectedDocumentId={selectedDoc?.id}
                onSelectDocument={(d) => {
                  handleSelectDocument(d);
                  setActiveTab("workspace");
                }}
                onDeleteDocument={handleDeleteDocument}
              />
            )}
          </div>
        ) : (
          <>
            {/* KPI Summary Dashboard */}
            {selectedDoc && <ExtractionSummary summary={summary} />}

            {/* Main Split Layout: 3 Columns (Files & Viewer, Parameters Table, AI Chat) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (4 Cols): Document List & PDF/Image Viewer */}
              <div className="lg:col-span-5 space-y-4">
                <DatasheetFileList
                  documents={documents}
                  selectedDocumentId={selectedDoc?.id}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
                <DatasheetViewer
                  document={selectedDoc}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  className="min-h-[580px]"
                />
              </div>

              {/* Right Column (7 Cols): Parameters Table & AI Chat Assistant */}
              <div className="lg:col-span-7 space-y-6">
                <ParameterTable
                  parameters={parameters}
                  onUpdateParameter={handleUpdateParameter}
                  onSelectPage={handleJumpToPage}
                  documentTitle={selectedDoc?.name}
                />
                <AIChatPanel
                  document={selectedDoc}
                  onJumpToPage={handleJumpToPage}
                  className="min-h-[460px]"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
