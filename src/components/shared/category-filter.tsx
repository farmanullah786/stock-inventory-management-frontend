import { useSearchParams } from "react-router-dom";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { ICategory } from "@/types/api";

interface CategoryFilterProps {
  categories: ICategory[];
  className?: string;
}

export const CategoryFilter = ({ categories, className = "" }: CategoryFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : null;

  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId === null) {
      searchParams.delete("categoryId");
    } else {
      searchParams.set("categoryId", String(categoryId));
    }
    setSearchParams(searchParams);
  };

  return (
    <div className={className}>
      <CategoryCombobox
        categories={categories}
        selectedCategoryId={categoryFilter}
        onSelect={handleCategoryChange}
        placeholder="All Categories"
      />
    </div>
  );
};

