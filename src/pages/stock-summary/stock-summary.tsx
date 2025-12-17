import { useMemo } from "react";
import { useFetchStockSummary } from "@/hooks/use-stock-summary";
import { useFetchCategories } from "@/hooks/use-categories";
import { IStockSummary } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { stockSummaryColumns } from "@/components/stock-summary/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import AppHeader from "@/layouts/app-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/shared/container";
import { FileSpreadsheet } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { exportToExcel } from "@/lib/utils";
import { ErrorDisplay } from "@/components/shared/error-display";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { CategoryFilter } from "@/components/shared/category-filter";
import { DateRangeFilter } from "@/components/shared/date-range-filter";

const StockSummary = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();

  const {
    data: stockSummaryData,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockSummary(queryOptions);

  const summary = isSuccess ? stockSummaryData.data : [];
  const rowCount = isSuccess ? stockSummaryData.pagination.rowCount : 0;

  // Calculate totals for total row
  const totals = useMemo(() => {
    return summary.reduce(
      (
        acc: {
          openingStock: number;
          totalIn: number;
          totalOut: number;
          availableStock: number;
        },
        item: IStockSummary
      ) => {
        acc.openingStock += item.openingStock || 0;
        acc.totalIn += item.totalIn || 0;
        acc.totalOut += item.totalOut || 0;
        acc.availableStock += item.availableStock || 0;
        return acc;
      },
      { openingStock: 0, totalIn: 0, totalOut: 0, availableStock: 0 }
    );
  }, [summary]);

  // Export to Excel
  const handleExportExcel = async () => {
    await exportToExcel("Stock_Summary", summary, totals);
  };

  if (isError) {
    return (
      <>
        <Header
          onExportExcel={handleExportExcel}
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
        canExport={isSuccess && summary.length > 0}
      />
      <Container>
        <div className="space-y-6">
          <StockSummary.Filters />
          {isPending ? (
            <TableSkeleton columnCount={stockSummaryColumns.length} rowCount={10} />
          ) : isSuccess ? (
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
                    <TableCell className="text-text text-center">
                      {Math.floor(totals.openingStock)}
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
                    <TableCell className="text-text-muted text-center">
                      -
                    </TableCell>
                  </TableRow>
                ) : undefined
              }
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

StockSummary.Filters = () => {
  const categoriesQuery = useFetchCategories({
    isActive: true,
    limit: 1000,
  });
  const categories = categoriesQuery.isSuccess ? categoriesQuery.data.data : [];

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
  canExport,
}: {
  onExportExcel: () => void;
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
      </div>
    </AppHeader>
  );
};

export default StockSummary;
