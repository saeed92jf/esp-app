import React from "react";
import { CategoryTabsProps } from "@/types";

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onCategorySelect,
}) => {
  const allCategories = [{ cat_id: 0, cat_name: "All Videos", cat_cnt: 0, link: "" }, ...categories];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-thin">
        {allCategories.map((category) => {
          const isActive = (category.cat_id === 0 && activeCategoryId === null) || category.cat_id === activeCategoryId;
          
          return (
            <button
              key={category.cat_id}
              onClick={() => onCategorySelect(category.cat_id === 0 ? null : category.cat_id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${
                  isActive
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm"
                    : "text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary"
                }
              `}
            >
              {category.cat_name}
              {category.cat_cnt > 0 && (
                <span className="ml-1 text-xs opacity-70">({category.cat_cnt.toLocaleString()})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};