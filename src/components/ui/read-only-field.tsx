import { cn } from "@/lib/utils";

interface ReadOnlyFieldProps {
  label?: string;
  value: string | number;
  className?: string;
}

export function ReadOnlyField({ label, value, className }: ReadOnlyFieldProps) {
  return (
    <div className={label ? "space-y-2" : ""}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        className={cn(
          "h-10 px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-600 flex items-center",
          className
        )}
      >
        {value}
      </div>
    </div>
  );
}
