import { useMemo } from 'react';
import {
  useFetchStockOutRecords,
} from '@/hooks/use-stock-out';
import { useFetchProducts } from '@/hooks/use-products';
import { useFetchUsers } from '@/hooks/use-user';
import { useUser } from '@/store/use-user-store';
import StockOutFormDialog from '../../components/stock-out-form/stock-out-form';
import { canModifyInventory } from '@/lib/utils';
import { createStockOutColumns } from '@/components/stock-out/columns';
import { usePaginationQuery } from '@/hooks/use-pagination-query';
import { PageHeader } from '@/components/shared/page-header';
import { FilterCard } from '@/components/shared/filter-card';
import { SearchInput } from '@/components/shared/search-input';
import { ProductFilter } from '@/components/shared/product-filter';
import { DateRangeFilter } from '@/components/shared/date-range-filter';
import { Container } from '@/components/shared/container';
import Loader from '@/components/ui/loader';
import { ServerDataTable } from '@/components/shared/data-table/server-data-table';
import { ErrorDisplay } from '@/components/shared/error-display';

const StockOut = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: stockOutData,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockOutRecords(queryOptions);
  const { data: productsData } = useFetchProducts();
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });

  // Adapt current backend response to paginated format
  const stockOutRecords = isSuccess ? (stockOutData?.data || []) : [];
  const rowCount = isSuccess ? (stockOutData?.pagination?.rowCount || stockOutRecords.length) : 0;

  const columns = useMemo(
    () => createStockOutColumns(productsData?.data || [], usersData?.data || [], user?.role),
    [productsData?.data, usersData?.data, user?.role]
  );

  if (isError) {
    return (
      <>
        <Header />
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
      <Header />
      <Container>
        <div className="space-y-6">
          <StockOut.Filters products={productsData?.data || []} />
          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={stockOutRecords}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={rowCount}
              isFetching={isFetching && !isPending}
            />
          )}
        </div>
      </Container>
    </>
  );
};

StockOut.Filters = ({ products }: { products: any[] }) => {
  return (
    <FilterCard>
      <SearchInput />
      <ProductFilter products={products} />
      <DateRangeFilter />
    </FilterCard>
  );
};

const Header = () => {
  const { data: productsData } = useFetchProducts();
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });
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
                  products={productsData?.data || []}
                  users={usersData?.data || []}
                />
              ),
            }
          : undefined
      }
    />
  );
};

export default StockOut;

