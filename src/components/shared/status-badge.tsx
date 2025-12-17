import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const StatusBadge = ({ isActive, className = "" }: StatusBadgeProps) => {
  return (
    <Badge variant={isActive ? "default" : "destructive"} className={className}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

