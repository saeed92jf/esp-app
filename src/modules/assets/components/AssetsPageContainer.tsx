"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetCard } from "./AssetCard";
import { AssetDetailModal } from "./AssetDetailModal";
import { AssetUpsertModal } from "./AssetUpsertModal";
import { 
  IndustrialAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetStatus 
} from "../types/assets.types";
import { AssetsService } from "../services/assets.service";
import { 
  Search, 
  Plus, 
  Layers, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  PauseCircle, 
  Wrench, 
  Building2 
} from "lucide-react";

export const AssetsPageContainer: React.FC = () => {
  const [, startTransition] = useTransition();

  const [assets, setAssets] = useState<IndustrialAsset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals
  const [selectedAssetForView, setSelectedAssetForView] = useState<IndustrialAsset | null>(null);
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<IndustrialAsset | null>(null);

  // Initial load
  const loadMetadata = async () => {
    try {
      const [cats, locs] = await Promise.all([
        AssetsService.getCategories(),
        AssetsService.getLocations(),
      ]);
      setCategories(cats);
      setLocations(locs);
    } catch (e) {
      console.error("Failed to load metadata", e);
    }
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await AssetsService.getAssets({
        search: search.trim() || undefined,
        category_id: selectedCategory !== "ALL" ? selectedCategory : undefined,
        location_id: selectedLocation !== "ALL" ? selectedLocation : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });
      setAssets(res.items);
      setTotalCount(res.total);
    } catch (e) {
      console.error("Failed to load assets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        loadAssets();
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLocation, selectedStatus]);

  // Operational Counts
  const operationalCount = assets.filter((a) => a.status === "OPERATIONAL").length;
  const maintenanceCount = assets.filter((a) => a.status === "UNDER_MAINTENANCE").length;
  const standbyCount = assets.filter((a) => a.status === "STANDBY").length;

  const handleStatusChange = async (asset: IndustrialAsset, status: AssetStatus) => {
    try {
      const updated = await AssetsService.updateStatus(asset.id, status);
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? updated : a)));
      if (selectedAssetForView && selectedAssetForView.id === asset.id) {
        setSelectedAssetForView(updated);
      }
    } catch (e) {
      console.error("Failed to change status", e);
    }
  };

  const handleSaveAsset = async (data: Partial<IndustrialAsset>) => {
    if (assetToEdit) {
      const updated = await AssetsService.updateAsset(assetToEdit.id, data);
      setAssets((prev) => prev.map((a) => (a.id === assetToEdit.id ? updated : a)));
    } else {
      const created = await AssetsService.createAsset(data);
      setAssets((prev) => [created, ...prev]);
      setTotalCount((c) => c + 1);
    }
  };

  const handleOpenAdd = () => {
    setAssetToEdit(null);
    setIsUpsertOpen(true);
  };

  const handleOpenEdit = (asset: IndustrialAsset) => {
    setAssetToEdit(asset);
    setIsUpsertOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Top Banner / Worker Dashboard Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">کل ماشین‌آلات</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{totalCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">در حال کار</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {operationalCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">تعمیرات / سرویس</div>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {maintenanceCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">آماده‌به‌کار</div>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
              {standbyCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجوی تگ (P-101)، نام، سریال..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 h-9 text-xs"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs">
              <SelectValue placeholder="دسته‌بندی تجهیز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه دسته‌بندی‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_fa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs">
              <SelectValue placeholder="محل استقرار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه سالن‌ها و واحدها</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name_fa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAssets}
            className="h-9 px-3 text-xs gap-1.5"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            بروزرسانی
          </Button>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            ثبت تجهیز جدید
          </Button>
        </div>
      </div>

      {/* Main Asset Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="h-44 rounded-xl border border-border/60 bg-muted/20 animate-pulse" 
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/20 space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground/60" />
          <h3 className="text-base font-semibold text-foreground">هیچ تجهیزی یافت نشد</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            با معیارهای جستجوی فعلی تجهیزی پیدا نشد. فیلترها را ریست کنید یا تجهیز جدیدی ثبت نمایید.
          </p>
          <Button onClick={handleOpenAdd} size="sm" className="mt-2 text-xs">
            ثبت تجهیز جدید
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              categories={categories}
              locations={locations}
              onSelect={setSelectedAssetForView}
              onEdit={handleOpenEdit}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AssetDetailModal
        asset={selectedAssetForView}
        isOpen={Boolean(selectedAssetForView)}
        onClose={() => setSelectedAssetForView(null)}
        categories={categories}
        locations={locations}
        onStatusChange={handleStatusChange}
      />

      {/* Upsert Modal */}
      <AssetUpsertModal
        isOpen={isUpsertOpen}
        onClose={() => setIsUpsertOpen(false)}
        onSave={handleSaveAsset}
        asset={assetToEdit}
        categories={categories}
        locations={locations}
      />
    </div>
  );
};
