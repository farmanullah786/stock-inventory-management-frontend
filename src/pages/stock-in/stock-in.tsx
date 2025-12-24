import { useMemo } from "react";
import { useFetchStockInRecords } from "@/hooks/use-stock-in";
import { useFetchUsers } from "@/hooks/use-user";
import { useUser } from "@/store/use-user-store";
import { canModifyInventory } from "@/lib/utils";
import { stockInColumns } from "@/components/stock-in/columns";
import { useNavigate } from "react-router-dom";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Container } from "@/components/shared/container";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";

const StockIn = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: stockInRecords,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockInRecords(queryOptions);
  const usersQuery = useFetchUsers({ page: 1, limit: 1000 });

  // Extract data arrays once
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];

  const columns = useMemo(
    () => stockInColumns(users, user),
    [users, user]
  );

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load stock in records"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <div className="space-y-4">
          <StockIn.Filters />
          {isPending ? (
            <TableSkeleton columnCount={columns.length} rowCount={10} />
          ) : isSuccess ? (
            <ServerDataTable
              columns={columns}
              data={stockInRecords.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={stockInRecords.pagination.rowCount || 0}
              isFetching={isFetching && !isPending}
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

StockIn.Filters = () => {
  return (
    <FilterCard>
      <SearchInput />
      <DateRangeFilter />
    </FilterCard>
  );
};

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  return (
    <PageHeader
      title="Stock In"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Add Stock In",
              onClick: () => navigate("/stock-in/create"),
            }
          : undefined
      }
    />
  );
};

export default StockIn;
