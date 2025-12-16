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

interface DeleteDialogProps {
  title: string;
  description: string;
  warningMessage: string;
  onConfirm: () => void;
  isPending?: boolean;
  cancelText?: string;
  confirmText?: string;
}

export function DeleteDialog({
  title,
  description,
  warningMessage,
  onConfirm,
  isPending = false,
  cancelText = "Cancel",
  confirmText = "Delete",
}: DeleteDialogProps) {
  return (
    <AlertDialogContent className="border-destructive/50 p-0">
      <AlertDialogHeader className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDialogTitle className="text-destructive">
            {title}
          </AlertDialogTitle>
        </div>
      </AlertDialogHeader>
      <div className="flex-1 overflow-y-auto px-6">
        <AlertDialogDescription className="text-muted-foreground">
          {description}
          <br />
          <br />
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-destructive font-medium">
              {warningMessage}
            </span>
          </div>
        </AlertDialogDescription>
      </div>
      <AlertDialogFooter className="px-6 py-4 border-t bg-background">
        <AlertDialogCancel className="bg-background hover:bg-muted">
          {cancelText}
        </AlertDialogCancel>
        <Button
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : confirmText}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

