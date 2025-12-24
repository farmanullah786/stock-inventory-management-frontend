import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeletePurchaseRequest } from "@/hooks/use-purchase-request";

export function DeletePurchaseRequestAlert({
  purchaseRequestId,
}: {
  purchaseRequestId: number;
}) {
  const deleteMutation = useDeletePurchaseRequest();

  const handleDelete = () => {
    deleteMutation.mutate(purchaseRequestId);
  };

  return (
    <AlertDialogContent className="border-destructive/50 p-0">
      <AlertDialogHeader className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDialogTitle className="text-destructive">
            Delete Purchase Request
          </AlertDialogTitle>
        </div>
      </AlertDialogHeader>
      <div className="flex-1 overflow-y-auto px-6">
        <AlertDialogDescription className="text-muted-foreground">
          This action cannot be undone. This will permanently delete the purchase request and all
          associated data.
          <br />
          <br />
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-destructive font-medium">
              Warning: This action is irreversible. Are you sure you want to continue?
            </span>
          </div>
        </AlertDialogDescription>
      </div>
      <AlertDialogFooter className="px-6 py-4 border-t bg-background">
        <AlertDialogCancel className="bg-background hover:bg-muted">
          Cancel
        </AlertDialogCancel>
        <Button onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

