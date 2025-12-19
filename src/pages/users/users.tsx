import { useFetchUsers } from "@/hooks/use-user";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { userColumns } from "@/components/user/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { Container } from "@/components/shared/container";
import { UserForm } from "@/components/user/user-form-dialog";
import { ErrorDisplay } from "@/components/shared/error-display";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { RoleSelect } from "@/components/shared/role-select";
import { UserStatusSelect } from "@/components/shared/user-status-select";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { useUser } from "@/store/use-user-store";
import { useMemo } from "react";

const Users = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const { data, isPending, isFetching, isSuccess, isError, error } =
    useFetchUsers(queryOptions);

  const columns = useMemo(() => userColumns(user.role), [user.role]);

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load users"
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
          <Users.Filters />
          {isPending ? (
            <TableSkeleton columnCount={columns.length} rowCount={10} />
          ) : isSuccess ? (
            <ServerDataTable
              columns={columns}
              data={data.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={data.pagination.rowCount}
              isFetching={isFetching && !isPending}
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

Users.Filters = () => {
  return (
    <FilterCard>
      <SearchInput />
      <RoleSelect />
      <UserStatusSelect />
    </FilterCard>
  );
};

const Header = () => {
  return (
    <PageHeader
      title="Users"
      actionButton={{
        label: "Add New User",
        dialog: <UserForm action="create" />,
      }}
    />
  );
};

export default Users;
