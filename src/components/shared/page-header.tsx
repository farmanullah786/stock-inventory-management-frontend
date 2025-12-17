import { ReactNode } from "react";
import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface PageHeaderProps {
  title: string;
  actionButton?: {
    label: string;
    dialog: ReactNode;
  };
}

export const PageHeader = ({ title, actionButton }: PageHeaderProps) => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">{title}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {actionButton && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {actionButton.label}
              </Button>
            </DialogTrigger>
            {actionButton.dialog}
          </Dialog>
        )}
      </div>
    </AppHeader>
  );
};

