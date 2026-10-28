"use client";
import * as React from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  triggerLabel?: string;
  searchTerms?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
  hint?: string;
  hintClassName?: string;
}

export const COMBOBOX_SEARCH_THRESHOLD = 10;

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  hintClassName?: string;
  showSearch?: boolean;
  searchThreshold?: number;
  disabled?: boolean;
  /**
   * Visual variant of the combobox trigger:
   * - "outline" (default): standard rounded boxed button
   * - "underline": flat bottom-border only style matching profile and form inputs
   * - "ghost": borderless button
   * - "unstyled": neutral container allowing full custom styling
   */
  variant?: "outline" | "underline" | "ghost" | "unstyled";
  /**
   * Size presets for the combobox trigger (used mainly with "outline" and "ghost")
   */
  size?: "xs" | "sm" | "default" | "lg";
  /**
   * Popover alignment relative to trigger
   */
  align?: "start" | "center" | "end";
  /**
   * Popover side offset in pixels
   */
  sideOffset?: number;
  /**
   * Whether to clear value when selecting the currently selected item (default: true)
   */
  allowClear?: boolean;
  /**
   * Accessible ID for label binding
   */
  id?: string;
  /**
   * Allow user to create / select a custom value typed into the search box
   */
  creatable?: boolean;
  /**
   * Custom render function for trigger content
   */
  renderTrigger?: (selected: ComboboxOption | undefined, open: boolean) => React.ReactNode;
}

