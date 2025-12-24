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

interface StockOutDetailHeaderProps {
  referenceNumber: string;
  children?: ReactNode;
}

const StockOutDetailHeader = ({
  referenceNumber,
  children,
}: StockOutDetailHeaderProps) => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden lg:block">
              <BreadcrumbLink asChild>
                <Link to={routesConfig.app.stockOut}>
                  Stock Out
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

StockOutDetailHeader.Actions = function Actions({
  stockOutId,
  canEdit,
}: {
  stockOutId: number;
  canEdit: boolean;
}) {
  // Edit functionality removed to match stock in
  return null;
};

export default StockOutDetailHeader;

