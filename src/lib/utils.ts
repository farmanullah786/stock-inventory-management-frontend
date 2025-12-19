import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Column } from "@tanstack/react-table";
import {
  ROLES,
  DEFAULT_CURRENCY,
  CURRENCIES,
  AFN_TO_USD_RATE,
  EXCEL_COLORS,
  EXCEL_SHEET_NAMES,
  EXCEL_LIMITS,
  STOCK_CONDITIONS,
  GENERAL_STATUS,
} from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts the path segment from a full route path
 * Example: "/stock-in" -> "stock-in", "/auth/login" -> "login"
 */
export const getPathSegment = (fullPath: string): string => {
  return fullPath.replace(/^\//, "");
};

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
    background: "hsl(var(--background))",
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
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
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
    case ROLES.ADMIN:
      return "default";
    case ROLES.STOCK_MANAGER:
      return "default";
    case ROLES.STOCK_KEEPER:
      return "secondary";
    case ROLES.VIEWER:
      return "outline";
    default:
      return "secondary";
  }
};

export const isAdmin = (role: string | undefined): boolean => {
  return role === ROLES.ADMIN;
};

export const isAdminOrManager = (role: string | undefined): boolean => {
  return role === ROLES.ADMIN || role === ROLES.STOCK_MANAGER;
};

export const isAdminOrManagerOrKeeper = (role: string | undefined): boolean => {
  return role === ROLES.ADMIN || role === ROLES.STOCK_MANAGER || role === ROLES.STOCK_KEEPER;
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
    case GENERAL_STATUS.ACTIVE:
      return "default";
    case GENERAL_STATUS.INACTIVE:
      return "destructive";
    default:
      return "secondary";
  }
};

// Helper function to define columns for summary sheet
const defineSummaryColumns = (worksheet: any) => {
  worksheet.columns = [
    {
      header: "N/O",
      key: "no",
      width: 8,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Product Detail",
      key: "productName",
      width: 30,
      style: { alignment: { horizontal: "left" } },
    },
    {
      header: "Unit",
      key: "unit",
      width: 10,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Opening Stock",
      key: "openingStock",
      width: 15,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Quantity Purchased (IN)",
      key: "totalIn",
      width: 20,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Opening Balance + Quantity Purchased",
      key: "openingBalancePlusPurchased",
      width: 30,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Total QT_Issued (Out)",
      key: "totalOut",
      width: 20,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Closing Stock",
      key: "availableStock",
      width: 15,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Condition",
      key: "condition",
      width: 15,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Product per unit Price (AF)",
      key: "unitPriceAF",
      width: 22,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Total Product Price (AF)",
      key: "totalPriceAF",
      width: 22,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Product per unit Price (USD)",
      key: "unitPriceUSD",
      width: 25,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Total Product Price (USD)",
      key: "totalPriceUSD",
      width: 25,
      style: { alignment: { horizontal: "right" } },
    },
  ];
};

// Helper function to define columns for a worksheet
const defineColumns = (worksheet: any) => {
  worksheet.columns = [
    {
      header: "Product Name",
      key: "productName",
      width: 30,
      style: { alignment: { horizontal: "left" } },
    },
    {
      header: "Opening Stock",
      key: "openingStock",
      width: 15,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Quantity Purchased",
      key: "totalIn",
      width: 18,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Unit Price",
      key: "unitPrice",
      width: 12,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Total Price",
      key: "totalPrice",
      width: 12,
      style: { alignment: { horizontal: "right" } },
    },
    {
      header: "Currency",
      key: "currency",
      width: 12,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "PO Number",
      key: "poNumber",
      width: 15,
    },
    {
      header: "Invoice NO",
      key: "invoiceNo",
      width: 15,
    },
    {
      header: "Vendor Name",
      key: "vendorName",
      width: 20,
    },
    {
      header: "GRN NO",
      key: "grnNo",
      width: 12,
    },
    {
      header: "Year",
      key: "year",
      width: 10,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Month",
      key: "month",
      width: 10,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Stock Keeper",
      key: "stockKeeper",
      width: 20,
    },
    {
      header: "Issue to (Employee & Customer Name)",
      key: "issuedTo",
      width: 35,
    },
    {
      header: "Request Number",
      key: "requestNumber",
      width: 18,
    },
    {
      header: "Issue Date",
      key: "issueDate",
      width: 15,
      style: { alignment: { horizontal: "center" } },
    },
    {
      header: "Invoice",
      key: "invoice",
      width: 15,
    },
    {
      header: "Serial No",
      key: "serialNo",
      width: 15,
    },
  ];
};

