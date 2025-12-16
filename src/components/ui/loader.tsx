import { cn } from "@/lib/utils";

interface LoaderProps {
  isPending: boolean;
  className?: string;
}

const Loader = ({ isPending, className }: LoaderProps) => {
  if (!isPending) return null;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;

