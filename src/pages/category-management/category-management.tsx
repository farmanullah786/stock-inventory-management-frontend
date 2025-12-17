import { useMemo } from "react";
import { useFetchCategories } from "@/hooks/use-categories";
import { useUser } from "@/store/use-user-store";
import CategoryFormDialog from "../../components/category-form/category-form";
import { canManageProducts } from "@/lib/utils";
import { createCategoryColumns } from "@/components/category/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { StatusSelect } from "@/components/shared/status-select";
import { Container } from "@/components/shared/container";
import Loader from "@/components/ui/loader";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";

const CategoryManagement = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();

  const {
    data,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchCategories(queryOptions);

  // Adapt current backend response to paginated format
  const categories = isSuccess ? data?.data || [] : [];
  const rowCount = isSuccess
    ? data?.pagination?.rowCount || categories.length
    : 0;

  const { user } = useUser();
  const columns = useMemo(() => createCategoryColumns(user?.role), [user?.role]);

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load categories"
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
          <CategoryManagement.Filters />
          <Loader isPending={isPending} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={categories}
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

CategoryManagement.Filters = () => {
  return (
    <FilterCard>
      <SearchInput />
      <StatusSelect />
    </FilterCard>
  );
};

const Header = () => {
  const { user } = useUser();
  return (
    <PageHeader
      title="Category Management"
      actionButton={
        canManageProducts(user?.role)
          ? {
              label: "Add Category",
              dialog: <CategoryFormDialog action="create" />,
            }
          : undefined
      }
    />
  );
};

export default CategoryManagement;
