import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchStockIn } from "@/hooks/use-stock-in";
import StockInForm from "@/components/stock-in/stock-in-form";
import { useParams } from "react-router-dom";
import { IStockIn } from "@/types/api";
import { StockInUpdateFormData } from "@/schemas/stock-in-schema";
import { DEFAULT_CURRENCY } from "@/constants";

const EditStockIn = () => {
  const { id } = useParams<{ id: string }>();
  const stockInId = id ? parseInt(id, 10) : 0;

  const { data, isPending, isSuccess, isError, error } =
    useFetchStockIn(stockInId);

  if (isPending) {
    return (
      <Container>
        <TableSkeleton columnCount={5} rowCount={5} />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ErrorDisplay
          error={error as Error}
          title="Failed to load stock in record"
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    isSuccess &&
    data && (
      <StockInForm
        action="update"
        stockIn={generatedUpdatedValues(data)}
        stockInId={stockInId}
      />
    )
  );
};

const generatedUpdatedValues = (data: IStockIn): StockInUpdateFormData & { productId?: number } => ({
  goodsReceiptId: data.goodsReceiptId || 0,
  productName: data.product?.name || "",
  productId: data.productId, // Include productId for matching GR items
  invoiceNo: data.invoiceNo || "",
  vendorName: data.vendorName || "",
  stockKeeperId: data.stockKeeperId,
  status: data.status || "validated",
  remarks: data.remarks || "",
});

export default EditStockIn;

