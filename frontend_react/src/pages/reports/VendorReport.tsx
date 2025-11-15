import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Package, DollarSign, TrendingUp, Calendar, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VendorReport() {
  const navigate = useNavigate();

  const vendorPerformance = [
    { name: 'Auto Parts Inc', rating: '4.8/5', orders: 45, reliability: '98%', revenue: 12500 },
    { name: 'Motor Works', rating: '4.6/5', orders: 38, reliability: '95%', revenue: 9800 },
    { name: 'Gear Masters', rating: '4.9/5', orders: 52, reliability: '99%', revenue: 15600 },
    { name: 'Engine Pros', rating: '4.4/5', orders: 29, reliability: '92%', revenue: 8700 },
  ];

  const pendingOrders = [
    { id: 1, vendor: 'Auto Parts Inc', product: 'Engine Oil', quantity: 50, expected: '2024-01-20' },
    { id: 2, vendor: 'Motor Works', product: 'Air Filters', quantity: 100, expected: '2024-01-22' },
    { id: 3, vendor: 'Gear Masters', product: 'Brake Pads', quantity: 75, expected: '2024-01-25' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Truck className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Vendor Report</h1>
                <p className="text-muted-foreground">Vendor performance and order history</p>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">164</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendor Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$46.6K</div>
              <p className="text-xs text-muted-foreground">Monthly expenditure</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7/5</div>
              <p className="text-xs text-muted-foreground">Vendor satisfaction</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="orders">Pending Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
                <CardDescription>Top performing vendors by orders and reliability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorPerformance.map((vendor, index) => (
                    <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{vendor.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{vendor.rating}</Badge>
                            <Badge variant="secondary">{vendor.reliability} Reliable</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${vendor.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{vendor.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Vendor Orders</CardTitle>
                <CardDescription>Orders awaiting delivery from vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Truck className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{order.vendor}</p>
                          <p className="text-sm text-muted-foreground">{order.product}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.quantity} units</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(order.expected).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Analytics</CardTitle>
                <CardDescription>Detailed vendor performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Delivery Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>On-time Delivery</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Early Delivery</span>
                        <span className="font-medium">3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Delivery</span>
                        <span className="font-medium">3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quality Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Defect Rate</span>
                        <span className="font-medium">1.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return Rate</span>
                        <span className="font-medium">0.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Satisfaction</span>
                        <span className="font-medium">96%</span>
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
