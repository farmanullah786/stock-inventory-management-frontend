import { useMemo } from 'react';
import {
  useFetchStockInRecords,
} from '@/hooks/use-stock-in';
import { useFetchProducts } from '@/hooks/use-products';
import { useFetchUsers } from '@/hooks/use-user';
import { useUser } from '@/store/use-user-store';
import StockInFormDialog from '../../components/stock-in-form/stock-in-form';
import { canModifyInventory } from '@/lib/utils';
import { createStockInColumns } from '@/components/stock-in/columns';
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

const StockIn = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: stockInData,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchStockInRecords(queryOptions);
  const { data: productsData } = useFetchProducts();
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });

  // Adapt current backend response to paginated format
  const stockInRecords = isSuccess ? (stockInData?.data || []) : [];
  const rowCount = isSuccess ? (stockInData?.pagination?.rowCount || stockInRecords.length) : 0;

  const columns = useMemo(
    () => createStockInColumns(productsData?.data || [], usersData?.data || [], user?.role),
    [productsData?.data, usersData?.data, user?.role]
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
        <div className="space-y-6">
          <StockIn.Filters products={productsData?.data || []} />
          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={stockInRecords}
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

StockIn.Filters = ({ products }: { products: any[] }) => {
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
      title="Stock In"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Add Stock In",
              dialog: (
                <StockInFormDialog
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

export default StockIn;

