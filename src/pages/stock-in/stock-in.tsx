import { useMemo } from "react";
import { useFetchStockInRecords } from "@/hooks/use-stock-in";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchUsers } from "@/hooks/use-user";
import { useUser } from "@/store/use-user-store";
import StockInFormDialog from "../../components/stock-in-form/stock-in-form";
import { canModifyInventory } from "@/lib/utils";
import { createStockInColumns } from "@/components/stock-in/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { ProductFilter } from "@/components/shared/product-filter";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Container } from "@/components/shared/container";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { IProduct, IUser } from "@/types/api";

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
  const productsQuery = useFetchProducts();
  const usersQuery = useFetchUsers({ page: 1, limit: 1000 });

  // Extract data arrays once
  const products = productsQuery.isSuccess ? productsQuery.data.data : [];
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];

  const columns = useMemo(
    () => createStockInColumns(products, users, user.role),
    [products, users, user.role]
  );

  if (isError) {
    return (
      <>
        <Header products={products} users={users} />
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
      <Header products={products} users={users} />
      <Container>
        <div className="space-y-6">
          <StockIn.Filters products={products} />
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

StockIn.Filters = ({ products }: { products: IProduct[] }) => {
  return (
    <FilterCard>
      <SearchInput />
      <ProductFilter products={products} />
      <DateRangeFilter />
    </FilterCard>
  );
};

const Header = ({
  products,
  users,
}: {
  products: IProduct[];
  users: IUser[];
}) => {
  const { user } = useUser();
  return (
    <PageHeader
      title="Stock In"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Add Stock In",
              dialog: (
                <StockInFormDialog
                  action="create"
                  products={products}
                  users={users}
                />
              ),
            }
          : undefined
      }
    />
  );
};

export default StockIn;
