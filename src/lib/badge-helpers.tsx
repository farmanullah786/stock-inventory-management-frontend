import { Badge } from "@/components/ui/badge";
import {
  STOCK_IN_STATUS,
  STOCK_OUT_STATUS,
  PR_STATUS,
  GR_STATUS,
} from "@/constants";

// Badge helper functions for different status types
export const getStockInStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [STOCK_IN_STATUS.DRAFT]: "outline",
    [STOCK_IN_STATUS.VALIDATED]: "secondary",
    [STOCK_IN_STATUS.DONE]: "default",
    [STOCK_IN_STATUS.CANCELLED]: "destructive",
  };
  return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
};

export const getStockOutStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [STOCK_OUT_STATUS.DRAFT]: "outline",
    [STOCK_OUT_STATUS.READY]: "secondary",
    [STOCK_OUT_STATUS.DONE]: "default",
    [STOCK_OUT_STATUS.CANCELLED]: "destructive",
  };
  return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
};

export const getPurchaseRequestStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [PR_STATUS.DRAFT]: "outline",
    [PR_STATUS.PENDING]: "secondary",
    [PR_STATUS.APPROVED]: "default",
    [PR_STATUS.REJECTED]: "destructive",
    [PR_STATUS.CANCELLED]: "outline",
  };
  return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
};

export const getGoodsReceiptStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [GR_STATUS.PENDING]: "outline",
    partial: "secondary",
    complete: "default",
    [GR_STATUS.REJECTED]: "destructive",
  };
  return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
};

export const getPriorityBadge = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-gray-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };
  return (
    <Badge className={colors[priority] || "bg-gray-500"} variant="default">
      {priority.toUpperCase()}
    </Badge>
  );
};

export const getConditionBadge = (condition: string) => {
  const colors: Record<string, string> = {
    good: "bg-green-500",
    damaged: "bg-orange-500",
    missing: "bg-red-500",
    expired: "bg-red-600",
  };
  return (
    <Badge className={colors[condition] || "bg-gray-500"} variant="default">
      {condition.toUpperCase()}
    </Badge>
  );
};

