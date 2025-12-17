import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { RangeCalendarWithPresets } from "../ui/date-picker-with-range";

interface DateRangeFilterProps {
  className?: string;
  placeholder?: string;
}

export const DateRangeFilter = ({
  className = "w-full sm:w-auto",
  placeholder = "Date Range",
}: DateRangeFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchParams.get("startDate") && searchParams.get("endDate")
      ? {
          from: new Date(searchParams.get("startDate")!),
          to: new Date(searchParams.get("endDate")!),
        }
      : undefined
  );

  // const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
      searchParams.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    } else {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
    }
    setSearchParams(searchParams);
  }, [dateRange, searchParams, setSearchParams]);

  return (
    <RangeCalendarWithPresets
      date={dateRange}
      onChange={(dateRange) => setDateRange(dateRange)}
      placeholder="Pick a Date Range"
      className={className}
    />
  );
};
