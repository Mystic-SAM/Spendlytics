import { useEffect, useState } from "react";
import {
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  startOfYear,
  endOfDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatDateLocalized, formatDateToShort } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export const DateRangeEnum = {
  LAST_30_DAYS: "30days",
  LAST_MONTH: "lastMonth",
  LAST_3_MONTHS: "last3Months",
  LAST_YEAR: "lastYear",
  THIS_MONTH: "thisMonth",
  THIS_YEAR: "thisYear",
  ALL_TIME: "allTime",
  CUSTOM: "custom",
} as const;

export type DateRangeEnumType = (typeof DateRangeEnum)[keyof typeof DateRangeEnum];

export type DateRangeType = {
  from: Date | null;
  to: Date | null;
  value?: string;
  label: string;
} | null;

type DateRangePreset = {
  label: string;
  value: string;
  getRange: () => DateRangeType;
};

interface DateRangeSelectProps {
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  defaultRange?: DateRangeEnumType;
  showCustom?: boolean;
}

const now = new Date();
const today = endOfDay(now);

const presets: DateRangePreset[] = [
  {
    label: "All Time",
    value: DateRangeEnum.ALL_TIME,
    getRange: () => ({
      from: null,
      to: null,
      value: DateRangeEnum.ALL_TIME,
      label: "across All Time",
    }),
  },
  {
    label: "Last 30 Days",
    value: DateRangeEnum.LAST_30_DAYS,
    getRange: () => ({
      from: subDays(today, 29),
      to: today,
      value: DateRangeEnum.LAST_30_DAYS,
      label: "for Past 30 Days",
    }),
  },
  {
    label: "Last Month",
    value: DateRangeEnum.LAST_MONTH,
    getRange: () => ({
      from: startOfMonth(subMonths(today, 1)),
      to: startOfMonth(today),
      value: DateRangeEnum.LAST_MONTH,
      label: "for Last Month",
    }),
  },
  {
    label: "Last 3 Months",
    value: DateRangeEnum.LAST_3_MONTHS,
    getRange: () => ({
      from: startOfMonth(subMonths(today, 3)),
      to: startOfMonth(today),
      value: DateRangeEnum.LAST_3_MONTHS,
      label: "for Past 3 Months",
    }),
  },
  {
    label: "Last Year",
    value: DateRangeEnum.LAST_YEAR,
    getRange: () => ({
      from: startOfYear(subYears(today, 1)),
      to: startOfYear(today),
      value: DateRangeEnum.LAST_YEAR,
      label: "for Past Year",
    }),
  },
  {
    label: "This Month",
    value: DateRangeEnum.THIS_MONTH,
    getRange: () => ({
      from: startOfMonth(today),
      to: today,
      value: DateRangeEnum.THIS_MONTH,
      label: "for This Month",
    }),
  },
  {
    label: "This Year",
    value: DateRangeEnum.THIS_YEAR,
    getRange: () => ({
      from: startOfYear(today),
      to: today,
      value: DateRangeEnum.THIS_YEAR,
      label: "for This Year",

    }),
  },
];

export const DateRangeSelect = ({
  dateRange,
  setDateRange,
  defaultRange = DateRangeEnum.THIS_MONTH,
  showCustom = false,
}: DateRangeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const displayText = dateRange
    ? presets.find((p) => p.value === dateRange.value)?.label ||
    (dateRange.from
      ? `${formatDateToShort(dateRange.from)} - ${dateRange.to ? formatDateToShort(dateRange.to) : "Present"
      }`
      : "Select a duration")
    : "Select a duration";

  // Set default range on initial render
  useEffect(() => {
    if (!dateRange) {
      const defaultPreset = presets.find(p => p.value === defaultRange);
      if (defaultPreset) {
        setDateRange(defaultPreset.getRange());
      }
    }
  }, [dateRange, defaultRange, setDateRange]);

  const handleCustomOptionClick = () => {
    setOpen(false);
    setCustomRange(
      dateRange?.from && dateRange?.to
        ? { from: dateRange.from, to: dateRange.to }
        : undefined
    );
    setCustomDialogOpen(true);
  };

  const handleCustomApply = () => {
    if (customRange?.from && customRange?.to) {
      const formattedLabel = `${formatDateLocalized(customRange.from)} – ${formatDateLocalized(customRange.to)}`;
      setDateRange({
        from: customRange.from,
        to: endOfDay(customRange.to),
        value: DateRangeEnum.CUSTOM,
        label: formattedLabel,
      });
      setCustomDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[fit-content] text-foreground flex items-center justify-between text-left font-normal !cursor-pointer"
            >
              {displayText}
              <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="grid py-1">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="ghost"
                  className={cn(
                    "justify-start text-left",
                    dateRange?.value === preset.value && "bg-accent",
                  )}
                  onClick={() => {
                    setDateRange(preset.getRange());
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
              {
                showCustom && (
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start text-left",
                      dateRange?.value === DateRangeEnum.CUSTOM && "bg-accent"
                    )}
                    onClick={handleCustomOptionClick}
                  >
                    Custom
                  </Button>
                )
              }
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Custom Date Range Dialog */}
      {showCustom &&
        <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
          <DialogContent className="sm:max-w-fit">
            <DialogHeader>
              <DialogTitle>Select Custom Date Range</DialogTitle>
              <DialogDescription className="sr-only">
                Select a date range to view transactions
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex justify-center">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={setCustomRange}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                defaultMonth={customRange?.from ?? subMonths(new Date(), 1)}
              />
            </div>
            {customRange?.from && customRange?.to && (
              <p className="text-sm text-muted-foreground text-center">
                {formatDateLocalized(customRange.from)} – {formatDateLocalized(customRange.to)}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCustomDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomApply}
                disabled={!customRange?.from || !customRange?.to}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    </>
  );
};
