/**
 * Frontend Constants
 * All static data and configuration values centralized here
 */

// ==================== ROLES ====================
export const ROLES = {
  ADMIN: "admin",
  STOCK_MANAGER: "stock_manager",
  STOCK_KEEPER: "stock_keeper",
  VIEWER: "viewer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ==================== STATUSES ====================
// Purchase Request Statuses
export const PR_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

// Goods Receipt Statuses
export const GR_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

// Stock In Statuses
export const STOCK_IN_STATUS = {
  DRAFT: "draft",
  VALIDATED: "validated",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

// Stock Out Statuses
export const STOCK_OUT_STATUS = {
  DRAFT: "draft",
  READY: "ready",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

// General Statuses
export const GENERAL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type PRStatus = typeof PR_STATUS[keyof typeof PR_STATUS];
export type GRStatus = typeof GR_STATUS[keyof typeof GR_STATUS];
export type StockInStatus = typeof STOCK_IN_STATUS[keyof typeof STOCK_IN_STATUS];
export type StockOutStatus = typeof STOCK_OUT_STATUS[keyof typeof STOCK_OUT_STATUS];
export type GeneralStatus = typeof GENERAL_STATUS[keyof typeof GENERAL_STATUS];

// ==================== CURRENCIES ====================
export const CURRENCIES = {
  AFN: "AFN",
  USD: "USD",
  EUR: "EUR",
  PKR: "PKR",
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

export const DEFAULT_CURRENCY = CURRENCIES.AFN;

// Currency conversion rate (AFN to USD)
export const AFN_TO_USD_RATE = 75;

// ==================== EXCEL EXPORT ====================
export const EXCEL_COLORS = {
  HEADER_BG: "FFE8F5E9", // Light green background
  SUBTOTAL_BG: "FFF0F0F0", // Light gray background
  TOTAL_BG: "FF1B5E20", // Darker green background
  TOTAL_TEXT: "FFFFFFFF", // White text
} as const;

export const EXCEL_SHEET_NAMES = {
  STOCK_SUMMARY: "Stock Summary",
  UNCATEGORIZED: "Uncategorized",
} as const;

export const EXCEL_LIMITS = {
  MAX_SHEET_NAME_LENGTH: 31,
} as const;

export const STOCK_CONDITIONS = {
  OUT_OF_STOCK: "Out of Stock",
  LOW: "Low",
  IN_STOCK: "In Stock",
  LOW_STOCK_THRESHOLD: 10,
} as const;

// ==================== THEMES ====================
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

export const DEFAULT_THEME = THEMES.LIGHT;
export const THEME_STORAGE_KEY = "odoo-ui-theme";

// ==================== QUERY CONFIG ====================
export const QUERY_CONFIG = {
  RETRY: 1,
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;

