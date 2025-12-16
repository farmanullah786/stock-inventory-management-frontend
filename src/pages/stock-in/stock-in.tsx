import { useMemo, useState, useEffect } from 'react';
import {
  useFetchStockInRecords,
} from '@/hooks/use-stock-in';
import { useFetchProducts } from '@/hooks/use-products';
import { useFetchUsers } from '@/hooks/use-user';
import { useUser } from '@/store/use-user-store';
import StockInFormDialog from '../../components/stock-in-form/stock-in-form';
import { canModifyInventory } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductCombobox } from '@/components/ui/product-combobox';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ServerDataTable } from '@/components/shared/data-table/server-data-table';
import { createStockInColumns } from '@/components/stock-in/columns';
import { usePaginationQuery } from '@/hooks/use-pagination-query';
import Loader from '@/components/ui/loader';
import AppHeader from '@/layouts/app-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Container } from '@/components/shared/container';
import { Plus, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

const StockIn = () => {
  const { searchParams, setSearchParams } = usePaginationQuery();
  const { user } = useUser();

  const queryOptions: any = {
    ...Object.fromEntries(searchParams),
    productId: searchParams.get("productId")
      ? Number(searchParams.get("productId"))
      : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    search: searchParams.get("search") || undefined,
  };

  const { data: stockInData, isLoading, isFetching, isSuccess, error } = useFetchStockInRecords(queryOptions);
  const { data: productsData } = useFetchProducts();
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });

  // Adapt current backend response to paginated format
  const stockInRecords = isSuccess ? (stockInData?.data || []) : [];
  const rowCount = isSuccess ? (stockInData?.pagination?.rowCount || stockInRecords.length) : 0;

  const columns = useMemo(
    () => createStockInColumns(productsData?.data || [], usersData?.data || [], user?.role),
    [productsData?.data, usersData?.data, user?.role]
  );

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <div className="space-y-6">
          <StockIn.Filters products={productsData?.data || []} />

          <Loader isPending={isLoading} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={stockInRecords}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={rowCount}
              isFetching={isFetching && !isLoading}
            />
          )}
        </div>
      </Container>
    </>
  );
};

StockIn.Filters = ({ products }: { products: any[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [productFilter, setProductFilter] = useState<number | null>(
    searchParams.get("productId") ? Number(searchParams.get("productId")) : null
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(
    searchParams.get("startDate") && searchParams.get("endDate")
      ? {
          from: new Date(searchParams.get("startDate")!),
          to: new Date(searchParams.get("endDate")!),
        }
      : undefined
  );

  // Handle search term with debounce
  useEffect(() => {
    if (searchTerm !== searchParams.get("search")) {
      const timeout = setTimeout(() => {
        if (searchTerm) {
          searchParams.set("search", searchTerm);
        } else {
          searchParams.delete("search");
        }
        setSearchParams(searchParams);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm, searchParams, setSearchParams]);

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      searchParams.set("startDate", format(range.from, "yyyy-MM-dd"));
      searchParams.set("endDate", format(range.to, "yyyy-MM-dd"));
    } else {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
    }
    setSearchParams(searchParams);
  };

  // Handle product filter change
  const handleProductChange = (productId: number | null) => {
    setProductFilter(productId);
    if (productId === null) {
      searchParams.delete("productId");
    } else {
      searchParams.set("productId", String(productId));
    }
    setSearchParams(searchParams);
  };

  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <ProductCombobox
            products={products}
            selectedProductId={productFilter}
            onSelect={handleProductChange}
            placeholder="All Products"
          />

          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Date Range"
            className="w-full sm:w-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const Header = () => {
  const { data: productsData } = useFetchProducts();
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });
  const { user } = useUser();
  const canAdd = canModifyInventory(user?.role);

  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Stock In</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {canAdd && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock In
              </Button>
            </DialogTrigger>
            <StockInFormDialog
              action="create"
              products={productsData?.data || []}
              users={usersData?.data || []}
            />
          </Dialog>
        )}
      </div>
    </AppHeader>
  );
};

export default StockIn;

