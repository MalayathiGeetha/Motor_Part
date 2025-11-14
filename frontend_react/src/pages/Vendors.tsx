import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'PENDING' | 'SHIPPED' | 'RECEIVED';
  totalAmount: number;
}

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorOrders, setVendorOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role');

  useEffect(() => {
    // --- ROLE-BASED ACCESS CONTROL ---
    if (!role) {
      window.location.href = '/login';
      return;
    }
    if (!['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role)) {
      toast.error('Access denied');
      window.location.href = '/dashboard';
      return;
    }

    fetchVendors();
    setLoading(false);
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendor');
      setVendors(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendors');
    }
  };

  const openVendorModal = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorModalOpen(true);
    try {
      const res = await api.get(`/vendor/history?vendorId=${vendor.id}`);
      setVendorOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendor orders');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-warning text-warning-foreground',
      SHIPPED: 'bg-primary text-primary-foreground',
      RECEIVED: 'bg-success text-success-foreground',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {vendors.map(vendor => (
            <Card key={vendor.id} className="shadow-card hover:shadow-glow transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {vendor.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Contact:</strong> {vendor.contactPerson}</p>
                <p><strong>Email:</strong> {vendor.email}</p>
                <p><strong>Phone:</strong> {vendor.phone}</p>
                {vendor.address && <p><strong>Address:</strong> {vendor.address}</p>}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => openVendorModal(vendor)}>View Orders</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vendor Orders Modal */}
        <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVendor?.name}</DialogTitle>
            </DialogHeader>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0,8)}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DialogFooter>
              <Button onClick={() => setVendorModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Vendors;

