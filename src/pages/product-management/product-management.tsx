import { useMemo, useState, useEffect } from 'react';
import { useFetchProducts } from '@/hooks/use-products';
import { useFetchCategories } from '@/hooks/use-categories';
import { useUser } from '@/store/use-user-store';
import ProductFormDialog from '../../components/product-form/product-form';
import { canManageProducts } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CategoryCombobox } from '@/components/ui/category-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ServerDataTable } from '@/components/shared/data-table/server-data-table';
import { createProductColumns } from '@/components/product/columns';
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

const ProductManagement = () => {
  const { searchParams, setSearchParams } = usePaginationQuery();

  const queryOptions: any = {
    ...Object.fromEntries(searchParams),
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined,
    isActive: searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined,
    search: searchParams.get("search") || undefined,
  };

  const { data, isLoading, isFetching, isSuccess, error } = useFetchProducts(queryOptions);

  // Adapt current backend response to paginated format
  const products = isSuccess ? (data?.data || []) : [];
  const rowCount = isSuccess ? (data?.pagination?.rowCount || products.length) : 0;

  const columns = useMemo(
    () => createProductColumns(),
    []
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
          <ProductManagement.Filters />

          <Loader isPending={isLoading} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={products}
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

ProductManagement.Filters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState<number | null>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("isActive") || "all"
  );

  const { data: categoriesData } = useFetchCategories({
    isActive: true,
    limit: 1000,
  });
  const categories = categoriesData?.data || [];

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

  // Handle filter changes
  const handleFilterChange = (name: string, value: string | number | null) => {
    if (name === "categoryId") {
      setCategoryFilter(value as number | null);
    } else if (name === "isActive") {
      setStatusFilter(value as string);
    }

    if (value && value !== "all" && value !== null) {
      searchParams.set(name, String(value));
    } else {
      searchParams.delete(name);
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

          <CategoryCombobox
            categories={categories}
            selectedCategoryId={categoryFilter}
            onSelect={(categoryId) => handleFilterChange("categoryId", categoryId)}
            placeholder="All Categories"
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange("isActive", value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

const Header = () => {
  const { user } = useUser();
  const canAdd = canManageProducts(user?.role);

  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Products</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {canAdd && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <ProductFormDialog action="create" />
          </Dialog>
        )}
      </div>
    </AppHeader>
  );
};

export default ProductManagement;

