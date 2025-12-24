import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchPurchaseRequest } from "@/hooks/use-purchase-request";
import PurchaseRequestForm from "@/components/purchase-request/purchase-request-form";
import { useParams } from "react-router-dom";
import { IPurchaseRequest } from "@/types/api";
import { PurchaseRequestFormData } from "@/schemas/purchase-request-schema";
import { DEFAULT_CURRENCY } from "@/constants";

const EditPurchaseRequest = () => {
  const { id } = useParams<{ id: string }>();
  const purchaseRequestId = id ? parseInt(id, 10) : 0;

  const { data, isPending, isSuccess, isError, error } =
    useFetchPurchaseRequest(purchaseRequestId);

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
          title="Failed to load purchase request"
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    isSuccess &&
    data && (
      <PurchaseRequestForm
        action="update"
        purchaseRequest={generatedUpdatedValues(data)}
        purchaseRequestId={purchaseRequestId}
      />
    )
  );
};

const generatedUpdatedValues = (
  data: IPurchaseRequest
): PurchaseRequestFormData => ({
  requestedDate: data.requestedDate,
  status: data.status,
  priority: data.priority,
  justification: data.justification || "",
  currency: data.currency || DEFAULT_CURRENCY,
  items:
    data.items?.map((item) => ({
      productName: item.productName || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      currency: item.currency || DEFAULT_CURRENCY,
      justification: item.justification || "",
      specifications: item.specifications || "",
    })) || [],
});

export default EditPurchaseRequest;
