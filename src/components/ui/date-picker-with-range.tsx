import { useState } from "react"
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  format,
} from "date-fns"
import { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type RangeCalenderProps = Omit<
  React.ComponentProps<"button">,
  "onChange"
> & {
  date: DateRange | undefined
  onChange: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function RangeCalendarWithPresets({
  date,
  onChange,
  className,
  placeholder,
  ...props
}: RangeCalenderProps) {
  const today = new Date()
  const yesterday = { from: subDays(today, 1), to: subDays(today, 1) }
  const last7Days = { from: subDays(today, 6), to: today }
  const last30Days = { from: subDays(today, 29), to: today }
  const monthToDate = { from: startOfMonth(today), to: today }
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  }
  const yearToDate = { from: startOfYear(today), to: today }
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  }

  const [month, setMonth] = useState(today)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          size="lg"
          className={cn(
            "justify-start bg-card text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} –{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder ?? "Pick a date range"}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto min-w-sm p-0 mr-4" align="start">
        <div className="rounded-md border flex max-sm:flex-col">
          <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
            <div className="h-full sm:border-e">
              <div className="flex flex-col px-2">
                <PresetButton label="Today" onClick={() => {
                  onChange({ from: today, to: today })
                  setMonth(today)
                }} />
                <PresetButton label="Yesterday" onClick={() => {
                  onChange(yesterday)
                  setMonth(yesterday.to)
                }} />
                <PresetButton label="Last 7 days" onClick={() => {
                  onChange(last7Days)
                  setMonth(last7Days.to)
                }} />
                <PresetButton label="Last 30 days" onClick={() => {
                  onChange(last30Days)
                  setMonth(last30Days.to)
                }} />
                <PresetButton label="Month to date" onClick={() => {
                  onChange(monthToDate)
                  setMonth(monthToDate.to)
                }} />
                <PresetButton label="Last month" onClick={() => {
                  onChange(lastMonth)
                  setMonth(lastMonth.to)
                }} />
                <PresetButton label="Year to date" onClick={() => {
                  onChange(yearToDate)
                  setMonth(yearToDate.to)
                }} />
                <PresetButton label="Last year" onClick={() => {
                  onChange(lastYear)
                  setMonth(lastYear.to)
                }} />
              </div>
            </div>
          </div>

          <Calendar
            mode="range"
            selected={date}
            onSelect={onChange}
            month={month}
            onMonthChange={setMonth}
            className="max-w-[300px] w-full"
            disabled={[{ after: today }]}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PresetButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
