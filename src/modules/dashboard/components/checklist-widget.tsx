"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { CheckSquare, Circle, CheckCircle2, ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import type { ChecklistItem } from "../services/dashboard.service";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChecklistWidget({ items }: { items: ChecklistItem[] }) {
  const t = useTranslations("Dashboard.checklist");
  const [tasks, setTasks] = React.useState<ChecklistItem[]>(items || []);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskCategory, setNewTaskCategory] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  const categories = React.useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean) as string[]);
    return Array.from(cats);
  }, [tasks]);

  React.useEffect(() => {
    if (items) setTasks(items);
  }, [items]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteCategory = (e: React.MouseEvent, cat: string) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.category !== cat));
    if (activeTab === cat) setActiveTab("all");
  };

  const addTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cat = newTaskCategory.trim();
    if (!cat && activeTab !== "all") {
      cat = activeTab;
    }

    const newTask: ChecklistItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      category: cat || undefined,
      createdAt: new Intl.DateTimeFormat('fa-IR').format(new Date()),
      createdBy: 'user',
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskCategory("");
    if (cat && cat !== activeTab) {
      setActiveTab(cat);
    }
  };

  const filteredTasks = React.useMemo(() => {
    if (activeTab === "all") return tasks;
    return tasks.filter(t => t.category === activeTab);
  }, [tasks, activeTab]);

  return (
    <div className="flex flex-col h-full min-h-0 fa-num bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container">
      
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-4 pe-18 sm:pe-20">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <CheckSquare className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80 shrink-0">{t("title")}</h3>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="mb-4">
        <div className="flex flex-col @sm:flex-row items-center gap-2">
          <Input 
            type="text" 
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            placeholder={t("categoryPlaceholder")}
            className="w-full @sm:w-1/3 h-9 text-xs @sm:text-sm"
          />
          <div className="flex w-full items-center gap-2">
            <Input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={t("addPlaceholder")}
              className="flex-1 h-9 text-xs @sm:text-sm"
            />
            <Button 
              type="submit" 
              className="h-9 w-9 px-0 shrink-0 shadow-md"
              disabled={!newTaskTitle.trim()}
            >
              <Plus className="size-5" />
            </Button>
          </div>
        </div>
      </form>

      {/* Category Tabs */}
      <motion.div layout className="flex items-center gap-1.5 mb-3 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1 relative">
        <motion.button
          layout
          onClick={() => setActiveTab("all")}
          className={cn(
            "relative px-3 py-1 text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors rounded-full outline-none",
            activeTab === "all" 
              ? "text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "all" && (
            <motion.div
              layout
              layoutId="checklist-category-tab"
              className="absolute inset-0 bg-primary shadow-sm rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t('all')}</span>
        </motion.button>
        
        {categories.map((cat) => (
          <motion.button
            layout
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "group relative px-3 py-1 pe-7 text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors flex items-center rounded-full outline-none",
              activeTab === cat 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === cat && (
              <motion.div
                layoutId="checklist-category-tab"
                className="absolute inset-0 bg-primary shadow-sm rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
            <span 
              onClick={(e) => deleteCategory(e, cat)}
              className="absolute end-1.5 p-0.5 rounded-full hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="size-3" />
            </span>
          </motion.button>
        ))}
      </motion.div>

      {filteredTasks && filteredTasks.length > 0 ? (
        <ul className="segmented-list padded-ends flex-1 min-h-0 overflow-y-auto pe-1 custom-scrollbar pb-2">
          {filteredTasks.map((item) => (
            <li
              key={item.id}
              onClick={() => toggleTask(item.id)}
              className="segmented-item group/task relative flex items-center gap-2 @sm:gap-3 p-2.5 @sm:p-3 bg-background cursor-pointer z-10 border-none"
            >
              <div className="mt-1 shrink-0 transition-all duration-300 group-hover/task:scale-110">
                {item.completed ? (
                  <CheckCircle2 className="size-4 @sm:size-5 text-emerald-500" />
                ) : (
                  <Circle className="size-4 @sm:size-5 text-muted-foreground group-hover/task:text-primary transition-colors" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-xs @sm:text-sm font-medium transition-colors duration-300",
                    item.completed
                      ? "text-muted-foreground line-through opacity-70"
                      : "text-foreground group-hover/task:text-primary"
                  )}
                >
                  {item.title}
                </p>
                {(item.createdAt || item.createdBy) && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground opacity-60">
                    {item.createdAt && <span>{item.createdAt}</span>}
                    {item.createdBy && <span>({item.createdBy})</span>}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => deleteTask(e, item.id)}
                className="opacity-0 group-hover/task:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all shrink-0 ms-auto"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 @sm:p-6 opacity-70">
          <CheckSquare className="size-8 @sm:size-12 mb-2 @sm:mb-3 opacity-20" />
          <p className="text-xs @sm:text-sm font-medium">{t("empty")}</p>
        </div>
      )}
    </div>
  );
}

