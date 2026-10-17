"use client";
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  popoverClassName?: string;
  hintClassName?: string;
  showSearch?: boolean;
  searchThreshold?: number;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  className,
  popoverClassName,
  hintClassName,
  showSearch,
  searchThreshold = COMBOBOX_SEARCH_THRESHOLD,
  disabled,
}: ComboboxProps) {
  const t = useTranslations("Combobox");
  const locale = useLocale();
  const isRtl = locale === 'fa' || locale === 'ar';
  
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const resolvedPlaceholder = placeholder ?? (t ? t("placeholder") : "Select...");
  const resolvedSearchPlaceholder = searchPlaceholder ?? (t ? t("searchPlaceholder") : "Search...");
  const resolvedEmptyText = emptyText ?? (t ? t("emptyText") : "No results.");

  const shouldShowSearch =
    typeof showSearch === "boolean"
      ? showSearch
      : options.length > searchThreshold;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "group w-full justify-between px-2.5 font-medium bg-white dark:bg-card hover:bg-muted/40 transition-colors active:scale-100",
            "rtl:text-right",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            {selected?.icon && <span className="shrink-0 flex items-center justify-center">{selected.icon}</span>}
            <span className={cn("truncate", !selected && !value && "text-muted-foreground")}>{selected ? (selected.triggerLabel || selected.label) : (value || resolvedPlaceholder)}</span>
          </div>
          <span className="ms-1.5 flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors group-hover:text-foreground hover:bg-accent/80 hover:text-foreground shrink-0">
            <ChevronDown className={cn("size-3.5 shrink-0 transition-transform duration-200", open && "rotate-180 text-primary")} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-[--radix-popover-trigger-width] min-w-[140px] p-0 z-[100] rounded-xl border border-border/50 shadow-md data-open:zoom-in-100 data-closed:zoom-out-100",
          popoverClassName
        )} 
        align="start" 
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Command>
          {shouldShowSearch && <CommandInput placeholder={resolvedSearchPlaceholder} className="rtl:text-right" />}
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem 
                  key={opt.value} 
                  value={opt.value} 
                  keywords={opt.searchTerms || [opt.label]} 
                  onSelect={(currentValue) => { 
                    if (opt.disabled) return;
                    onChange?.(currentValue === value ? '' : currentValue); 
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
