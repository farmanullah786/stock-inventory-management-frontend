import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { User, Lock, Edit, Moon, Sun } from "lucide-react";
import { ProfileSheet } from "@/components/settings/profile-sheet";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { Container } from "@/components/shared/container";
import { useUser } from "@/store/use-user-store";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/store/use-app-store";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { getInitials, formatDate, capitalizeWords } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

export default function Settings() {
  const { user } = useUser();
  const { dialogType } = useStore();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <Container>
        <Sheet>
          <AlertDialog>
            <Dialog>
              <div className="grid gap-4">
                <Settings.Profile />
                <Card className="admin-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Lock className="w-5 h-5" />
                          <span>Security</span>
                        </CardTitle>
                        <CardDescription>
                          Manage your password and security preferences
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Settings.ChangePassword />
                      <Settings.Theme />
                    </div>
                  </CardContent>
                </Card>
                <Settings.UserInfo />
              </div>

              {dialogType === "Change Profile" && <ProfileSheet user={user} />}
              {dialogType === "Change Password" && <ChangePasswordDialog />}
            </Dialog>
          </AlertDialog>
        </Sheet>
      </Container>
    </>
  );
}

Settings.Profile = () => {
  const { setDialogType } = useStore();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Card className="admin-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Manage your personal information and profile settings
            </CardDescription>
          </div>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogType("Change Profile")}
              className="w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </SheetTrigger>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.imageUrl} alt={user.fullName} />
            <AvatarFallback className="text-lg">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h3 className="text-lg font-medium">{user.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {capitalizeWords(user.role)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

Settings.ChangePassword = () => {
  const { setDialogType } = useStore();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border gap-4">
      <div className="flex-1">
        <h4 className="font-medium">Password</h4>
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(user.updatedAt)}
        </p>
      </div>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogType("Change Password")}
          className="w-full sm:w-auto"
        >
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
    </div>
  );
};

Settings.Theme = () => {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const darkMode = root.classList.contains("dark");
    setIsDark(darkMode);
  }, [theme]);

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "system");
  };

  const handleSwitchToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border gap-4">
      <div className="flex-1">
        <h4 className="font-medium flex items-center space-x-2">
          {isDark ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span>Theme</span>
        </h4>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Switch
          checked={isDark}
          onCheckedChange={handleSwitchToggle}
        />
      </div>
    </div>
  );
};

Settings.UserInfo = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Details about your account and membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">
              Account ID:
            </span>
            <p className="mt-1 break-all">{user.id}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              Member Since:
            </span>
            <p className="mt-1">{formatDate(user.createdAt)}</p>
          </div>
          {user.role && (
            <div>
              <span className="font-medium text-muted-foreground">
                Role:
              </span>
              <p className="mt-1">{capitalizeWords(user.role)}</p>
            </div>
          )}
          {user.status && (
            <div>
              <span className="font-medium text-muted-foreground">Status:</span>
              <p
                className={`mt-1 capitalize ${
                  user.status === "active" ? "text-success" : "text-danger"
                }`}
              >
                {user.status}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Header = () => {
  return (
    <AppHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </AppHeader>
  );
};

