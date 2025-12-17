import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  showIcon?: boolean;
}

export const ErrorDisplay = ({
  error,
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  className = "",
  showIcon = true,
}: ErrorDisplayProps) => {
  const errorMessage = message || error?.message || "An unknown error occurred";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className
      )}
    >
      {showIcon && (
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {errorMessage}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-destructive/20 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

