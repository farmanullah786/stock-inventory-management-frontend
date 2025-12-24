import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { useVerifyGoodsReceipt } from "@/hooks/use-goods-receipt";
import { IGoodsReceipt } from "@/types/api";

interface GoodsReceiptActionsProps {
  goodsReceipt: IGoodsReceipt;
}

export const GoodsReceiptActions = ({
  goodsReceipt,
}: GoodsReceiptActionsProps) => {
  const verifyMutation = useVerifyGoodsReceipt();

  const handleVerify = () => {
    verifyMutation.mutate(goodsReceipt.id);
  };

  const isPending = verifyMutation.isPending;

  return (
    <DialogContent className="border-primary/50 p-0">
      <DialogHeader className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <DialogTitle className="text-primary">Verify Goods Receipt</DialogTitle>
        </div>
      </DialogHeader>
      <DialogBody>
        <DialogDescription className="text-muted-foreground">
          This goods receipt will be verified and stock will be added to inventory.
        </DialogDescription>
      </DialogBody>
      <DialogFooter className="px-6 py-4 border-t bg-background">
        <DialogClose asChild>
          <Button variant="outline" className="bg-background hover:bg-muted" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleVerify} disabled={isPending}>
          {isPending ? "Verifying..." : "Verify"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

