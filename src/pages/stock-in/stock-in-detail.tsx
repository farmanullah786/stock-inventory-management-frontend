import React from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchStockIn } from "@/hooks/use-stock-in";
import { useParams } from "react-router-dom";
import StockInDetailHeader from "@/components/stock-in/stock-in-detail-header";
import { formatDate } from "@/lib/utils";
import { DEFAULT_CURRENCY } from "@/constants";

const StockInDetail = () => {
  const { id } = useParams<{ id: string }>();
  const stockInId = id ? parseInt(id, 10) : 0;

  const { data, isPending, isSuccess, isError, error } =
    useFetchStockIn(stockInId);

  if (isPending) {
    return (
      <>
        <StockInDetailHeader referenceNumber="Loading..." />
        <Container>
          <TableSkeleton columnCount={5} rowCount={5} />
        </Container>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StockInDetailHeader referenceNumber="Error" />
        <Container>
          <ErrorDisplay
            error={error as Error}
            title="Failed to load stock in record"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  return (
    isSuccess &&
    data && (
      <>
        <StockInDetailHeader referenceNumber={data.referenceNumber || `Stock In #${data.id}`}>
        </StockInDetailHeader>
        <Container>
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Reference Number" value={data.referenceNumber || `Stock In #${data.id}`} />
                <DetailItem
                  label="Product"
                  value={data.product ? `${data.product.name} (${data.product.category?.name || 'N/A'})` : "-"}
                />
                <DetailItem
                  label="Date"
                  value={formatDate(data.date)}
                />
                <DetailItem
                  label="Quantity"
                  value={`${data.quantity} ${data.product?.unit || ""}`}
                />
                <DetailItem
                  label="Unit Price"
                  value={`${(Number(data.unitPrice) || 0).toFixed(2)} ${data.currency || DEFAULT_CURRENCY}`}
                />
                <DetailItem
                  label="Total Price"
                  value={`${(Number(data.totalPrice) || 0).toFixed(2)} ${data.currency || DEFAULT_CURRENCY}`}
                />
                {data.poNumber && (
                  <DetailItem label="PO Number" value={data.poNumber} />
                )}
                {data.invoiceNo && (
                  <DetailItem label="Invoice N/O" value={data.invoiceNo} />
                )}
                {data.vendorName && (
                  <DetailItem label="Vendor Name" value={data.vendorName} />
                )}
                {data.grnNo && (
                  <DetailItem label="GRN N/O" value={data.grnNo} />
                )}
                {data.stockKeeper && (
                  <DetailItem
                    label="Stock Keeper"
                    value={`${data.stockKeeper.firstName} ${data.stockKeeper.lastName || ""}`.trim()}
                  />
                )}
                {data.creator && (
                  <DetailItem
                    label="Created By"
                    value={`${data.creator.firstName} ${data.creator.lastName || ""}`.trim()}
                  />
                )}
                {data.remarks && (
                  <div className="md:col-span-2">
                    <DetailItem label="Remarks" value={data.remarks} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </>
    )
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-base">{value}</div>
    </div>
  );
};

export default StockInDetail;

