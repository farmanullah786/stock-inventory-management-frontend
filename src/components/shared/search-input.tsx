import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput = ({ 
  placeholder = "Search...", 
  debounceMs = 500,
  className = ""
}: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    if (searchTerm !== searchParams.get("search")) {
      const timeout = setTimeout(() => {
        if (searchTerm) {
          searchParams.set("search", searchTerm);
        } else {
          searchParams.delete("search");
        }
        setSearchParams(searchParams);
      }, debounceMs);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm, searchParams, setSearchParams, debounceMs]);

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
          onClick={() => setSearchTerm("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

