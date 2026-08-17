"use client";
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption { value: string; label: string; }

export const COMBOBOX_SEARCH_THRESHOLD = 10;

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
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
  showSearch,
  searchThreshold = COMBOBOX_SEARCH_THRESHOLD,
  disabled,
}: ComboboxProps) {
  const t = useTranslations("Combobox");
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
            "group w-full justify-between px-2.5 font-normal bg-white dark:bg-black hover:bg-muted/40 transition-colors",
            "rtl:text-right",
            className
          )}
        >
          <span className="truncate">{selected ? selected.label : (value || resolvedPlaceholder)}</span>
          <span className="ms-1.5 flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors group-hover:text-foreground hover:bg-accent/80 hover:text-foreground">
            <ChevronDown className={cn("size-3.5 shrink-0 transition-transform duration-200", open && "rotate-180 text-form-primary")} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[100]" align="start">
        <Command>
          {shouldShowSearch && <CommandInput placeholder={resolvedSearchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.value} value={opt.value} onSelect={(currentValue) => { onChange?.(currentValue === value ? "" : currentValue); setOpen(false); }} className="rtl:flex-row-reverse rtl:justify-end rtl:text-right">
                  <Check className={cn("me-2 size-4 shrink-0", value === opt.value ? "opacity-100" : "opacity-0")} />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
