import { cn } from "@/lib/utils";
import Loader from "./loader";

interface LoadingOverlayProps {
  isFetching: boolean;
  className?: string;
  loaderClassName?: string;
  children?: React.ReactNode;
}

const LoadingOverlay = ({
  isFetching,
  className,
  loaderClassName,
  children,
}: LoadingOverlayProps) => {
  if (!isFetching) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        {children || (
          <Loader className={cn("size-4", loaderClassName)} isPending={isFetching} />
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;

