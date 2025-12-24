import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "@/hooks/use-purchase-request";
import { IPurchaseRequest } from "@/types/api";

type ActionType = "submit" | "approve" | "reject";

interface PurchaseRequestActionsProps {
  action: ActionType;
  purchaseRequest: IPurchaseRequest;
}

export const PurchaseRequestActions = ({
  action,
  purchaseRequest,
}: PurchaseRequestActionsProps) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const submitMutation = useSubmitPurchaseRequest();
  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();

  const handleAction = () => {
    if (action === "submit") {
      submitMutation.mutate(purchaseRequest.id);
    } else if (action === "approve") {
      approveMutation.mutate(purchaseRequest.id);
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        return;
      }
      rejectMutation.mutate({
        id: purchaseRequest.id,
        rejectionReason,
      });
      setRejectionReason("");
    }
  };

  const isPending =
    submitMutation.isPending || approveMutation.isPending || rejectMutation.isPending;

  const getContent = () => {
    switch (action) {
      case "submit":
        return {
          title: "Submit Purchase Request",
          description: "This purchase request will be submitted for manager/admin approval.",
          buttonText: "Submit",
          icon: CheckCircle2,
          iconColor: "text-primary",
          warningBox: null,
        };
      case "approve":
        return {
          title: "Approve Purchase Request",
          description: "This purchase request will be approved and ready for goods receipt creation.",
          buttonText: "Approve",
          icon: CheckCircle2,
          iconColor: "text-primary",
          warningBox: null,
        };
      case "reject":
        return {
          title: "Reject Purchase Request",
          description: "Please provide a reason for rejecting this purchase request.",
          buttonText: "Reject",
          icon: AlertTriangle,
          iconColor: "text-destructive",
          warningBox: null,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;
  const isReject = action === "reject";
  const borderClass = isReject ? "border-destructive/50" : "border-primary/50";

  if (isReject) {
    return (
      <DialogContent className={`${borderClass} p-0`}>
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${content.iconColor}`} />
            <DialogTitle className={content.iconColor}>{content.title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody>
          <DialogDescription className="text-muted-foreground">
            {content.description}
            <br />
            <br />
            <div className="space-y-2">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-destructive font-medium">
                  Warning: This action cannot be undone.
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogBody>
        <DialogFooter className="px-6 py-4 border-t bg-background">
          <DialogClose asChild>
            <Button variant="outline" className="bg-background hover:bg-muted" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleAction} disabled={isPending || !rejectionReason.trim()}>
            {isPending ? `${content.buttonText}ing...` : content.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className={`${borderClass} p-0`}>
      <DialogHeader className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${content.iconColor}`} />
          <DialogTitle className={content.iconColor}>{content.title}</DialogTitle>
        </div>
      </DialogHeader>
      <DialogBody>
        <DialogDescription className="text-muted-foreground">
          {content.description}
        </DialogDescription>
      </DialogBody>
      <DialogFooter className="px-6 py-4 border-t bg-background">
        <DialogClose asChild>
          <Button variant="outline" className="bg-background hover:bg-muted" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleAction} disabled={isPending}>
          {isPending ? `${content.buttonText}ing...` : content.buttonText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

