// src/components/ui-custom/date-picker.tsx
'use client';
import { CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Enable Jalali calendar system on dayjs (one-time extension)
dayjs.extend(jalaliday);

interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
}

// Picks a Gregorian Date internally but shows it formatted in the Jalali calendar
export function DatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
}: DatePickerProps) {
  const formatted = value
    ? dayjs(value).calendar('jalali').locale('fa').format('YYYY/MM/DD')
    : '';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 text-start font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? formatted : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
