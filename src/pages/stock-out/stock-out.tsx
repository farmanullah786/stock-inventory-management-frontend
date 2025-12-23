import { useMemo } from "react";
import { useFetchStockOutRecords } from "@/hooks/use-stock-out";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchUsers } from "@/hooks/use-user";
import { useFetchStockSummary } from "@/hooks/use-stock-summary";
import { useUser } from "@/store/use-user-store";
import StockOutFormDialog from "../../components/stock-out-form/stock-out-form";
import { canModifyInventory } from "@/lib/utils";
import { stockOutColumns } from "@/components/stock-out/columns";
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
import { IProduct, IUser, IStockSummary } from "@/types/api";

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
  const stockSummaryQuery = useFetchStockSummary({ limit: 10000 }); // Fetch all for filtering

  // Extract data arrays once
  const allProducts = productsQuery.isSuccess ? productsQuery.data.data : [];
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];
  const stockSummary = stockSummaryQuery.isSuccess ? stockSummaryQuery.data.data : [];

  // Create a map of productId -> availableStock
  const availableStockMap = useMemo(() => {
    const map = new Map<number, number>();
    stockSummary.forEach((item: IStockSummary) => {
      map.set(item.productId, item.availableStock || 0);
    });
    return map;
  }, [stockSummary]);

  // Filter products to only show those with available stock > 0
  const products = useMemo(() => {
    return allProducts.filter((product: IProduct) => {
      const availableStock = availableStockMap.get(product.id) || 0;
      return availableStock > 0;
    });
  }, [allProducts, availableStockMap]);

  const columns = useMemo(
    () => stockOutColumns(products, users, user.role),
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
        <div className="space-y-4">
          <StockOut.Filters products={allProducts} />
          {isPending ? (
            <TableSkeleton columnCount={columns.length} rowCount={10} />
          ) : isSuccess ? (
            <ServerDataTable
              columns={columns}
              data={stockOutRecords.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={stockOutRecords.pagination.rowCount}
              isFetching={isFetching && !isPending}
            />
          ) : null}
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
