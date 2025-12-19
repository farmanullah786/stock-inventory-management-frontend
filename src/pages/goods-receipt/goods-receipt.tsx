import { useMemo } from "react";
import { useFetchGoodsReceipts } from "@/hooks/use-goods-receipt";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchUsers } from "@/hooks/use-user";
import { useUser } from "@/store/use-user-store";
import GoodsReceiptFormDialog from "../../components/goods-receipt-form/goods-receipt-form";
import { canModifyInventory } from "@/lib/utils";
import { goodsReceiptColumns } from "@/components/goods-receipt/columns";
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
import { useSearchParams } from "react-router-dom";

const GoodsReceipt = () => {
  const { searchParams, setSearchParams, queryOptions } = usePaginationQuery();
  const { user } = useUser();

  const {
    data: goodsReceipts,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useFetchGoodsReceipts(queryOptions);
  const productsQuery = useFetchProducts();
  const usersQuery = useFetchUsers({ page: 1, limit: 1000 });

  // Extract data arrays once
  const products = productsQuery.isSuccess ? productsQuery.data.data : [];
  const users = usersQuery.isSuccess ? usersQuery.data.data : [];

  const columns = useMemo(
    () => goodsReceiptColumns(products, users, user.role),
    [products, users, user.role]
  );

  if (isError) {
    return (
      <>
        <Header products={products} users={users} />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load goods receipts"
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
          <GoodsReceipt.Filters />
          {isPending ? (
            <TableSkeleton columnCount={columns.length} rowCount={10} />
          ) : isSuccess ? (
            <ServerDataTable
              columns={columns}
              data={goodsReceipts.data}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={goodsReceipts.pagination.rowCount || 0}
              isFetching={isFetching && !isPending}
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

GoodsReceipt.Filters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
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
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="complete">Complete</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
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
      title="Goods Receipt"
      actionButton={
        canModifyInventory(user?.role)
          ? {
              label: "Create Goods Receipt",
              dialog: (
                <GoodsReceiptFormDialog
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

export default GoodsReceipt;

