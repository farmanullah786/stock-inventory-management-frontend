import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FilterCardProps {
  children: ReactNode;
  className?: string;
}

export const FilterCard = ({ children, className = "" }: FilterCardProps) => {
  return (
    <Card className={`shadow-none ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

