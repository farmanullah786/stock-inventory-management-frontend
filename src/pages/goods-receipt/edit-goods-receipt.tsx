import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchGoodsReceipt } from "@/hooks/use-goods-receipt";
import GoodsReceiptForm from "@/components/goods-receipt/goods-receipt-form";
import { useParams } from "react-router-dom";
import { IGoodsReceipt } from "@/types/api";
import { GoodsReceiptFormData } from "@/schemas/goods-receipt-schema";

const EditGoodsReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const goodsReceiptId = id ? parseInt(id, 10) : 0;

  const { data, isPending, isSuccess, isError, error } =
    useFetchGoodsReceipt(goodsReceiptId);

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
          title="Failed to load goods receipt"
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    isSuccess &&
    data && (
      <GoodsReceiptForm
        action="update"
        goodsReceipt={generateUpdatedValues(data)}
        goodsReceiptId={goodsReceiptId}
      />
    )
  );
};

const generateUpdatedValues = (data: IGoodsReceipt): GoodsReceiptFormData => ({
  purchaseRequestId: data.purchaseRequestId || 0,
  receivedDate: data.receivedDate,
  status: data.status,
  condition: data.condition,
  remarks: data.remarks || "",
  items:
    data.items?.map((item) => ({
      productId: item.productId,
      quantityReceived: item.quantityReceived,
      quantityExpected: item.quantityExpected,
      condition: item.condition,
      remarks: item.remarks || "",
    })) || [],
});

export default EditGoodsReceipt;

