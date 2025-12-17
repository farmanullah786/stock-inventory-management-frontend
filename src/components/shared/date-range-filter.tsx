import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";

interface DateRangeFilterProps {
  className?: string;
  placeholder?: string;
}

export const DateRangeFilter = ({ 
  className = "w-full sm:w-auto",
  placeholder = "Date Range"
}: DateRangeFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(
    searchParams.get("startDate") && searchParams.get("endDate")
      ? {
          from: new Date(searchParams.get("startDate")!),
          to: new Date(searchParams.get("endDate")!),
        }
      : undefined
  );

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
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      placeholder={placeholder}
      className={className}
    />
  );
};

