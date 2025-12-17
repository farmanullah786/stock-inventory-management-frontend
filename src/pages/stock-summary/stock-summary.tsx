import { useMemo } from "react";
import { useFetchStockSummary } from "@/hooks/use-stock-summary";
import { useFetchCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { stockSummaryColumns } from "@/components/stock-summary/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import Loader from "@/components/ui/loader";
import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/shared/container";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { TableRow, TableCell } from "@/components/ui/table";
import { ErrorDisplay } from "@/components/shared/error-display";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { CategoryFilter } from "@/components/shared/category-filter";
import { DateRangeFilter } from "@/components/shared/date-range-filter";

const StockSummary = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();

  const {
    data,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockSummary(queryOptions);

  // Adapt current backend response to paginated format
  const summary = isSuccess ? data?.data || [] : [];
  const rowCount = isSuccess ? data?.count || summary.length : 0;

  // Calculate totals for total row
  const totals = useMemo(() => {
    return summary.reduce(
      (acc: any, item: any) => {
        acc.totalIn += item.totalIn || 0;
        acc.totalOut += item.totalOut || 0;
        acc.availableStock += item.availableStock || 0;
        return acc;
      },
      { totalIn: 0, totalOut: 0, availableStock: 0 }
    );
  }, [summary]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = summary.map((item: any) => ({
      "Product Name": item.productName,
      Category: item.category || "-",
      "Opening Stock": Math.floor(item.openingStock || 0),
      "Total Stock In": parseFloat((item.totalIn || 0).toFixed(2)),
      "Total Stock Out": parseFloat((item.totalOut || 0).toFixed(2)),
      "Available Stock": parseFloat((item.availableStock || 0).toFixed(2)),
      Unit: item.unit || "-",
      Status:
        item.availableStock <= 0
          ? "Out of Stock"
          : item.availableStock < 10
          ? "Low"
          : "In Stock",
    }));

    // Add totals row
    exportData.push({
      "Product Name": "TOTAL",
      Category: "",
      "Opening Stock": 0,
      "Total Stock In": parseFloat(totals.totalIn.toFixed(2)),
      "Total Stock Out": parseFloat(totals.totalOut.toFixed(2)),
      "Available Stock": parseFloat(totals.availableStock.toFixed(2)),
      Unit: "",
      Status: "",
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Summary");

    const fileName = `Stock_Summary_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Stock Summary Report", 14, 15);

    // Date range if filters are applied
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      doc.setFontSize(10);
      const dateRange = `Date Range: ${startDate || "N/A"} to ${
        endDate || "N/A"
      }`;
      doc.text(dateRange, 14, 22);
    }

    // Table data
    const tableData = summary.map((item: any) => [
      item.productName,
      item.category || "-",
      Math.floor(item.openingStock || 0).toString(),
      (item.totalIn || 0).toFixed(2),
      (item.totalOut || 0).toFixed(2),
      (item.availableStock || 0).toFixed(2),
      item.unit || "-",
      item.availableStock <= 0
        ? "Out of Stock"
        : item.availableStock < 10
        ? "Low"
        : "In Stock",
    ]);

    // Add totals row
    tableData.push([
      "TOTAL",
      "",
      "",
      totals.totalIn.toFixed(2),
      totals.totalOut.toFixed(2),
      totals.availableStock.toFixed(2),
      "",
      "",
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [
        [
          "Product Name",
          "Category",
          "Opening Stock",
          "Total In",
          "Total Out",
          "Available Stock",
          "Unit",
          "Status",
        ],
      ],
      body: tableData,
      startY: startDate || endDate ? 28 : 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    const fileName = `Stock_Summary_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  if (isError) {
    return (
      <>
        <Header
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          canExport={false}
        />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load stock summary"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <Header
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        canExport={isSuccess && summary.length > 0}
      />
      <Container>
        <div className="space-y-6">
          {/* 🟢 1. FILTER SECTION (TOP - MUST HAVE) */}
          <StockSummary.Filters />

          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={stockSummaryColumns}
              data={summary}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={rowCount}
              isFetching={isFetching && !isPending}
              footer={
                summary.length > 0 ? (
                  <TableRow>
                    <TableCell className="font-bold text-text text-left">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-text-muted text-center">
                      -
                    </TableCell>
                    <TableCell className="text-text-muted text-center">
                      -
                    </TableCell>
                    <TableCell className="text-text text-center">
                      {totals.totalIn.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-text text-center">
                      {totals.totalOut.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-text font-semibold text-center">
                      {totals.availableStock.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-text-muted text-center">
                      -
                    </TableCell>
                    <TableCell className="text-text-muted text-right">
                      -
                    </TableCell>
                  </TableRow>
                ) : undefined
              }
            />
          )}
        </div>
      </Container>
    </>
  );
};

StockSummary.Filters = () => {
  const { data: categoriesData } = useFetchCategories({
    isActive: true,
    limit: 1000,
  });
  const categories = categoriesData?.data || [];

  return (
    <FilterCard>
      <SearchInput />
      <CategoryFilter categories={categories} />
      <DateRangeFilter />
    </FilterCard>
  );
};

const Header = ({
  onExportExcel,
  onExportPDF,
  canExport,
}: {
  onExportExcel: () => void;
  onExportPDF: () => void;
  canExport: boolean;
}) => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Stock Summary</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            disabled={!canExport}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            disabled={!canExport}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </AppHeader>
  );
};

export default StockSummary;
