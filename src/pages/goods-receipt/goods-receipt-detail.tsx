import React from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Container } from "@/components/shared/container";
import { useFetchGoodsReceipt } from "@/hooks/use-goods-receipt";
import { useParams } from "react-router-dom";
import GoodsReceiptDetailHeader from "@/components/goods-receipt/goods-receipt-detail-header";
import { formatDate, canModifyInventory } from "@/lib/utils";
import {
  getGoodsReceiptStatusBadge,
  getConditionBadge,
} from "@/lib/badge-helpers";
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

const GoodsReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const goodsReceiptId = id ? parseInt(id, 10) : 0;
  const { user } = useUser();

  const { data, isPending, isSuccess, isError, error } =
    useFetchGoodsReceipt(goodsReceiptId);

  if (isPending) {
    return (
      <>
        <GoodsReceiptDetailHeader grnNumber="Loading..." />
        <Container>
          <TableSkeleton columnCount={5} rowCount={5} />
        </Container>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <GoodsReceiptDetailHeader grnNumber="Error" />
        <Container>
          <ErrorDisplay
            error={error as Error}
            title="Failed to load goods receipt"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  const canEditRole = canModifyInventory(user?.role || "");
  // Only the creator (receiver/owner) can edit their own goods receipt, and only when not verified
  const canEdit =
    canEditRole &&
    user?.id &&
    data.receivedBy === user.id &&
    !data.verifiedBy; // Cannot edit if already verified

  return (
    isSuccess &&
    data && (
      <>
        <GoodsReceiptDetailHeader grnNumber={data.grnNumber}>
          <GoodsReceiptDetailHeader.Actions
            goodsReceiptId={data.id}
            canEdit={canEdit}
          />
        </GoodsReceiptDetailHeader>
        <Container>
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="GRN Number" value={data.grnNumber} />
                <DetailItem
                  label="PR Number"
                  value={data.purchaseRequest?.prNumber || "-"}
                />
                <DetailItem
                  label="Status"
                  value={getGoodsReceiptStatusBadge(data.status)}
                />
                <DetailItem
                  label="Condition"
                  value={getConditionBadge(data.condition)}
                />
                <DetailItem
                  label="Received Date"
                  value={formatDate(data.receivedDate)}
                />

                <DetailItem
                  label="Received By"
                  value={
                    data.receiver
                      ? `${data.receiver.firstName} ${
                          data.receiver.lastName || ""
                        }`.trim()
                      : "-"
                  }
                />
                {data.verifiedBy && (
                  <DetailItem
                    label="Verified By"
                    value={
                      data.verifier
                        ? `${data.verifier.firstName} ${
                            data.verifier.lastName || ""
                          }`.trim()
                        : "-"
                    }
                  />
                )}
                {data.remarks && (
                  <div className="md:col-span-2">
                    <DetailItem label="Remarks" value={data.remarks} />
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
                            Quantity Expected
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Quantity Received
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-center">
                            Condition
                          </TableHead>
                          <TableHead className="font-semibold odoo-text text-text-muted w-full text-left">
                            Remarks
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
                                text={item.productName || "-"}
                                className="text-left block"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantityExpected}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantityReceived}
                            </TableCell>
                            <TableCell className="text-center">
                              {getConditionBadge(item.condition)}
                            </TableCell>
                            <TableCell className="text-left">
                              <TruncatedText
                                text={item.remarks || undefined}
                                className="text-left block"
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
                            colSpan={5}
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

export default GoodsReceiptDetail;