const sizeClasses: Record<"xs" | "sm" | "default" | "lg", string> = {
  xs: "h-7 text-xs px-2",
  sm: "h-8 text-xs px-2.5",
  default: "h-10 text-sm px-2.5",
  lg: "h-12 text-base px-3",
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  className,
  triggerClassName,
  popoverClassName,
  hintClassName,
  showSearch,
  searchThreshold = COMBOBOX_SEARCH_THRESHOLD,
  disabled,
  variant = "outline",
  size = "default",
  align = "start",
  sideOffset,
  allowClear = true,
  id,
  creatable = false,
  renderTrigger,
}: ComboboxProps) {
  const t = useTranslations("Combobox");
  const locale = useLocale();
  const isRtl = locale === "fa" || locale === "ar";

  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selected = options.find(
    (o) => o.value === value || (value && o.label.toLowerCase() === value.toLowerCase())
  );
  const resolvedPlaceholder = placeholder ?? (t ? t("placeholder") : "Select...");
  const resolvedSearchPlaceholder = searchPlaceholder ?? (t ? t("searchPlaceholder") : "Search...");
  const resolvedEmptyText = emptyText ?? (t ? t("emptyText") : "No results.");

  const shouldShowSearch =
    creatable ||
    (typeof showSearch === "boolean"
      ? showSearch
      : options.length > searchThreshold);

  const trimmedSearch = searchValue.trim();
  const showCreateOption =
    creatable &&
    trimmedSearch.length > 0 &&
    !options.some(
      (opt) =>
        opt.value.toLowerCase() === trimmedSearch.toLowerCase() ||
        opt.label.toLowerCase() === trimmedSearch.toLowerCase()
    );

  const isUnderline = variant === "underline";

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchValue("");
      }}
      modal={false}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            // Base styles: never resize or scale on click
            "w-full text-start font-medium transition-colors select-none group cursor-pointer outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-100 transform-none rtl:text-right",
            isUnderline
              ? cn(
                  "h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-primary/20 rounded-none px-0 text-base sm:text-lg flex items-center justify-between hover:border-primary/50 focus:border-primary focus-visible:border-primary shadow-none",
                  open && "border-primary"
                )
              : variant === "ghost"
              ? cn("flex items-center justify-between gap-2 rounded-xl bg-transparent hover:bg-muted/40", sizeClasses[size])
              : variant === "unstyled"
              ? "flex items-center justify-between"
              : cn(
                  // Default outline
                  "flex items-center justify-between gap-2 border border-border/50 bg-white dark:bg-card text-foreground hover:border-primary/50 hover:bg-muted/40 shadow-xs rounded-xl",
                  sizeClasses[size]
                ),
            !selected && !value && (isUnderline ? "text-muted-foreground/60" : "text-muted-foreground"),
            className,
            triggerClassName
          )}
        >
          {renderTrigger ? (
            renderTrigger(selected, open)
          ) : (
            <>
              <div className="flex items-center gap-2 truncate min-w-0 flex-1 rtl:text-right">
                {selected?.icon && <span className="shrink-0 flex items-center justify-center">{selected.icon}</span>}
                <span className={cn("truncate", !selected && !value && (isUnderline ? "text-muted-foreground/60" : "text-muted-foreground"))}>
                  {selected ? (selected.triggerLabel || selected.label) : (value || resolvedPlaceholder)}
                </span>
              </div>
              {isUnderline ? (
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground/60 transition-all duration-200 group-hover:text-primary",
                    open && "rotate-180 text-primary"
                  )}
                />
              ) : (
                <span className="ms-1.5 flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors group-hover:text-foreground hover:bg-accent/80 hover:text-foreground shrink-0">
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 transition-transform duration-200",
                      open && "rotate-180 text-primary"
                    )}
                  />
                </span>
              )}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-[--radix-popover-trigger-width] min-w-[140px] p-0 z-[100] rounded-xl border border-border/50 shadow-md data-open:zoom-in-100 data-closed:zoom-out-100",
          popoverClassName
        )} 
        align={align}
        sideOffset={sideOffset}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Command>
          {shouldShowSearch && (
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder={resolvedSearchPlaceholder}
              className="rtl:text-right"
            />
          )}
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  value={trimmedSearch}
                  keywords={[trimmedSearch]}
                  onSelect={() => {
                    onChange?.(trimmedSearch);
                    setSearchValue("");
                    setOpen(false);
                  }}
                  className="group rtl:text-right w-full flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-primary font-medium border-b border-border/30 mb-1"
                >
                  <Plus className="size-3.5 shrink-0" />
                  <span className="truncate">{t("create", { value: trimmedSearch })}</span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem 
                  key={opt.value} 
                  value={opt.value} 
                  keywords={opt.searchTerms || [opt.label]} 
                  onSelect={(currentValue) => { 
                    if (opt.disabled) return;
                    if (allowClear && (currentValue === value || opt.value === value)) {
                      onChange?.("");
                    } else {
                      onChange?.(opt.value);
                    }
                    setOpen(false); 
                  }} 
                  disabled={opt.disabled}
                  className={cn(
                    "group rtl:text-right w-full flex items-center justify-between gap-2 px-2.5 py-1.5 cursor-pointer",
                    opt.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <div className="flex-1 flex items-center gap-2 rtl:text-right min-w-0">
                    {opt.icon && <span className="shrink-0 flex items-center justify-center">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {opt.hint && (
                      <span
                        className={cn(
                          "ms-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-md transition-colors duration-150 shrink-0 select-none",
                          "text-muted-foreground/80 bg-muted/60 dark:bg-muted/30",
                          "group-hover:text-white group-hover:bg-white/20",
                          "group-hover/command-item:text-white group-hover/command-item:bg-white/20",
                          "group-data-[selected=true]:text-white group-data-[selected=true]:bg-white/20",
                          "group-data-selected/command-item:text-white group-data-selected/command-item:bg-white/20",
                          isRtl && "fa-num",
                          hintClassName,
                          opt.hintClassName
                        )}
                      >
                        {opt.hint}
                      </span>
                    )}
                  </div>
                  <Check className={cn('ms-auto size-3.5 shrink-0 text-primary group-hover:text-white group-data-[selected=true]:text-white group-data-selected/command-item:text-white', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
