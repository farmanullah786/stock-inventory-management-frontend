import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/constants";

interface RoleSelectProps {
  paramName?: string;
  placeholder?: string;
  className?: string;
}

const ROLE_ARRAY = Object.values(ROLES);

export const RoleSelect = ({
  paramName = "role",
  placeholder = "All Roles",
  className,
}: RoleSelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState<string>(
    searchParams.get(paramName) || "all"
  );

  useEffect(() => {
    if (roleFilter !== (searchParams.get(paramName) || "all")) {
      if (roleFilter && roleFilter !== "all") {
        searchParams.set(paramName, roleFilter);
      } else {
        searchParams.delete(paramName);
      }
      setSearchParams(searchParams);
    }
  }, [roleFilter, searchParams, setSearchParams, paramName]);

  return (
    <Select
      value={roleFilter}
      onValueChange={(value) => setRoleFilter(value)}
    >
      <SelectTrigger className={`w-full sm:w-48 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Roles</SelectItem>
        {ROLE_ARRAY.map((role) => (
          <SelectItem key={role} value={role} className="capitalize">
            {role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

