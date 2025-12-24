import { useBlocker } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";
import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

const UnsavedChangesPrompt = () => {
  const form = useFormContext();
  const blocker = useBlocker(
    form.formState.isDirty && !form.formState.isSubmitSuccessful
  );

  const handleClose = () => blocker.reset?.();
  const handleConfirm = () => blocker.proceed?.();

  return (
    <AlertDialog open={blocker.state === "blocked"} onOpenChange={handleClose}>
      <AlertDialogContent className="border-primary/50 p-0">
        <AlertDialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <AlertDialogTitle className="text-primary">
              You've unsaved changes.
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <AlertDialogDescription className="text-muted-foreground">
            You have unsaved changes in your work. If you leave or navigate
            away, these changes will be lost and cannot be recovered. Do you
            want to continue without saving?
            <br />
            <br />
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md border border-primary/20">
              <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-primary font-medium">
                Warning: Any unsaved work may be lost. Are you sure you want to
                continue?
              </span>
            </div>
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={handleClose} className="bg-background hover:bg-muted">
            Continue Editing
          </Button>
          <Button onClick={handleConfirm}>Discard</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesPrompt;

