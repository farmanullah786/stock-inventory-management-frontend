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
  | "Submit"
  | "Approve"
  | "Reject"
  | "CreateGR"
  | "Verify"
  | "Validate"
  | "None";

export type BaseEntity = {
  id: number;
  createdAt: string;
  updatedAt: string;
};

// Backend Response Types - Match exactly what backend returns
export type MutationResponse<T = any> = {
  success: boolean;
  message: string;
  data: T;
};

export type Pagination = {
  rowCount: number;
  page: number;
  pages: number;
  itemsPerPage: number;
};

export type PaginatedResponse<TData> = {
  success: boolean;
  message: string;
  count: number;
  data: TData[];
  pagination: Pagination;
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
  year?: number;
  month?: number;
  vendorName?: string;
  isActive?: boolean;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};

// Re-export API types
export * from "./api";

