import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Column } from "@tanstack/react-table";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateEndPoint = (
  baseEndpoint: string,
  params?: Record<string, any>
): string => {
  if (!params) return baseEndpoint;

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return `${baseEndpoint}?${queryString}`;
};

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  withBorder?: boolean;
}): React.CSSProperties | undefined {
  const isPinned = column.getIsPinned();

  if (!isPinned) return;

  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
        ? "4px 0 4px -4px hsl(var(--border)) inset"
        : undefined
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "hsl(var(--background))" : "hsl(var(--background))",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

export const getInitials = (name: string, lastName?: string): string => {
  if (lastName !== undefined) {
    // Two parameter mode: firstName, lastName
    const firstInitial = name?.charAt(0) || "";
    const lastInitial = lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  } else {
    // Single parameter mode: full name
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
};

export const formatDate = (date: string | Date): string => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(date);
  }
};

export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .split(/(\s|-)/)
    .map((word) => {
      if (word === " " || word === "-" || word === "&") return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "default";
    case "stock_manager":
      return "default";
    case "stock_keeper":
      return "secondary";
    case "viewer":
      return "outline";
    default:
      return "secondary";
  }
};

// Role-based permission checks
export const hasRole = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const isAdmin = (role: string | undefined): boolean => {
  return role === "admin";
};

export const isAdminOrManager = (role: string | undefined): boolean => {
  return role === "admin" || role === "stock_manager";
};

export const isAdminOrManagerOrKeeper = (role: string | undefined): boolean => {
  return role === "admin" || role === "stock_manager" || role === "stock_keeper";
};

export const canModifyInventory = (role: string | undefined): boolean => {
  return isAdminOrManagerOrKeeper(role);
};

export const canView = (role: string | undefined): boolean => {
  return !!role; // All authenticated users can view
};

export const canDelete = (role: string | undefined): boolean => {
  return isAdminOrManager(role);
};

export const canManageProducts = (role: string | undefined): boolean => {
  return isAdminOrManager(role);
};

export const canManageUsers = (role: string | undefined): boolean => {
  return isAdmin(role);
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "destructive";
    default:
      return "secondary";
  }
};
