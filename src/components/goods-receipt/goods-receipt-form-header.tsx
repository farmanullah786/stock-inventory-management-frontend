import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";

interface GoodsReceiptFormHeaderProps {
  action: "create" | "update";
  isPending?: boolean;
}

const GoodsReceiptFormHeader = ({
  action,
  isPending,
}: GoodsReceiptFormHeaderProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(routesConfig.app.goodsReceipts);
  };

  const currentPageTitle =
    action === "create" ? "Create Goods Receipt" : "Edit Goods Receipt";

  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden lg:block">
              <BreadcrumbLink asChild>
                <Link to={routesConfig.app.goodsReceipts}>Goods Receipts</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden lg:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button form="form" type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action === "create" ? "Create Goods Receipt" : "Save Changes"}
          </Button>
        </div>
      </div>
    </AppHeader>
  );
};

export default GoodsReceiptFormHeader;

