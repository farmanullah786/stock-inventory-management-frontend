import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";
import { ReactNode } from "react";

interface StockInDetailHeaderProps {
  referenceNumber: string;
  children?: ReactNode;
}

const StockInDetailHeader = ({
  referenceNumber,
  children,
}: StockInDetailHeaderProps) => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden lg:block">
              <BreadcrumbLink asChild>
                <Link to={routesConfig.app.stockIn}>
                  Stock In
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden lg:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{referenceNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </AppHeader>
  );
};

StockInDetailHeader.Actions = function Actions({
  stockInId,
  canEdit,
}: {
  stockInId: number;
  canEdit: boolean;
}) {
  // Edit functionality removed
  return null;
};

export default StockInDetailHeader;

