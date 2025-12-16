import { BaseEntity } from "./index";

export type ICategory = BaseEntity & {
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  creator?: IUser;
};

export type IProduct = BaseEntity & {
  name: string;
  categoryId: number;
  category?: ICategory;
  unit: string;
  description?: string;
  openingStock?: number;
  isActive: boolean;
  createdBy: number;
  creator?: IUser;
};

export type IStockIn = BaseEntity & {
  productId: number;
  date: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  poNumber?: string;
  invoiceNo?: string;
  vendorName?: string;
  grnNo?: string;
  year?: number;
  month?: number;
  stockKeeperId?: number;
  createdBy: number;
  remarks?: string;
  product?: IProduct;
  stockKeeper?: IUser;
  creator?: IUser;
};

export type IStockOut = BaseEntity & {
  productId: number;
  date: string;
  quantity: number;
  issuedToId?: number;
  site?: string;
  technicianId?: number;
  createdBy: number;
  remarks?: string;
  product?: IProduct;
  issuedTo?: IUser;
  technician?: IUser;
  creator?: IUser;
};

export type IStockSummary = {
  productId: number;
  productName: string;
  category?: string;
  categoryId?: number;
  unit: string;
  openingStock?: number;
  totalIn: number;
  totalOut: number;
  availableStock: number;
};

export type IUser = BaseEntity & {
  firstName: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  phoneNumber?: string;
  fullName: string;
  role?: string;
  status?: string;
};

