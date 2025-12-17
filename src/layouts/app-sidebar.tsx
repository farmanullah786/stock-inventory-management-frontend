import {
  LayoutDashboard,
  Package,
  ArrowDown,
  ArrowUp,
  FileText,
  Settings,
  LogOut,
  Users,
  FolderTree,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocation, Link } from "react-router-dom";
import { useUser } from "@/store/use-user-store";
import LogoutDialog from "@/components/settings/logout-dialog";
import { canManageUsers, canManageProducts, canView } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Stock In",
    url: "/stock-in",
    icon: ArrowDown,
  },
  {
    title: "Stock Out",
    url: "/stock-out",
    icon: ArrowUp,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderTree,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Summary",
    url: "/stock-summary",
    icon: FileText,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useUser();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    // Users menu is only visible to admins
    if (item.title === "Users") {
      return canManageUsers(user?.role);
    }
    // Categories and Products are only visible to admin and stock_manager
    if (item.title === "Categories" || item.title === "Products") {
      return canManageProducts(user?.role);
    }
    // All other menu items are visible to all authenticated users
    return canView(user?.role);
  });

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="size-11 flex items-center justify-center bg-primary rounded-lg">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-primary truncate">
              Stock Inventory
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user?.fullName || "Management System"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`${
                        isActive
                          ? "!bg-primary/10 !text-primary hover:!bg-primary/10 hover:!text-primary border-r-2 !border-primary cursor-default font-semibold"
                          : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                      } transition-all duration-200 text-sm lg:text-base`}
                    >
                      <Link to={item.url} className="flex items-center">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              className="w-full justify-start text-primary bg-primary/10 hover:bg-primary/10 hover:text-primary text-sm lg:text-base"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <LogoutDialog />
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}

