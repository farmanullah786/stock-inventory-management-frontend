export enum IStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type IDialogType =
  | "Add"
  | "View"
  | "Update"
  | "Delete"
  | "Change Password"
  | "Change Profile"
  | "None";

export type BaseEntity = {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type MutationResponse<T = any> = {
  success: boolean;
  message: string;
  data: T;
};

export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  role?: string;
  status?: string;
};

export type Pagination = {
  rowCount: number;
  page: number;
  pages: number;
};

export type PaginatedResponse<TData> = {
  success: boolean;
  count: number;
  data: TData[];
  pagination: Pagination;
};

// Re-export API types
export * from "./api";

