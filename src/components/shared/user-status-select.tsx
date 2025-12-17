import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserStatusSelectProps {
  paramName?: string;
  placeholder?: string;
  className?: string;
}

export const UserStatusSelect = ({
  paramName = "status",
  placeholder = "All Status",
  className,
}: UserStatusSelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get(paramName) || "all"
  );

  useEffect(() => {
    if (statusFilter !== (searchParams.get(paramName) || "all")) {
      if (statusFilter && statusFilter !== "all") {
        searchParams.set(paramName, statusFilter);
      } else {
        searchParams.delete(paramName);
      }
      setSearchParams(searchParams);
    }
  }, [statusFilter, searchParams, setSearchParams, paramName]);

  return (
    <Select
      value={statusFilter}
      onValueChange={(value) => setStatusFilter(value)}
    >
      <SelectTrigger className={`w-full sm:w-48 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        {["active", "inactive"].map((status) => (
          <SelectItem key={status} value={status} className="capitalize">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

