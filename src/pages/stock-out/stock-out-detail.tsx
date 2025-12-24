import React from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchStockOut } from "@/hooks/use-stock-out";
import { useParams } from "react-router-dom";
import StockOutDetailHeader from "@/components/stock-out/stock-out-detail-header";
import { formatDate } from "@/lib/utils";
import { getStockOutStatusBadge } from "@/lib/badge-helpers";

const StockOutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const stockOutId = id ? parseInt(id, 10) : 0;

  const { data, isPending, isSuccess, isError, error } =
    useFetchStockOut(stockOutId);

  if (isPending) {
    return (
      <>
        <StockOutDetailHeader referenceNumber="Loading..." />
        <Container>
          <TableSkeleton columnCount={5} rowCount={5} />
        </Container>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StockOutDetailHeader referenceNumber="Error" />
        <Container>
          <ErrorDisplay
            error={error as Error}
            title="Failed to load stock out record"
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
        <StockOutDetailHeader referenceNumber={data.referenceNumber || `Stock Out #${data.id}`}>
        </StockOutDetailHeader>
        <Container>
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Reference Number" value={data.referenceNumber || `Stock Out #${data.id}`} />
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
                  label="Status"
                  value={getStockOutStatusBadge(data.status || "draft")}
                />
                {data.issuedTo && (
                  <DetailItem
                    label="Issued To"
                    value={`${data.issuedTo.firstName} ${data.issuedTo.lastName || ""}`.trim()}
                  />
                )}
                {data.technician && (
                  <DetailItem
                    label="Technician"
                    value={`${data.technician.firstName} ${data.technician.lastName || ""}`.trim()}
                  />
                )}
                {data.site && (
                  <DetailItem label="Site" value={data.site} />
                )}
                {data.location && (
                  <DetailItem label="Location/Warehouse" value={data.location} />
                )}
                {data.scheduledDate && (
                  <DetailItem
                    label="Scheduled Date"
                    value={formatDate(data.scheduledDate)}
                  />
                )}
                {data.requestNumber && (
                  <DetailItem label="Request Number" value={data.requestNumber} />
                )}
                {data.destinationDocument && (
                  <DetailItem label="Destination Document" value={data.destinationDocument} />
                )}
                {data.creator && (
                  <DetailItem
                    label="Created By"
                    value={`${data.creator.firstName} ${data.creator.lastName || ""}`.trim()}
                  />
                )}
                {data.validator && (
                  <DetailItem
                    label="Validated By"
                    value={`${data.validator.firstName} ${data.validator.lastName || ""}`.trim()}
                  />
                )}
                {data.validatedAt && (
                  <DetailItem
                    label="Validated At"
                    value={formatDate(data.validatedAt)}
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

export default StockOutDetail;

