import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalSales?: number;
  inventoryValue?: number;
  lowStockAlerts?: number;
  totalParts?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for charts
  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 4500 },
    { name: 'Fri', sales: 6000 },
    { name: 'Sat', sales: 5500 },
    { name: 'Sun', sales: 4000 },
  ];

  const inventoryTrend = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 135 },
    { name: 'Mar', value: 148 },
    { name: 'Apr', value: 142 },
    { name: 'May', value: 156 },
    { name: 'Jun', value: 163 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;

        let res;

        switch (user.role) {
          case 'SALES_EXECUTIVE':
            // Replace with real API
            // res = await api.get('/sales/stats');
            res = { data: { totalSales: 125430 } };
            setStats({ totalSales: res.data.totalSales });
            break;

          case 'INVENTORY_MANAGER':
            // Replace with real API
            // res = await api.get('/inventory/stats');
            res = { data: { inventoryValue: 89250, lowStockAlerts: 12, totalParts: 456 } };
            setStats({
              inventoryValue: res.data.inventoryValue,
              lowStockAlerts: res.data.lowStockAlerts,
              totalParts: res.data.totalParts,
            });
            break;

          case 'SHOP_OWNER':
          case 'SYSTEM_ADMIN':
            // Replace with real API
            // res = await api.get('/admin/dashboard');
            res = {
              data: { totalSales: 125430, inventoryValue: 89250, lowStockAlerts: 12, totalParts: 456 },
            };
            setStats(res.data);
            break;

          default:
            setStats({});
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statCards = [
    {
      title: 'Total Sales',
      value: stats.totalSales ? `$${stats.totalSales.toLocaleString()}` : undefined,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      roles: ['SALES_EXECUTIVE', 'SHOP_OWNER', 'SYSTEM_ADMIN'],
    },
    {
      title: 'Inventory Value',
      value: stats.inventoryValue ? `$${stats.inventoryValue.toLocaleString()}` : undefined,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      roles: ['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'],
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockAlerts?.toString(),
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      roles: ['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'],
    },
    {
      title: 'Total Parts',
      value: stats.totalParts?.toString(),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      roles: ['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'],
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const filteredCards = statCards.filter((card) => card.roles.includes(user?.role || '') && card.value);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-card hover:shadow-glow transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts (optional) */}
        {(user?.role === 'SALES_EXECUTIVE' || user?.role === 'SHOP_OWNER' || user?.role === 'SYSTEM_ADMIN') && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {(user?.role === 'INVENTORY_MANAGER' || user?.role === 'SHOP_OWNER' || user?.role === 'SYSTEM_ADMIN') && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Inventory Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={inventoryTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
