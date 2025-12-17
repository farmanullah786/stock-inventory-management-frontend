import { useMemo } from "react";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchCategories } from "@/hooks/use-categories";
import { ICategory } from "@/types/api";
import { useUser } from "@/store/use-user-store";
import ProductFormDialog from "../../components/product-form/product-form";
import { canManageProducts } from "@/lib/utils";
import { createProductColumns } from "@/components/product/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { StatusSelect } from "@/components/shared/status-select";
import { CategoryFilter } from "@/components/shared/category-filter";
import { Container } from "@/components/shared/container";
import Loader from "@/components/ui/loader";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";

const ProductManagement = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();

  const { data, isPending, isFetching, isSuccess, isError, error } =
    useFetchProducts(queryOptions);

  const { user } = useUser();
  const columns = useMemo(() => createProductColumns(user.role), [user.role]);

  const categories = useFetchCategories({
    isActive: true,
    limit: 1000,
  });

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load products"
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
          <ProductManagement.Filters
            categories={categories.isSuccess ? categories.data.data : []}
          />
          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={data.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={data.pagination.rowCount}
              isFetching={isFetching && !isPending}
            />
          )}
        </div>
      </Container>
    </>
  );
};

ProductManagement.Filters = ({ categories }: { categories: ICategory[] }) => {
  return (
    <FilterCard>
      <SearchInput />
      <CategoryFilter categories={categories} />
      <StatusSelect />
    </FilterCard>
  );
};

const Header = () => {
  const { user } = useUser();
  return (
    <PageHeader
      title="Products"
      actionButton={
        canManageProducts(user?.role)
          ? {
              label: "Add Product",
              dialog: <ProductFormDialog action="create" />,
            }
          : undefined
      }
    />
  );
};

export default ProductManagement;
