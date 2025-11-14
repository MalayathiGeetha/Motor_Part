import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Package, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PurchaseOrder {
  id: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'PENDING' | 'SHIPPED' | 'RECEIVED';
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
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/purchase-orders/vendor');
      setOrders(response.data);
      
      setStats({
        totalOrders: response.data.length,
        pendingOrders: response.data.filter((o: PurchaseOrder) => o.status === 'PENDING').length,
        shippedOrders: response.data.filter((o: PurchaseOrder) => o.status === 'SHIPPED').length,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase orders');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/purchase-orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-warning text-warning-foreground',
      SHIPPED: 'bg-primary text-primary-foreground',
      RECEIVED: 'bg-success text-success-foreground',
    };
    return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'In Transit',
      value: stats.shippedOrders.toString(),
      icon: Truck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your purchase orders and deliveries</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title} className="shadow-card">
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

        {/* Orders Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell className="font-semibold">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <Badge className="bg-accent text-accent-foreground">In Transit</Badge>
                      )}
                      {order.status === 'RECEIVED' && (
                        <Badge className="bg-success text-success-foreground">Completed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorPortal;
