import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DatePicker = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & {
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}>(({ label, value, onChange, placeholder = "Pick a date", minDate, maxDate, className, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  // Accept value as string (yyyy-MM-dd), Date, or undefined
  let dateValue: Date | undefined = undefined;
  if (typeof value === "string" && value) {
    const parsed = parseISO(value);
    dateValue = isValid(parsed) ? parsed : undefined;
  } else if (value instanceof Date && isValid(value)) {
    dateValue = value;
  }

  const handleSelect = (date: Date | undefined) => {
    if (onChange) {
      // react-hook-form expects string value for input
      const event = { target: { value: date ? format(date, "yyyy-MM-dd") : "" } };
      // @ts-ignore
      onChange(event);
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !dateValue && "text-muted-foreground"
            )}
            disabled={props.disabled}
          >
            {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            disabled={(date) =>
              (minDate && date < minDate) ||
              (maxDate && date > maxDate) ||
              props.disabled
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {/* Hidden input for react-hook-form registration */}
      <input
        type="hidden"
        ref={ref}
        value={dateValue ? format(dateValue, "yyyy-MM-dd") : ""}
        {...props}
      />
    </div>
  );
});
DatePicker.displayName = "DatePicker";

export { DatePicker };
