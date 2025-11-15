import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, DollarSign, AlertTriangle, Clock, CheckCircle, Truck, 
  Package2, FileText, Shield, Users, TrendingUp, BarChart3, 
  ShoppingCart, Calendar, ArrowUp, ArrowDown, Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('Dashboard - Current user:', user);
    console.log('Dashboard - User role:', user?.role);
    
    // Check if user has proper permissions
    if (user && !isValidRole(user.role)) {
      console.log('ACCESS DENIED - Role not valid:', user.role);
      setError('You do not have permission to access this dashboard');
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  const isValidRole = (role) => {
    const validRoles = ['SALES_EXECUTIVE', 'SHOP_OWNER', 'SYSTEM_ADMIN', 'VENDOR', 'INVENTORY_MANAGER', 'AUDITOR', 'CUSTOMER'];
    return role && validRoles.includes(role);
  };

  // Report navigation handlers
  const handleSalesReport = () => {
    navigate('/reports/SalesReport');
  };

  const handleInventoryReport = () => {
    navigate('/reports/InventoryReport');
  };

  const handleVendorReport = () => {
    navigate('/reports/VendorReport');
  };

  // Enhanced mock data with trends and analytics
  const vendorStats = {
    pendingOrders: 5,
    completedOrders: 12,
    totalProducts: 15,
    activeOrders: 17,
    orderTrend: '+12%',
    revenue: 12500,
    revenueTrend: '+8%',
    performance: 85
  };

  const auditorStats = {
    totalAudits: 45,
    criticalIssues: 3,
    complianceScore: 98,
    pendingReviews: 8,
    auditsCompleted: 42,
    auditTrend: '+5%',
    riskLevel: 'Low'
  };

  const customerStats = {
    totalOrders: 17,
    pendingOrders: 2,
    completedOrders: 15,
    loyaltyPoints: 450,
    spentThisMonth: 1250,
    favoriteCategory: 'Engine Parts',
    orderTrend: '+3%'
  };

  const regularStats = {
    totalSales: 766.50,
    inventoryValue: 87520,
    lowStockAlerts: 8,
    totalParts: 245,
    totalVendors: 12,
    monthlyGrowth: '+15%',
    topSelling: 'Oil Filters',
    customerSatisfaction: 94
  };

  const getStats = () => {
    switch (user?.role) {
      case 'VENDOR':
        return vendorStats;
      case 'AUDITOR':
        return auditorStats;
      case 'CUSTOMER':
        return customerStats;
      default:
        return regularStats;
    }
  };

  const stats = getStats();

  // Recent activity data
  const recentActivities = [
    { id: 1, action: 'New order placed', user: 'John Doe', time: '2 min ago', type: 'order' },
    { id: 2, action: 'Inventory updated', user: 'System', time: '5 min ago', type: 'inventory' },
    { id: 3, action: 'Payment received', user: 'Jane Smith', time: '10 min ago', type: 'payment' },
    { id: 4, action: 'New vendor registered', user: 'Auto Parts Inc', time: '1 hour ago', type: 'vendor' },
  ];

  // Top selling products
  const topProducts = [
    { id: 1, name: 'Engine Oil 5W-30', sales: 45, revenue: 2250 },
    { id: 2, name: 'Air Filter', sales: 38, revenue: 1140 },
    { id: 3, name: 'Brake Pads', sales: 32, revenue: 2560 },
    { id: 4, name: 'Spark Plugs', sales: 28, revenue: 840 },
  ];

  const getRoleBadgeColor = (role) => {
    const colors = {
      'SHOP_OWNER': 'bg-purple-100 text-purple-800',
      'INVENTORY_MANAGER': 'bg-blue-100 text-blue-800',
      'SALES_EXECUTIVE': 'bg-green-100 text-green-800',
      'SYSTEM_ADMIN': 'bg-red-100 text-red-800',
      'AUDITOR': 'bg-orange-100 text-orange-800',
      'VENDOR': 'bg-indigo-100 text-indigo-800',
      'CUSTOMER': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getDashboardTitle = () => {
    const titles = {
      'VENDOR': 'Vendor Dashboard',
      'AUDITOR': 'Auditor Dashboard',
      'CUSTOMER': 'Customer Dashboard',
      'SALES_EXECUTIVE': 'Sales Dashboard',
      'INVENTORY_MANAGER': 'Inventory Dashboard',
      'SHOP_OWNER': 'Business Overview',
      'SYSTEM_ADMIN': 'Admin Dashboard'
    };
    return titles[user?.role] || 'Dashboard';
  };

  const getDashboardDescription = () => {
    const descriptions = {
      'VENDOR': 'Order Management & Performance Overview',
      'AUDITOR': 'Audit and Compliance Monitoring',
      'CUSTOMER': 'Your Orders & Account Overview',
      'SALES_EXECUTIVE': 'Sales Performance & Analytics',
      'INVENTORY_MANAGER': 'Stock Management & Alerts',
      'SHOP_OWNER': 'Complete Business Performance',
      'SYSTEM_ADMIN': 'System Management & Monitoring'
    };
    return descriptions[user?.role] || 'Business Overview';
  };

  const vendorCards = [
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: Package2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: stats.orderTrend,
      description: 'Currently processing'
    },
    {
      title: 'Pending Shipment',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: '+2 today',
      description: 'Ready to ship'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: 'This month',
      description: 'Successfully delivered'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue?.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: stats.revenueTrend,
      description: 'Total earnings'
    }
  ];

  const auditorCards = [
    {
      title: 'Total Audits',
      value: stats.totalAudits,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: stats.auditTrend,
      description: 'All time audits'
    },
    {
      title: 'Critical Issues',
      value: stats.criticalIssues,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      trend: '-1 this week',
      description: 'Requires attention'
    },
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      icon: Shield,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: '+2%',
      description: 'Overall compliance'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      trend: '3 high priority',
      description: 'Awaiting review'
    }
  ];

  const customerCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: stats.orderTrend,
      description: 'All time orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      trend: 'Processing',
      description: 'Current orders'
    },
    {
      title: 'Loyalty Points',
      value: stats.loyaltyPoints,
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: '+50 this month',
      description: 'Reward points'
    },
    {
      title: 'Monthly Spend',
      value: `$${stats.spentThisMonth}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: '+$150',
      description: 'This month total'
    }
  ];

  const regularCards = [
    {
      title: 'Total Sales',
      value: `$${stats.totalSales?.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: stats.monthlyGrowth,
      description: 'Today\'s revenue'
    },
    {
      title: 'Inventory Value',
      value: `$${stats.inventoryValue?.toLocaleString()}`,
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: '+5%',
      description: 'Total stock value'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockAlerts,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      trend: 'Need restock',
      description: 'Items running low'
    },
    {
      title: 'Customer Satisfaction',
      value: `${stats.customerSatisfaction}%`,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: '+4%',
      description: 'Average rating'
    }
  ];

  const getVisibleCards = () => {
    switch (user?.role) {
      case 'VENDOR':
        return vendorCards;
      case 'AUDITOR':
        return auditorCards;
      case 'CUSTOMER':
        return customerCards;
      default:
        return regularCards;
    }
  };

  const visibleCards = getVisibleCards();

  const handleVendorPortalRedirect = () => {
    navigate('/vendor-portal');
  };

  const handleMyProducts = () => {
    navigate('/vendor/products');
  };

  const handleAuditLogs = () => {
    navigate('/audit-logs');
  };

  const handleComplianceReports = () => {
    navigate('/compliance-reports');
  };

  const handleViewProducts = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/customer/orders');
  };

  // Handle report card click
  const handleReportClick = (reportId) => {
    switch (reportId) {
      case 'sales':
        handleSalesReport();
        break;
      case 'inventory':
        handleInventoryReport();
        break;
      case 'vendor':
        handleVendorReport();
        break;
      default:
        console.warn('Unknown report:', reportId);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Current role: <Badge variant="outline" className={getRoleBadgeColor(user?.role)}>
              {user?.role}
            </Badge>
          </p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
              <Badge className={getRoleBadgeColor(user?.role)}>
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              {getDashboardDescription()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            {user?.role === 'CUSTOMER' && (
              <TabsTrigger value="my-account">My Account</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className={`grid gap-4 ${user?.role === 'AUDITOR' || user?.role === 'CUSTOMER' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {visibleCards.map((card, index) => (
                <Card key={card.title} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                      {card.trend && (
                        <Badge variant="secondary" className="text-xs">
                          {card.trend.startsWith('+') ? (
                            <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                          ) : card.trend.startsWith('-') ? (
                            <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                          ) : null}
                          {card.trend}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'order' ? 'bg-green-500' :
                            activity.type === 'inventory' ? 'bg-blue-500' :
                            activity.type === 'payment' ? 'bg-purple-500' : 'bg-orange-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">by {activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products / Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {user?.role === 'CUSTOMER' ? 'Order Summary' : 'Top Products'}
                  </CardTitle>
                  <CardDescription>
                    {user?.role === 'CUSTOMER' ? 'Your recent purchase trends' : 'Best performing items'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.role === 'CUSTOMER' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Favorite Category</span>
                        <Badge variant="outline">{stats.favoriteCategory}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Avg Order Value</span>
                        <span className="font-bold">${(stats.spentThisMonth / stats.totalOrders).toFixed(2)}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Monthly spending goal: 75% completed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sales} units</p>
                            </div>
                          </div>
                          <span className="font-bold">${product.revenue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Key Metrics</h4>
                    {visibleCards.map((card, index) => (
                      <div key={card.title} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">{card.title}</span>
                        <span className="font-bold">{card.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Indicators</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>System Health</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Task Completion</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Customer Satisfaction</span>
                          <span>94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Documents</CardTitle>
                <CardDescription>Access and generate various reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sales Report */}
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Sales Report</h3>
                    <p className="text-sm text-muted-foreground mb-3">Monthly sales performance and trends</p>
                    <Button 
                      onClick={() => handleReportClick('sales')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Report
                    </Button>
                  </div>
                  
                  {/* Inventory Report */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Inventory Report</h3>
                    <p className="text-sm text-muted-foreground mb-3">Track stock levels and inventory status</p>
                    <Button 
                      onClick={() => handleReportClick('inventory')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      View Report
                    </Button>
                  </div>
                  
                  {/* Vendor Report */}
                  <div className="pb-2">
                    <h3 className="text-lg font-semibold mb-2">Vendor Report</h3>
                    <p className="text-sm text-muted-foreground mb-3">Vendor performance and analytics</p>
                    <Button 
                      onClick={() => handleReportClick('vendor')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Account Tab (Customer Only) */}
          {user?.role === 'CUSTOMER' && (
            <TabsContent value="my-account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Your personal account information and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Account Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Member Since</span>
                          <span className="font-medium">Jan 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loyalty Tier</span>
                          <Badge variant="secondary">Gold Member</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Spent</span>
                          <span className="font-medium">${stats.spentThisMonth * 3}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={handleViewProducts}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Browse Products
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleViewOrders}>
                          <Package className="h-4 w-4 mr-2" />
                          View Order History
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          Track Shipments
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Role-Specific Quick Actions */}
        {(user?.role === 'VENDOR' || user?.role === 'AUDITOR') && (
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === 'VENDOR' ? 'Vendor Quick Actions' : 'Auditor Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.role === 'VENDOR' ? (
                  <>
                    <Button className="h-16" variant="outline" onClick={handleVendorPortalRedirect}>
                      <Truck className="h-4 w-4 mr-2" />
                      Go to Vendor Portal
                    </Button>
                    <Button className="h-16" variant="outline" onClick={handleMyProducts}>
                      <Package2 className="h-4 w-4 mr-2" />
                      My Products
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="h-16" variant="outline" onClick={handleAuditLogs}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Audit Logs
                    </Button>
                    <Button className="h-16" variant="outline" onClick={handleComplianceReports}>
                      <Shield className="h-4 w-4 mr-2" />
                      Compliance Reports
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
