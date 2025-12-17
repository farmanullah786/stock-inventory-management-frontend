import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  className?: string;
}

export const StatusSelect = ({ className = "w-full sm:w-48" }: StatusSelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("isActive") || "all";

  const handleFilterChange = (value: string) => {
    if (value && value !== "all") {
      searchParams.set("isActive", value);
    } else {
      searchParams.delete("isActive");
    }
    setSearchParams(searchParams);
  };

  return (
    <Select value={statusFilter} onValueChange={handleFilterChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="All Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="true">Active</SelectItem>
        <SelectItem value="false">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
};

