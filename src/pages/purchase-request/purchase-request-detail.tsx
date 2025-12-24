import React from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchPurchaseRequest } from "@/hooks/use-purchase-request";
import { useParams } from "react-router-dom";
import PurchaseRequestDetailHeader from "@/components/purchase-request/purchase-request-detail-header";
import { formatDate, canModifyInventory } from "@/lib/utils";
import {
  getPurchaseRequestStatusBadge,
  getPriorityBadge,
} from "@/lib/badge-helpers";
import { DEFAULT_CURRENCY } from "@/constants";
import { useUser } from "@/store/use-user-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TruncatedText } from "@/components/shared/truncated-text";

const PurchaseRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const purchaseRequestId = id ? parseInt(id, 10) : 0;
  const { user } = useUser();

  const { data, isPending, isSuccess, isError, error } =
    useFetchPurchaseRequest(purchaseRequestId);

  if (isPending) {
    return (
      <>
        <PurchaseRequestDetailHeader prNumber="Loading..." />
        <Container>
          <TableSkeleton columnCount={5} rowCount={5} />
        </Container>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PurchaseRequestDetailHeader prNumber="Error" />
        <Container>
          <ErrorDisplay
            error={error as Error}
            title="Failed to load purchase request"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  const canEditRole = canModifyInventory(user?.role || "");
  // Only the creator can edit their own draft purchase request
  const canEdit =
    canEditRole &&
    data.status === "draft" &&
    user?.id &&
    data.requestedBy === user.id;

  return (
    isSuccess &&
    data && (
      <>
        <PurchaseRequestDetailHeader prNumber={data.prNumber}>
          <PurchaseRequestDetailHeader.Actions
            purchaseRequestId={data.id}
            canEdit={canEdit}
          />
        </PurchaseRequestDetailHeader>
        <Container>
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="PR Number" value={data.prNumber} />
                <DetailItem
                  label="Total Estimated Cost"
                  value={`${(Number(data.totalEstimatedCost) || 0).toFixed(
                    2
                  )} ${data.currency || DEFAULT_CURRENCY}`}
                />
                <DetailItem
                  label="Status"
                  value={getPurchaseRequestStatusBadge(data.status)}
                />
                <DetailItem
                  label="Priority"
                  value={getPriorityBadge(data.priority)}
                />
                <DetailItem
                  label="Requested Date"
                  value={formatDate(data.requestedDate)}
                />
                <DetailItem
                  label="Requested By"
                  value={
                    data.requester
                      ? `${data.requester.firstName} ${
                          data.requester.lastName || ""
                        }`.trim()
                      : "-"
                  }
                />
                {data.approvedBy && data.approvedAt && (
                  <>
                    <DetailItem
                      label="Approved By"
                      value={
                        data.approver
                          ? `${data.approver.firstName} ${
                              data.approver.lastName || ""
                            }`.trim()
                          : "-"
                      }
                    />
                    <DetailItem
                      label="Approved At"
                      value={formatDate(data.approvedAt)}
                    />
                  </>
                )}
                {data.rejectedBy && data.rejectedAt && (
                  <>
                    <DetailItem
                      label="Rejected By"
                      value={
                        data.rejector
                          ? `${data.rejector.firstName} ${
                              data.rejector.lastName || ""
                            }`.trim()
                          : "-"
                      }
                    />
                    <DetailItem
                      label="Rejected At"
                      value={formatDate(data.rejectedAt)}
                    />
                  </>
                )}
                {data.justification && (
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Justification"
                      value={data.justification}
                    />
                  </div>
                )}

                {data.rejectionReason && (
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Rejection Reason"
                      value={data.rejectionReason}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Items</h2>
              {data.items && data.items.length > 0 ? (
                <div className="space-y-4 bg-bg border rounded-md">
                  <div className="relative overflow-hidden rounded-md border-b rounded-b-none">
                    <Table className="table-fixed w-full">
                      <TableHeader>
                        <TableRow className="font-semibold bg-bg-gray border-b border-border">
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-left">
                            Product Name
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Quantity
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Unit Price
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Total Price
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Quantity Received
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-left">
                            Justification
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-right">
                            Specifications
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.items.map((item, index) => (
                          <TableRow
                            key={item.id || index}
                            className={cn(
                              index % 2 === 0 ? "bg-bg" : "bg-bg-gray"
                            )}
                          >
                            <TableCell className="text-left">
                              <TruncatedText
                                text={item.productName}
                                className="text-left block"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.unitPrice !== undefined &&
                              item.unitPrice !== null
                                ? `${(Number(item.unitPrice) || 0).toFixed(
                                    2
                                  )} ${
                                    item.currency ||
                                    data.currency ||
                                    DEFAULT_CURRENCY
                                  }`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalPrice !== undefined &&
                              item.totalPrice !== null
                                ? `${(Number(item.totalPrice) || 0).toFixed(
                                    2
                                  )} ${
                                    item.currency ||
                                    data.currency ||
                                    DEFAULT_CURRENCY
                                  }`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantityReceived !== undefined &&
                              item.quantityReceived > 0
                                ? item.quantityReceived
                                : "-"}
                            </TableCell>
                            <TableCell className="text-left">
                              <TruncatedText
                                text={item.justification || undefined}
                                className="text-left block"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <TruncatedText
                                text={item.specifications || undefined}
                                className="text-right block"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-bg border rounded-md">
                  <div className="relative overflow-hidden rounded-md border-b rounded-b-none">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center odoo-text text-text-muted"
                          >
                            No items found.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
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

export default PurchaseRequestDetail;
