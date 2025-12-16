import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface AppHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const AppHeader = ({
  children,
  className,
  ...props
}: AppHeaderProps) => {
  const { state: sidebarState, isMobile } = useSidebar();
  const isSidebarExpanded = sidebarState === "expanded";

  return (
    <>
      <header
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 fixed right-0 z-50 bg-bg shadow-sm transition-all duration-300",
          isSidebarExpanded && !isMobile ? "w-[calc(100%-16.2rem)]" : "w-full",
          className
        )}
        {...props}
      >
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">{children}</div>
      </header>
      <div className="h-16" />
    </>
  );
};

export default AppHeader;

