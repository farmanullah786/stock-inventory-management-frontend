import { useMemo } from "react";
import { useFetchStockOutRecords } from "@/hooks/use-stock-out";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchUsers } from "@/hooks/use-user";
import { useUser } from "@/store/use-user-store";
import StockOutFormDialog from "../../components/stock-out-form/stock-out-form";
import { canModifyInventory } from "@/lib/utils";
import { createStockOutColumns } from "@/components/stock-out/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { ProductFilter } from "@/components/shared/product-filter";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Container } from "@/components/shared/container";
import Loader from "@/components/ui/loader";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";
import { IProduct, IUser } from "@/types/api";

const StockOut = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: stockOutRecords,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockOutRecords(queryOptions);
  const productsQuery = useFetchProducts();
  const usersQuery = useFetchUsers({ page: 1, limit: 1000 });

  // Extract data arrays once
  const products = productsQuery.isSuccess ? productsQuery.data.data : [];
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];

  const columns = useMemo(
    () => createStockOutColumns(products, users, user.role),
    [products, users, user.role]
  );

  if (isError) {
    return (
      <>
        <Header products={products} users={users} />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load stock out records"
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
          <StockOut.Filters products={products} />
          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={stockOutRecords.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={stockOutRecords.pagination.rowCount}
              isFetching={isFetching && !isPending}
            />
          )}
        </div>
      </Container>
    </>
  );
};

StockOut.Filters = ({ products }: { products: IProduct[] }) => {
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
      title="Stock Out"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Add Stock Out",
              dialog: (
                <StockOutFormDialog
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

export default StockOut;
