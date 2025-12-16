import { useState, useEffect } from "react";
import { useFetchUsers } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServerDataTable } from "@/components/shared/data-table/server-data-table";
import { columns } from "@/components/user/columns";
import { usePaginationQuery } from "@/hooks/use-pagination-query";
import Loader from "@/components/ui/loader";
import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/shared/container";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/user/user-form-dialog";
import { Plus, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Users = () => {
  const { searchParams, setSearchParams } = usePaginationQuery();

  const queryOptions: any = {
    ...Object.fromEntries(searchParams),
    role: searchParams.get("role") || undefined,
    status: searchParams.get("status") || undefined,
    search: searchParams.get("search") || undefined,
  };

  const { data, isLoading, isFetching, isSuccess, error } =
    useFetchUsers(queryOptions);

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  const users = isSuccess ? data?.data || [] : [];
  const rowCount = isSuccess ? data?.pagination?.rowCount || users.length : 0;

  return (
    <>
      <Header />
      <Container>
        <div className="space-y-6">
          <Users.Filters />

          <Loader isPending={isLoading} className="py-8" />
          {isSuccess && (
            <ServerDataTable
              columns={columns}
              data={users}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              rowCount={rowCount}
              isFetching={isFetching && !isLoading}
            />
          )}
        </div>
      </Container>
    </>
  );
};

Users.Filters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [roleFilter, setRoleFilter] = useState<string>(
    searchParams.get("role") || "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all"
  );

  // Handle search term with debounce
  useEffect(() => {
    if (searchTerm !== searchParams.get("search")) {
      const timeout = setTimeout(() => {
        if (searchTerm) {
          searchParams.set("search", searchTerm);
        } else {
          searchParams.delete("search");
        }
        setSearchParams(searchParams);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm, searchParams, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    if (name === "role") {
      setRoleFilter(value);
    } else if (name === "status") {
      setStatusFilter(value);
    }

    if (value && value !== "all") {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);
  };

  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
          </div>

          <Select
            value={roleFilter}
            onValueChange={(value) => handleFilterChange("role", value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {["admin", "stock_manager", "stock_keeper", "viewer"].map((role) => (
                <SelectItem key={role} value={role} className="capitalize">
                  {role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {["active", "inactive"].map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

const Header = () => {
  return (
    <AppHeader>
      <div className="flex items-center justify-between w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Users</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 ml-auto">
              <Plus />
              Add New User
            </Button>
          </DialogTrigger>
          <UserForm action="create" />
        </Dialog>
      </div>
    </AppHeader>
  );
};

export default Users;

