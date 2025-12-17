import { useFetchStockSummary } from "@/hooks/use-stock-summary";
import { useMemo } from "react";
import { IStockSummary } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Warehouse,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import AppHeader from "@/layouts/app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/shared/container";
import { ErrorDisplay } from "@/components/shared/error-display";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";

const Dashboard = () => {
  const { data, isPending, isError, error } = useFetchStockSummary();

  const summary = (data?.data || []) as IStockSummary[];
  const lowStockItems = useMemo(() => {
    return summary.filter((item: IStockSummary) => {
      const stock = item.availableStock || 0;
      return stock > 0 && stock < 10;
    });
  }, [summary]);

  const inStockItems = useMemo(() => {
    return summary.filter(
      (item: IStockSummary) => (item.availableStock || 0) >= 10
    );
  }, [summary]);

  const outOfStockItems = useMemo(() => {
    return summary.filter(
      (item: IStockSummary) => (item.availableStock || 0) <= 0
    );
  }, [summary]);

  if (isPending) {
    return (
      <>
        <Header />
        <Container>
          <DashboardSkeleton />
        </Container>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header />
        <Container>
          <ErrorDisplay
            error={error}
            title="Failed to load dashboard"
            onRetry={() => window.location.reload()}
          />
        </Container>
      </>
    );
  }

  const totalProducts = summary.length;
  const totalOpeningStock = summary.reduce(
    (sum: number, item: IStockSummary) => sum + (item.openingStock || 0),
    0
  );
  const totalStockIn = summary.reduce(
    (sum: number, item: IStockSummary) => sum + (item.totalIn || 0),
    0
  );
  const totalStockOut = summary.reduce(
    (sum: number, item: IStockSummary) => sum + (item.totalOut || 0),
    0
  );
  const totalAvailable = summary.reduce(
    (sum: number, item: IStockSummary) => sum + (item.availableStock || 0),
    0
  );

  const categoryData = summary.reduce(
    (
      acc: Record<
        string,
        { category: string; totalIn: number; totalOut: number }
      >,
      item: IStockSummary
    ) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = { category, totalIn: 0, totalOut: 0 };
      }
      acc[category].totalIn += item.totalIn || 0;
      acc[category].totalOut += item.totalOut || 0;
      return acc;
    },
    {}
  );

  const categoryChartData = Object.values(categoryData).slice(0, 8);

  const stockMovementChartConfig = {
    totalIn: {
      label: "Stock In",
      color: "#10b981",
    },
    totalOut: {
      label: "Stock Out",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
    },
    {
      title: "Opening Stock",
      value: totalOpeningStock.toFixed(2),
      icon: Warehouse,
    },
    {
      title: "Total Stock In",
      value: totalStockIn.toFixed(2),
      icon: ArrowDown,
    },
    {
      title: "Total Stock Out",
      value: totalStockOut.toFixed(2),
      icon: ArrowUp,
    },
    {
      title: "Available Stock",
      value: totalAvailable.toFixed(2),
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <Header />
      <Container>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Stock</p>
                    <p className="text-2xl font-bold">{inStockItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold">{lowStockItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <XCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Out of Stock
                    </p>
                    <p className="text-2xl font-bold">
                      {outOfStockItems.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="hover:shadow-md transition-shadow">
            <ChartStyle id="stock-movement" config={stockMovementChartConfig} />
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Stock Movement by Category</CardTitle>
                <CardDescription className="ml-auto">
                  Stock in vs stock out comparison
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                id="stock-movement"
                config={stockMovementChartConfig}
                className="w-full h-[350px]"
              >
                <BarChart data={categoryChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="totalIn"
                    fill="var(--color-totalIn)"
                    name="Stock In"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalOut"
                    fill="var(--color-totalOut)"
                    name="Stock Out"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {lowStockItems.length > 0 && (
            <Card className="border-l-4 border-warning bg-warning-bg hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-warning-text">
                    Low Stock Alerts
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 10).map((item: IStockSummary) => {
                    const currentStock = item.availableStock || 0;
                    const minimumThreshold = 10;

                    return (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center p-3 bg-bg rounded-lg border border-warning-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Package className="h-4 w-4 text-warning" />
                          <div className="flex-1">
                            <div className="font-semibold text-text">
                              {item.productName}
                            </div>
                            <div className="text-xs text-text-muted mt-1">
                              Category: {item.category} • Unit: {item.unit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-text-muted">
                              Current Stock
                            </div>
                            <Badge
                              variant="destructive"
                              className="font-semibold mt-1"
                            >
                              {currentStock.toFixed(2)} {item.unit}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-text-muted">
                              Min Threshold
                            </div>
                            <Badge
                              variant="outline"
                              className="font-semibold mt-1"
                            >
                              {minimumThreshold} {item.unit}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {lowStockItems.length > 10 && (
                    <p className="text-sm text-warning-text text-center pt-2">
                      +{lowStockItems.length - 10} more items with low stock
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </>
  );
};

const Header = () => {
  return (
    <AppHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </AppHeader>
  );
};

export default Dashboard;
