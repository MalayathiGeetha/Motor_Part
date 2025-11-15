import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PurchaseOrder {
  id: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'PENDING' | 'SHIPPED' | 'RECEIVED' | 'DELIVERED';
  totalAmount: number;
  items: {
    partName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const VendorPortal = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      setApiError(false);
      
      // Use mock data directly since API endpoints don't exist
      console.log('Using mock data for VendorPortal - API endpoints not available');
      const mockOrders = getMockVendorOrders();
      
      setOrders(mockOrders);
      
      setStats({
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'PENDING').length,
        shippedOrders: mockOrders.filter(o => o.status === 'SHIPPED').length,
        completedOrders: mockOrders.filter(o => o.status === 'RECEIVED' || o.status === 'DELIVERED').length,
      });
      
    } catch (error) {
      console.error('Error in VendorPortal:', error);
      setApiError(true);
      // Use mock data as fallback
      const mockOrders = getMockVendorOrders();
      setOrders(mockOrders);
      setStats({
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'PENDING').length,
        shippedOrders: mockOrders.filter(o => o.status === 'SHIPPED').length,
        completedOrders: mockOrders.filter(o => o.status === 'RECEIVED' || o.status === 'DELIVERED').length,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockVendorOrders = (): PurchaseOrder[] => [
    {
      id: 'PO-001',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-22',
      status: 'PENDING',
      totalAmount: 1250.00,
      items: [
        { partName: 'Oil Filter Z-10', quantity: 50, unitPrice: 15.00 },
        { partName: 'Spark Plug', quantity: 100, unitPrice: 8.50 }
      ]
    },
    {
      id: 'PO-002', 
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-18',
      status: 'SHIPPED',
      totalAmount: 890.00,
      items: [
        { partName: 'Brake Pads', quantity: 25, unitPrice: 35.60 }
      ]
    },
    {
      id: 'PO-003',
      orderDate: '2024-01-05',
      expectedDelivery: '2024-01-12',
      status: 'RECEIVED',
      totalAmount: 2100.00,
      items: [
        { partName: 'Air Filter', quantity: 75, unitPrice: 12.00 },
        { partName: 'Fuel Pump', quantity: 10, unitPrice: 120.00 }
      ]
    },
    {
      id: 'PO-004',
      orderDate: '2024-01-20',
      expectedDelivery: '2024-01-27',
      status: 'PENDING',
      totalAmount: 750.00,
      items: [
        { partName: 'Windshield Wipers', quantity: 30, unitPrice: 25.00 }
      ]
    }
  ];

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // Since API endpoints don't exist, update locally only
      console.log(`Updating order ${orderId} to status: ${status} (local only - API not available)`);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: status as any } : order
      ));
      
      toast.success('Order status updated locally');
      
      // Refresh stats after update
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: status as any } : order
      );
      
      setStats({
        totalOrders: updatedOrders.length,
        pendingOrders: updatedOrders.filter(o => o.status === 'PENDING').length,
        shippedOrders: updatedOrders.filter(o => o.status === 'SHIPPED').length,
        completedOrders: updatedOrders.filter(o => o.status === 'RECEIVED' || o.status === 'DELIVERED').length,
      });
      
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-500 text-white',
      SHIPPED: 'bg-blue-500 text-white', 
      RECEIVED: 'bg-green-500 text-white',
      DELIVERED: 'bg-green-600 text-white',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500 text-white'}>
        {status}
      </Badge>
    );
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'In Transit',
      value: stats.shippedOrders.toString(),
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Completed',
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-40">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendor Portal</h1>
            <p className="text-muted-foreground mt-1">Manage your purchase orders and deliveries</p>
          </div>
          {apiError && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Using Demo Data
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="shadow-sm">
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
          ))}
        </div>

        {/* Demo Data Notice */}
        {apiError && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-yellow-800 font-medium">Demo Mode</p>
                  <p className="text-yellow-700 text-sm">
                    Using demo data. Real API endpoints are not available. All changes are local only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="font-semibold">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          {(order.status === 'RECEIVED' || order.status === 'DELIVERED') && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorPortal;
