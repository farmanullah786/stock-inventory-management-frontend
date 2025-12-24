import { useMemo } from "react";
import { useFetchPurchaseRequests } from "@/hooks/use-purchase-request";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchUsers } from "@/hooks/use-user";
import { useUser } from "@/store/use-user-store";
import { canModifyInventory } from "@/lib/utils";
import { purchaseRequestColumns } from "@/components/purchase-request/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import { PageHeader } from "@/components/shared/page-header";
import { FilterCard } from "@/components/shared/filter-card";
import { SearchInput } from "@/components/shared/search-input";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Container } from "@/components/shared/container";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { IProduct, IUser } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";

const PurchaseRequest = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: purchaseRequests,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchPurchaseRequests(queryOptions);
  const productsQuery = useFetchProducts();
  const usersQuery = useFetchUsers({ page: 1, limit: 1000 });

  // Extract data arrays once
  const products = productsQuery.isSuccess ? productsQuery.data.data : [];
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];

  const columns = useMemo(
    () => purchaseRequestColumns(users, user),
    [users, user]
  );

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load purchase requests"
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
        <div className="space-y-4">
          <PurchaseRequest.Filters />
          {isPending ? (
            <TableSkeleton columnCount={columns.length} rowCount={10} />
          ) : isSuccess ? (
            <ServerDataTable
              columns={columns}
              data={purchaseRequests.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={purchaseRequests.pagination.rowCount || 0}
              isFetching={isFetching && !isPending}
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

PurchaseRequest.Filters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
  };

  const handlePriorityChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("priority");
    } else {
      searchParams.set("priority", value);
    }
    setSearchParams(searchParams);
  };

  return (
    <FilterCard>
      <SearchInput />
      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("priority") || "all"}
        onValueChange={handlePriorityChange}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
      <DateRangeFilter />
    </FilterCard>
  );
};

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  return (
    <PageHeader
      title="Purchase Requests"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Create Purchase Request",
              onClick: () => navigate("/purchase-requests/create"),
            }
          : undefined
      }
    />
  );
};

export default PurchaseRequest;

