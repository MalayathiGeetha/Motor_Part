import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, TrendingUp, Users, ShoppingCart, Calendar, 
  Download, Filter, BarChart3, PieChart, LineChart 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  growth: string;
}

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: string;
  topCategory: string;
}

export default function SalesReport() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockSalesData: SalesData[] = [
          { date: '2024-01-01', revenue: 12500, orders: 45, averageOrderValue: 277.78 },
          { date: '2024-01-02', revenue: 11800, orders: 42, averageOrderValue: 280.95 },
          { date: '2024-01-03', revenue: 13200, orders: 48, averageOrderValue: 275.00 },
          { date: '2024-01-04', revenue: 14100, orders: 51, averageOrderValue: 276.47 },
          { date: '2024-01-05', revenue: 12800, orders: 46, averageOrderValue: 278.26 },
        ];

        const mockTopProducts: TopProduct[] = [
          { name: 'Engine Oil 5W-30', sales: 45, revenue: 2250, growth: '+12%' },
          { name: 'Air Filter', sales: 38, revenue: 1140, growth: '+8%' },
          { name: 'Brake Pads', sales: 32, revenue: 2560, growth: '+15%' },
          { name: 'Spark Plugs', sales: 28, revenue: 840, growth: '+5%' },
          { name: 'Oil Filter', sales: 25, revenue: 750, growth: '+18%' },
        ];

        const mockSummary: SalesSummary = {
          totalRevenue: 64400,
          totalOrders: 232,
          averageOrderValue: 277.59,
          growthRate: '+15.2%',
          topCategory: 'Engine Parts'
        };

        setSalesData(mockSalesData);
        setTopProducts(mockTopProducts);
        setSummary(mockSummary);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting sales report...');
    // In real implementation, this would generate and download a CSV/PDF
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sales report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" onClick={handleBack} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sales Report</h1>
                <p className="text-muted-foreground">Monthly sales performance and analytics</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.totalRevenue?.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {summary?.growthRate} from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.averageOrderValue?.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per customer order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.topCategory}</div>
              <p className="text-xs text-muted-foreground">Most popular category</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Detailed Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Daily Revenue Trend
                  </CardTitle>
                  <CardDescription>Revenue performance over the last 5 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{day.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${day.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Avg: ${day.averageOrderValue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Key sales performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Conversion Rate</span>
                      <Badge variant="secondary">3.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Customer Retention</span>
                      <Badge variant="secondary">78%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Sales Target</span>
                      <Badge variant="secondary">92% Achieved</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Return Rate</span>
                      <Badge variant="secondary">2.1%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best selling products by revenue and quantity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {product.growth}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends & Patterns</CardTitle>
                <CardDescription>Analysis of sales patterns and seasonal trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Peak Sales Hours</h4>
                      <p className="text-sm text-muted-foreground">10:00 AM - 2:00 PM</p>
                      <Badge variant="outline" className="mt-2">+45% Volume</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Best Day of Week</h4>
                      <p className="text-sm text-muted-foreground">Friday</p>
                      <Badge variant="outline" className="mt-2">+32% Revenue</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Seasonal Trends</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Spring (Mar-May)</span>
                        <span className="font-medium">+22% Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Summer (Jun-Aug)</span>
                        <span className="font-medium">+15% Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fall (Sep-Nov)</span>
                        <span className="font-medium">+28% Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Winter (Dec-Feb)</span>
                        <span className="font-medium">+8% Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed sales analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Customer Segmentation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>New Customers</span>
                        <span>35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Returning Customers</span>
                        <span>65%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VIP Customers</span>
                        <span>12%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Sales Channels</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>In-Store</span>
                        <span>58%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Online</span>
                        <span>32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mobile App</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
