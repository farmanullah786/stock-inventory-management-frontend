import { useSearchParams } from "react-router-dom";
import { ProductCombobox } from "@/components/ui/product-combobox";
import { IProduct } from "@/types/api";

interface ProductFilterProps {
  products: IProduct[];
  className?: string;
}

export const ProductFilter = ({ products, className = "" }: ProductFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productFilter = searchParams.get("productId")
    ? Number(searchParams.get("productId"))
    : null;

  const handleProductChange = (productId: number | null) => {
    if (productId === null) {
      searchParams.delete("productId");
    } else {
      searchParams.set("productId", String(productId));
    }
    setSearchParams(searchParams);
  };

  return (
    <div className={className}>
      <ProductCombobox
        products={products}
        selectedProductId={productFilter}
        onSelect={handleProductChange}
        placeholder="All Products"
      />
    </div>
  );
};