// Helper function to style header row
const styleHeaderRow = (worksheet: any) => {
  worksheet.getRow(1).eachCell((cell: any) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_COLORS.HEADER_BG },
    };
  });
};

// Helper function to add data rows to a worksheet
const addDataRows = (worksheet: any, items: any[]) => {
  items.forEach((item) => {
    worksheet.addRow({
      productName: item.productName || "-",
      openingStock: Math.floor(item.openingStock || 0),
      totalIn: parseFloat((item.totalIn || 0).toFixed(2)),
      unitPrice: parseFloat((item.unitPrice || 0).toFixed(2)),
      totalPrice: parseFloat((item.totalPrice || 0).toFixed(2)),
      currency: item.currency || DEFAULT_CURRENCY,
      poNumber: item.poNumber || "-",
      invoiceNo: item.invoiceNo || "-",
      vendorName: item.vendorName || "-",
      grnNo: item.grnNo || "-",
      year: item.year || "-",
      month: item.month || "-",
      stockKeeper: item.stockKeeper || "-",
      issuedTo: item.issuedTo || "-",
      requestNumber: item.requestNumber || "-",
      issueDate: item.issueDate
        ? new Date(item.issueDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-",
      invoice: item.invoice || "-",
      serialNo: item.serialNo || "-",
    });
  });
};

// Utility function to export data to Excel
export const exportToExcel = async (
  fileName: string,
  data: any[],
  totals?: {
    openingStock: number;
    totalIn: number;
    totalOut: number;
    availableStock: number;
  }
) => {
  const ExcelJS = (await import("exceljs")).default;
  const { saveAs } = await import("file-saver");

  const workbook = new ExcelJS.Workbook();

  // Group data by category
  const groupedByCategory = data.reduce((acc, item) => {
    const category = item.category || EXCEL_SHEET_NAMES.UNCATEGORIZED;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof data>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedByCategory).sort();

  // Helper function to convert price to AFN
  const convertToAFN = (price: number, currency: string): number => {
    if (!price) return 0;
    if (currency === CURRENCIES.AFN) return price;
    if (currency === CURRENCIES.USD) return price * AFN_TO_USD_RATE;
    return price; // Default to AFN if unknown currency
  };

  // Helper function to convert price to USD
  const convertToUSD = (price: number, currency: string): number => {
    if (!price) return 0;
    if (currency === CURRENCIES.USD) return price;
    if (currency === CURRENCIES.AFN) return price / AFN_TO_USD_RATE;
    return price / AFN_TO_USD_RATE; // Default conversion
  };

  // Helper function to get condition
  const getCondition = (availableStock: number): string => {
    if (availableStock <= 0) return STOCK_CONDITIONS.OUT_OF_STOCK;
    if (availableStock < STOCK_CONDITIONS.LOW_STOCK_THRESHOLD) return STOCK_CONDITIONS.LOW;
    return STOCK_CONDITIONS.IN_STOCK;
  };

  // Create summary sheet first with products organized by category
  const summarySheet = workbook.addWorksheet(EXCEL_SHEET_NAMES.STOCK_SUMMARY);
  defineSummaryColumns(summarySheet);
  styleHeaderRow(summarySheet);

  let rowNumber = 1;

  // Add products grouped by category to summary sheet
  sortedCategories.forEach((category) => {
    const categoryItems = groupedByCategory[category];

    // Calculate category totals
    const categoryTotals = categoryItems.reduce(
      (acc, item) => {
        acc.openingStock += item.openingStock || 0;
        acc.totalIn += item.totalIn || 0;
        acc.totalOut += item.totalOut || 0;
        acc.availableStock += item.availableStock || 0;
        acc.totalPriceAF += convertToAFN(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);
        acc.totalPriceUSD += convertToUSD(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);
        // Calculate average unit price
        if (item.unitPrice !== undefined && item.unitPrice !== null) {
          acc.unitPriceAFSum += convertToAFN(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
          acc.unitPriceUSDSum += convertToUSD(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
          acc.unitPriceCount += 1;
        }
        return acc;
      },
      {
        openingStock: 0,
        totalIn: 0,
        totalOut: 0,
        availableStock: 0,
        totalPriceAF: 0,
        totalPriceUSD: 0,
        unitPriceAFSum: 0,
        unitPriceUSDSum: 0,
        unitPriceCount: 0,
      }
    );

    const avgUnitPriceAF =
      categoryTotals.unitPriceCount > 0
        ? categoryTotals.unitPriceAFSum / categoryTotals.unitPriceCount
        : 0;
    const avgUnitPriceUSD =
      categoryTotals.unitPriceCount > 0
        ? categoryTotals.unitPriceUSDSum / categoryTotals.unitPriceCount
        : 0;

    // Add products in this category
    categoryItems.forEach((item) => {
      const openingStock = Math.floor(item.openingStock || 0);
      const totalIn = parseFloat((item.totalIn || 0).toFixed(2));
      const totalOut = parseFloat((item.totalOut || 0).toFixed(2));
      const availableStock = parseFloat((item.availableStock || 0).toFixed(2));
      const openingBalancePlusPurchased = openingStock + totalIn;

      // Convert prices to AFN and USD
      const unitPriceAF = convertToAFN(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
      const totalPriceAF = convertToAFN(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);
      const unitPriceUSD = convertToUSD(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
      const totalPriceUSD = convertToUSD(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);

      summarySheet.addRow({
        no: rowNumber,
        productName: item.productName || "-",
        unit: item.unit || "-",
        openingStock: openingStock,
        totalIn: totalIn,
        openingBalancePlusPurchased: parseFloat(openingBalancePlusPurchased.toFixed(2)),
        totalOut: totalOut,
        availableStock: availableStock,
        condition: getCondition(item.availableStock),
        unitPriceAF: parseFloat(unitPriceAF.toFixed(2)),
        totalPriceAF: parseFloat(totalPriceAF.toFixed(2)),
        unitPriceUSD: parseFloat(unitPriceUSD.toFixed(2)),
        totalPriceUSD: parseFloat(totalPriceUSD.toFixed(2)),
      });

      rowNumber++;
    });

    // Add category subtotal row
    const openingBalancePlusPurchasedTotal =
      Math.floor(categoryTotals.openingStock) + categoryTotals.totalIn;

    const categorySubtotalRow = summarySheet.addRow({
      no: "",
      productName: `TOTAL (${category})`,
      unit: "",
      openingStock: Math.floor(categoryTotals.openingStock),
      totalIn: parseFloat((categoryTotals.totalIn || 0).toFixed(2)),
      openingBalancePlusPurchased: parseFloat(openingBalancePlusPurchasedTotal.toFixed(2)),
      totalOut: parseFloat((categoryTotals.totalOut || 0).toFixed(2)),
      availableStock: parseFloat((categoryTotals.availableStock || 0).toFixed(2)),
      condition: "",
      unitPriceAF: parseFloat(avgUnitPriceAF.toFixed(2)),
      totalPriceAF: parseFloat((categoryTotals.totalPriceAF || 0).toFixed(2)),
      unitPriceUSD: parseFloat(avgUnitPriceUSD.toFixed(2)),
      totalPriceUSD: parseFloat((categoryTotals.totalPriceUSD || 0).toFixed(2)),
    });

    // Style category subtotal row
    categorySubtotalRow.eachCell((cell: any) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: EXCEL_COLORS.SUBTOTAL_BG },
      };
    });

    // Add empty row for spacing between categories
    summarySheet.addRow({});
  });

  // Add grand total row to summary sheet
  if (totals) {
    const grandTotals = data.reduce(
      (acc, item) => {
        acc.openingStock += item.openingStock || 0;
        acc.totalIn += item.totalIn || 0;
        acc.totalOut += item.totalOut || 0;
        acc.availableStock += item.availableStock || 0;
        acc.totalPriceAF += convertToAFN(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);
        acc.totalPriceUSD += convertToUSD(item.totalPrice || 0, item.currency || DEFAULT_CURRENCY);
        // Calculate average unit price - include all items
        if (item.unitPrice !== undefined && item.unitPrice !== null) {
          acc.unitPriceAFSum += convertToAFN(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
          acc.unitPriceUSDSum += convertToUSD(item.unitPrice || 0, item.currency || DEFAULT_CURRENCY);
          acc.unitPriceCount += 1;
        }
        return acc;
      },
      {
        openingStock: 0,
        totalIn: 0,
        totalOut: 0,
        availableStock: 0,
        totalPriceAF: 0,
        totalPriceUSD: 0,
        unitPriceAFSum: 0,
        unitPriceUSDSum: 0,
        unitPriceCount: 0,
      }
    );

    const grandAvgUnitPriceAF =
      grandTotals.unitPriceCount > 0
        ? grandTotals.unitPriceAFSum / grandTotals.unitPriceCount
        : 0;
    const grandAvgUnitPriceUSD =
      grandTotals.unitPriceCount > 0
        ? grandTotals.unitPriceUSDSum / grandTotals.unitPriceCount
        : 0;

    // Add empty row
    summarySheet.addRow({});

    // Calculate grand total opening balance plus purchased
    const grandOpeningBalancePlusPurchased =
      Math.floor(grandTotals.openingStock) + grandTotals.totalIn;

    // Add grand total row
    const totalsRow = summarySheet.addRow({
      no: "",
      productName: "GRAND TOTAL",
      unit: "",
      openingStock: Math.floor(grandTotals.openingStock),
      totalIn: parseFloat((totals.totalIn || 0).toFixed(2)),
      openingBalancePlusPurchased: parseFloat(grandOpeningBalancePlusPurchased.toFixed(2)),
      totalOut: parseFloat((totals.totalOut || 0).toFixed(2)),
      availableStock: parseFloat((totals.availableStock || 0).toFixed(2)),
      condition: "",
      unitPriceAF: parseFloat(grandAvgUnitPriceAF.toFixed(2)),
      totalPriceAF: parseFloat(grandTotals.totalPriceAF.toFixed(2)),
      unitPriceUSD: parseFloat(grandAvgUnitPriceUSD.toFixed(2)),
      totalPriceUSD: parseFloat(grandTotals.totalPriceUSD.toFixed(2)),
    });

    // Style totals row
    totalsRow.eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: EXCEL_COLORS.TOTAL_TEXT } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: EXCEL_COLORS.TOTAL_BG },
      };
    });
  }

  // Create a worksheet for each category
  sortedCategories.forEach((category) => {
    const categoryItems = groupedByCategory[category];
    
    // Create worksheet with category name (Excel sheet names have 31 char limit)
    const sheetName = category.length > EXCEL_LIMITS.MAX_SHEET_NAME_LENGTH ? category.substring(0, EXCEL_LIMITS.MAX_SHEET_NAME_LENGTH) : category;
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    defineColumns(worksheet);

    // Style header row
    styleHeaderRow(worksheet);

    // Add data rows
    addDataRows(worksheet, categoryItems);

    // Calculate category subtotals
    const categoryTotals = categoryItems.reduce(
      (acc, item) => {
        acc.openingStock += item.openingStock || 0;
        acc.totalIn += item.totalIn || 0;
        acc.totalOut += item.totalOut || 0;
        acc.availableStock += item.availableStock || 0;
        acc.totalPrice += item.totalPrice || 0;
        // Calculate average unit price - include all items
        if (item.unitPrice !== undefined && item.unitPrice !== null) {
          acc.unitPriceSum += item.unitPrice || 0;
          acc.unitPriceCount += 1;
        }
        return acc;
      },
      {
        openingStock: 0,
        totalIn: 0,
        totalOut: 0,
        availableStock: 0,
        totalPrice: 0,
        unitPriceSum: 0,
        unitPriceCount: 0,
      }
    );

    // Calculate average unit price
    const avgUnitPrice =
      categoryTotals.unitPriceCount > 0
        ? categoryTotals.unitPriceSum / categoryTotals.unitPriceCount
        : 0;

    // Add empty row for spacing before total
    worksheet.addRow({});

    // Add category subtotal row
    const subtotalRow = worksheet.addRow({
      productName: "TOTAL",
      openingStock: Math.floor(categoryTotals.openingStock),
      totalIn: parseFloat((categoryTotals.totalIn || 0).toFixed(2)),
      unitPrice: parseFloat(avgUnitPrice.toFixed(2)),
      totalPrice: parseFloat((categoryTotals.totalPrice || 0).toFixed(2)),
      currency: "",
      poNumber: "",
      invoiceNo: "",
      vendorName: "",
      grnNo: "",
      year: "",
      month: "",
      stockKeeper: "",
      issuedTo: "",
      requestNumber: "",
      issueDate: "",
      invoice: "",
      serialNo: "",
    });

    // Style subtotal row
    subtotalRow.eachCell((cell: any) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: EXCEL_COLORS.SUBTOTAL_BG },
      };
    });

    // Set values explicitly after row creation to ensure they're not overwritten
    subtotalRow.getCell(1).value = "TOTAL"; // Product Name
    subtotalRow.getCell(2).value = Math.floor(categoryTotals.openingStock); // Opening Stock
    subtotalRow.getCell(3).value = parseFloat((categoryTotals.totalIn || 0).toFixed(2)); // Quantity Purchased
    subtotalRow.getCell(4).value = parseFloat(avgUnitPrice.toFixed(2)); // Unit Price (always show, even if 0)
    subtotalRow.getCell(5).value = parseFloat((categoryTotals.totalPrice || 0).toFixed(2)); // Total Price
  });

  // Generate Excel file as buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Save file
  saveAs(blob, `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`);
};
