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

interface GoodsReceiptDetailHeaderProps {
  grnNumber: string;
  children?: React.ReactNode;
}

const GoodsReceiptDetailHeader = ({
  grnNumber,
  children,
}: GoodsReceiptDetailHeaderProps) => {
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
              <BreadcrumbPage>{grnNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </AppHeader>
  );
};

interface ActionsProps {
  goodsReceiptId: number;
  canEdit: boolean;
}

GoodsReceiptDetailHeader.Actions = function Actions({
  goodsReceiptId,
  canEdit,
}: ActionsProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      `${routesConfig.app.editGoodsReceipt.replace(
        ":id",
        goodsReceiptId.toString()
      )}`
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

export default GoodsReceiptDetailHeader;

