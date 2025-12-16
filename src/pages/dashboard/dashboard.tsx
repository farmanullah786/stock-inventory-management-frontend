import { useFetchStockSummary } from '@/hooks/use-stock-summary';
import { useFetchStockInRecords } from '@/hooks/use-stock-in';
import { useFetchStockOutRecords } from '@/hooks/use-stock-out';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ArrowDown, 
  ArrowUp, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AppHeader from '@/layouts/app-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Container } from '@/components/shared/container';

const Dashboard = () => {
  const { data, isLoading, error } = useFetchStockSummary();
  
  // Get today's date and this month's date range
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Format dates as YYYY-MM-DD
  const todayStr = today.toISOString().split('T')[0];
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
  
  // Fetch stock in records for this month
  const { data: stockInData } = useFetchStockInRecords({
    startDate: startOfMonthStr,
    endDate: endOfMonthStr,
    limit: 10000, // Get all records for the month
  });
  
  // Fetch stock out records for this month
  const { data: stockOutData } = useFetchStockOutRecords({
    startDate: startOfMonthStr,
    endDate: endOfMonthStr,
    limit: 10000, // Get all records for the month
  });

  return (
    <>
      <Header />
      <DashboardContent 
        data={data} 
        isLoading={isLoading} 
        error={error}
        stockInData={stockInData}
        stockOutData={stockOutData}
      />
    </>
  );
};

const DashboardContent = ({ data, isLoading, error, stockInData, stockOutData }: any) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">Error loading dashboard</p>
              <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.data || [];
  
  // Calculate KPI metrics
  // Total Products: Count of all products in summary (all are active products)
  const totalProducts = summary.length;
  
  // Calculate Stock In for this month
  const stockInRecords = stockInData?.data || [];
  const totalStockInThisMonth = stockInRecords.reduce((sum: number, record: any) => {
    return sum + (parseFloat(record.quantity) || 0);
  }, 0);
  
  // Calculate Stock Out for this month
  const stockOutRecords = stockOutData?.data || [];
  const totalStockOutThisMonth = stockOutRecords.reduce((sum: number, record: any) => {
    return sum + (parseFloat(record.quantity) || 0);
  }, 0);
  
  // Calculate total available stock
  const totalAvailable = summary.reduce(
    (sum: number, item: any) => sum + (item.availableStock || 0),
    0
  );

  // Stock status counts
  const lowStockItems = summary.filter((item: any) => {
    const stock = item.availableStock || 0;
    return stock > 0 && stock < 10;
  });
  const inStockItems = summary.filter((item: any) => (item.availableStock || 0) >= 10);
  const outOfStockItems = summary.filter((item: any) => (item.availableStock || 0) <= 0);

  // Prepare chart data
  // Stock Status Distribution
  const stockStatusData = [
    { name: 'In Stock', value: inStockItems.length, color: '#10b981' },
    { name: 'Low Stock', value: lowStockItems.length, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStockItems.length, color: '#ef4444' },
  ];

  // Stock In vs Stock Out by Category
  const categoryData = summary.reduce((acc: any, item: any) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, totalIn: 0, totalOut: 0, available: 0 };
    }
    acc[category].totalIn += item.totalIn;
    acc[category].totalOut += item.totalOut;
    acc[category].available += item.availableStock;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData).slice(0, 8);

  // Top Products by Available Stock (Top 5 or 10)
  const topProductsData = [...summary]
    .sort((a: any, b: any) => (b.availableStock || 0) - (a.availableStock || 0))
    .slice(0, 5) // Show top 5 only
    .map((item: any) => ({
      name: item.productName.length > 15 
        ? item.productName.substring(0, 15) + '...' 
        : item.productName,
      stock: parseFloat((item.availableStock || 0).toFixed(2)),
    }));

  // Category Distribution
  const categoryDistribution = summary.reduce((acc: any, item: any) => {
    const category = item.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryPieData = Object.entries(categoryDistribution)
    .map(([name, value]) => ({
      name,
      value: value as number,
    }))
    .slice(0, 8);

  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  // Get current month name for display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[new Date().getMonth()];
  
  const stats = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      bgColor: 'bg-gradient-to-br from-primary to-primary/80',
      iconColor: 'text-white',
      textColor: 'text-primary',
      description: 'Active products',
    },
    {
      title: 'Total Stock In',
      value: totalStockInThisMonth.toFixed(2),
      icon: ArrowDown,
      bgColor: 'bg-gradient-to-br from-secondary to-secondary/80',
      iconColor: 'text-white',
      textColor: 'text-secondary',
      description: `This Month (${currentMonth})`,
    },
    {
      title: 'Total Stock Out',
      value: totalStockOutThisMonth.toFixed(2),
      icon: ArrowUp,
      bgColor: 'bg-gradient-to-br from-primary to-primary/80',
      iconColor: 'text-white',
      textColor: 'text-primary',
      description: `This Month (${currentMonth})`,
    },
    {
      title: 'Available Stock',
      value: totalAvailable.toFixed(2),
      icon: TrendingUp,
      bgColor: 'bg-gradient-to-br from-secondary to-secondary/80',
      iconColor: 'text-white',
      textColor: 'text-secondary',
      description: 'Total quantity',
    },
  ];

  return (
    <Container>
      <div className="space-y-6">

      {/* 🟣 1. TOP KPI CARDS (FIRST ROW) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-text">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.description}</p>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                  {stat.title}
                </h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🟣 2. STOCK STATUS OVERVIEW (SECOND ROW - Small Cards) */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-success hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-lg font-semibold">In Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{inStockItems.length}</p>
            <p className="text-sm text-text-muted mt-1">Products with sufficient stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg font-semibold">Low Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{lowStockItems.length}</p>
            <p className="text-sm text-text-muted mt-1">Products need restocking</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-danger hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-danger" />
              <CardTitle className="text-lg font-semibold">Out of Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-danger">{outOfStockItems.length}</p>
            <p className="text-sm text-text-muted mt-1">Products unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* 🟣 3. VISUAL CHARTS (MAIN AREA) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ✅ Chart 1: Stock Status Distribution (Pie / Donut) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle>Stock Status Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ Chart 2: Products by Category (Pie) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle>Products by Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Chart 3: Stock Movement by Category (Bar) */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Stock Movement by Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalIn" fill="#3b82f6" name="Stock In" />
              <Bar dataKey="totalOut" fill="#ef4444" name="Stock Out" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ✅ Chart 4: Top Products by Available Stock (Bar) - Top 5 only */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top 5 Products by Available Stock</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#10b981" name="Available Stock" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🟣 4. ALERT SECTION (VERY IMPORTANT) - Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-warning bg-warning-bg hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning-text">Low Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 10).map((item: any) => {
                const currentStock = item.availableStock || 0;
                const minimumThreshold = 10; // Minimum threshold for low stock
                
                return (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center p-3 bg-bg rounded-lg border border-warning-border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Package className="h-4 w-4 text-warning" />
                      <div className="flex-1">
                        <div className="font-semibold text-text">{item.productName}</div>
                        <div className="text-xs text-text-muted mt-1">
                          Category: {item.category} • Unit: {item.unit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-text-muted">Current Stock</div>
                        <Badge variant="destructive" className="font-semibold mt-1">
                          {currentStock.toFixed(2)} {item.unit}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-muted">Min Threshold</div>
                        <Badge variant="outline" className="font-semibold mt-1">
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

