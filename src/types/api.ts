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
  purchaseRequestId?: number;
  referenceNumber?: string;
  location?: string;
  scheduledDate?: string;
  status?: "draft" | "validated" | "done" | "cancelled";
  remarks?: string;
  product?: IProduct;
  stockKeeper?: IUser;
  creator?: IUser;
  purchaseRequest?: IPurchaseRequest;
};

export type IStockOut = BaseEntity & {
  productId: number;
  date: string;
  quantity: number;
  issuedToId?: number;
  site?: string;
  technicianId?: number;
  createdBy: number;
  status?: "draft" | "ready" | "done" | "cancelled";
  validatedBy?: number;
  validatedAt?: string;
  referenceNumber?: string;
  location?: string;
  scheduledDate?: string;
  requestNumber?: string;
  destinationDocument?: string;
  remarks?: string;
  product?: IProduct;
  issuedTo?: IUser;
  technician?: IUser;
  creator?: IUser;
  validator?: IUser;
};

export type IStockSummary = {
  // Basic product info (not in Excel export but used in app)
  productId: number;
  productName: string;
  category?: string;
  categoryId?: number;
  unit: string;
  totalOut: number;
  availableStock: number;
  // Excel export fields in order
  openingStock?: number;
  totalIn: number; // Quantity Purchased
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  poNumber?: string;
  invoiceNo?: string;
  vendorName?: string;
  grnNo?: string;
  year?: number;
  month?: number;
  stockKeeper?: string;
  issuedTo?: string; // Issue to (Employee & Customer Name)
  requestNumber?: string;
  issueDate?: string;
  invoice?: string;
  serialNo?: string;
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

export type IPurchaseRequestItem = BaseEntity & {
  purchaseRequestId: number;
  productId: number;
  quantity: number;
  quantityReceived?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  justification?: string;
  specifications?: string;
  product?: IProduct;
};

export type IPurchaseRequest = BaseEntity & {
  prNumber: string;
  requestedBy: number;
  requestedDate: string;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  justification?: string;
  totalEstimatedCost?: number;
  currency?: string;
  budgetCode?: string;
  department?: string;
  expectedDeliveryDate?: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  remarks?: string;
  requester?: IUser;
  approver?: IUser;
  rejector?: IUser;
  items?: IPurchaseRequestItem[];
  goodsReceipts?: IGoodsReceipt[];
};

export type IGoodsReceiptItem = BaseEntity & {
  goodsReceiptId: number;
  productId: number;
  quantityReceived: number;
  quantityExpected: number;
  condition: "good" | "damaged" | "missing" | "expired";
  remarks?: string;
  product?: IProduct;
};

export type IGoodsReceipt = BaseEntity & {
  grnNumber: string;
  purchaseRequestId?: number;
  receivedDate: string;
  receivedBy: number;
  verifiedBy?: number;
  status: "pending" | "partial" | "complete" | "rejected";
  condition: "good" | "damaged" | "missing" | "expired";
  remarks?: string;
  rejectionReason?: string;
  purchaseRequest?: IPurchaseRequest;
  receiver?: IUser;
  verifier?: IUser;
  items?: IGoodsReceiptItem[];
};

