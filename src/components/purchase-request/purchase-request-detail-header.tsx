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
import { Link, useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";
import { Edit } from "lucide-react";
import { ReactNode } from "react";

interface PurchaseRequestDetailHeaderProps {
  prNumber: string;
  children?: ReactNode;
}

const PurchaseRequestDetailHeader = ({
  prNumber,
  children,
}: PurchaseRequestDetailHeaderProps) => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden lg:block">
              <BreadcrumbLink asChild>
                <Link to={routesConfig.app.purchaseRequests}>
                  Purchase Requests
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden lg:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{prNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </AppHeader>
  );
};

PurchaseRequestDetailHeader.Actions = function Actions({
  purchaseRequestId,
  canEdit,
}: {
  purchaseRequestId: number;
  canEdit: boolean;
}) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      `${routesConfig.app.editPurchaseRequest.replace(":id", purchaseRequestId.toString())}`
    );
  };

  if (!canEdit) return null;

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button variant="secondary" className="gap-2" onClick={handleEdit}>
        <Edit className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
};

export default PurchaseRequestDetailHeader;

