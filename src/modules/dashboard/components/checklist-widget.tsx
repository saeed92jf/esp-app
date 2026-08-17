"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  const [isFormVisible, setIsFormVisible] = React.useState(false);
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
    <div className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 @md:p-6 flex flex-col h-full min-h-0 fa-num">
      
      {/* Header / Toggle */}
      <div 
        className="mb-3 @sm:mb-4 flex items-center justify-between cursor-pointer select-none group" 
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        <h3 className="font-semibold text-base @sm:text-lg shrink-0">{t("title")}</h3>
        <span className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground group-hover:text-foreground">
          {isFormVisible ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </div>

      {/* Add Task Form */}
      {isFormVisible && (
        <form onSubmit={addTask} className="mb-4 flex flex-col @sm:flex-row items-center gap-2">
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
        </form>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">
        <button
          onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "all" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t('all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "group relative px-3 py-1 pe-7 rounded-full text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors flex items-center",
                activeTab === cat 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
              <span 
                onClick={(e) => deleteCategory(e, cat)}
                className="absolute end-1.5 p-0.5 rounded-full hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </span>
            </button>
          ))}
      </div>

      {filteredTasks && filteredTasks.length > 0 ? (
        <ul className="space-y-1 @sm:space-y-1.5 flex-1 min-h-0 overflow-y-auto pe-1 custom-scrollbar -ml-4 @sm:-ml-5 @md:-ml-6 pl-4 @sm:pl-5 @md:pl-6">
          {filteredTasks.map((item) => (
            <li
              key={item.id}
              onClick={() => toggleTask(item.id)}
              className="group/task relative flex items-center gap-2 @sm:gap-3 p-1.5 @sm:p-2 transition-all duration-300 cursor-pointer z-10"
            >
              {/* Background Layer */}
              <div className="absolute inset-y-0 -left-4 @sm:-left-5 @md:-left-6 right-0 bg-muted/30 group-hover/task:bg-muted/60 rounded-r-full rounded-l-none border-l-4 border-transparent group-hover/task:border-primary -z-10 transition-all duration-300 pointer-events-none" />
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
