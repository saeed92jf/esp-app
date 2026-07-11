"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption { value: string; label: string; }
interface ComboboxProps {
  options: ComboboxOption[]; value?: string; onChange?: (value: string) => void;
  placeholder?: string; searchPlaceholder?: string; emptyText?: string;
  className?: string; showSearch?: boolean;
}

export function Combobox({ options, value, onChange, placeholder, searchPlaceholder, emptyText, className, showSearch = true }: ComboboxProps) {
  const t = useTranslations("Combobox");
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const resolvedPlaceholder = placeholder ?? (t ? t("placeholder") : "Select...");
  const resolvedSearchPlaceholder = searchPlaceholder ?? (t ? t("searchPlaceholder") : "Search...");
  const resolvedEmptyText = emptyText ?? (t ? t("emptyText") : "No results.");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between px-3 font-normal", className)}>
          <span className="truncate">{selected ? selected.label : resolvedPlaceholder}</span>
          <ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          {showSearch && <CommandInput placeholder={resolvedSearchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.value} value={opt.value} onSelect={(currentValue) => { onChange?.(currentValue === value ? "" : currentValue); setOpen(false); }}>
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
