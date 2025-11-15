import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, FileText, Calendar, DollarSign } from 'lucide-react';
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
  id: string | number;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'PENDING' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED' | 'PARTIAL';
  totalOrderValue: number;
  totalAmount?: number;
  items?: OrderItem[];
  notes?: string;
}

interface OrderItem {
  id: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorOrders, setVendorOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [addOrderModalOpen, setAddOrderModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    vendorName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  // New purchase order form state
  const [newOrder, setNewOrder] = useState({
    vendorId: '',
    expectedDelivery: '',
    items: [{ partName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    notes: ''
  });

  const role = localStorage.getItem('role');
  
  
  const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'Invalid Date') return 'Invalid Date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

  // Debug function to check auth status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Current role:', role);
      
      // Try to make a simple request to check auth
      const response = await api.get('/vendor/debug/roles');
      console.log('User roles from backend:', response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  useEffect(() => {
    if (!role) {
      window.location.href = '/login';
      return;
    }
    
    // Debug: Check what role is stored
    console.log('Current role from localStorage:', role);
    console.log('Available roles check:', ['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role));
    
    if (!['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role)) {
      toast.error('Access denied');
      window.location.href = '/dashboard';
      return;
    }

    fetchVendors();
    checkAuthStatus();
    setLoading(false);
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendor');
      const vendorsWithDefaults = res.data.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.vendorName || vendor.name || 'Unknown Vendor',
        contactPerson: vendor.contactPerson || vendor.contact || 'Not specified',
        email: vendor.email || 'No email provided',
        phone: vendor.phoneNumber || vendor.phone || 'No phone provided',
        address: vendor.address || 'No address provided'
      }));
      setVendors(vendorsWithDefaults);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendors');
    }
  };

const fetchVendorOrders = async (vendorId: string) => {
  try {
    const res = await api.get(`/vendor/history?vendorId=${vendorId}`);
    console.log('Raw backend response:', res.data); // Debug log
    
    // Transform the data to ensure consistent structure
    const orders = res.data.map((order: any) => ({
      id: order.id || order.orderId,
      vendorId: order.vendorId,
      vendorName: order.vendorName || selectedVendor?.name,
      orderDate: order.orderDate || order.createdAt,
      expectedDelivery: order.expectedDelivery || order.expectedDeliveryDate || order.deliveryDate,
      status: order.status || 'PENDING',
      totalOrderValue: order.totalOrderValue || order.totalAmount || order.amount || 0,
      items: order.items ? order.items.map((item: any) => {
        // Use the correct field names from your backend entity
        const quantity = item.quantityOrdered || item.quantity || 0;
        const unitPrice = item.unitCost || item.unitPrice || 0;
        const totalPrice = item.lineTotal || item.totalPrice || (quantity * unitPrice);
        
        console.log('Item data:', { // Debug each item
          original: item,
          quantityOrdered: item.quantityOrdered,
          quantity: quantity,
          unitCost: item.unitCost,
          lineTotal: item.lineTotal,
          totalPrice: totalPrice
        });
        
        return {
          id: item.id,
          partName: item.part?.partName || item.partName || `Part ${item.partId}`,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        };
      }) : [],
      notes: order.notes || ''
    }));
    setVendorOrders(orders);
  } catch (err) {
    console.error(err);
    toast.error('Failed to load vendor orders');
    setVendorOrders([]);
  }
};


  const openVendorModal = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorModalOpen(true);
    await fetchVendorOrders(vendor.id);
  };

  const openOrderDetail = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setOrderDetailModalOpen(true);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!['SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role || '')) {
      toast.error('Access denied. Only Shop Owners and System Admins can add vendors.');
      return;
    }

    setCreating(true);

    try {
      await api.post('/vendor', newVendor);
      toast.success('Vendor added successfully');
      setAddVendorModalOpen(false);
      setNewVendor({
        vendorName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        address: ''
      });
      fetchVendors();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        toast.error('Access denied. You do not have permission to add vendors.');
      } else {
        toast.error('Failed to add vendor');
      }
    } finally {
      setCreating(false);
    }
  };

  // Order item management functions
  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { partName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total price if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = quantity * unitPrice;
    }
    
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const removeOrderItem = (index: number) => {
    if (newOrder.items.length > 1) {
      const updatedItems = newOrder.items.filter((_, i) => i !== index);
      setNewOrder({ ...newOrder, items: updatedItems });
    }
  };

const handleAddOrder = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedVendor) {
    toast.error('No vendor selected');
    return;
  }

  setCreatingOrder(true);

  try {
    const orderData = {
      vendorId: parseInt(selectedVendor.id), // Convert to Long
      expectedDeliveryDate: newOrder.expectedDelivery, // Match backend field name
      items: newOrder.items.filter(item => item.partName && item.quantity > 0).map(item => ({
        partId: 1, // You need to add partId selection in your form!
        quantity: item.quantity,
        unitCost: item.unitPrice // Match backend field name
      }))
      // Remove notes, status, totalAmount - backend doesn't expect these
    };

    console.log('Sending order data:', orderData);
    
    const response = await api.post('/vendor/order', orderData);
    toast.success('Purchase order created successfully');
    setAddOrderModalOpen(false);
    setNewOrder({
      vendorId: '',
      expectedDelivery: '',
      items: [{ partName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      notes: ''
    });
    
    await fetchVendorOrders(selectedVendor.id);
  } catch (err: any) {
    console.error('Order creation failed:', err);
    toast.error('Failed to create order. Check console for details.');
  } finally {
    setCreatingOrder(false);
  }
};

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      RECEIVED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      PARTIAL: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const formatOrderId = (id: string | number): string => {
    const idString = id.toString();
    return `#${idString.padStart(6, '0')}`;
  };

  


  const canAddVendor = ['SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role || '');
  const canAddOrder = ['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role || '');

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          {canAddVendor && (
            <Button onClick={() => setAddVendorModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          )}
        </div>

        {vendors.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground mb-4">
                {canAddVendor 
                  ? 'Get started by adding your first vendor to manage purchases and inventory.'
                  : 'No vendors have been added yet. Please contact a Shop Owner or System Admin to add vendors.'
                }
              </p>
              {canAddVendor && (
                <Button onClick={() => setAddVendorModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Vendor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
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
        )}

        {/* Add Vendor Modal */}
        {canAddVendor && (
          <Dialog open={addVendorModalOpen} onOpenChange={setAddVendorModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Add a new vendor to your system. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddVendor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      value={newVendor.vendorName}
                      onChange={(e) => setNewVendor({...newVendor, vendorName: e.target.value})}
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={newVendor.contactPerson}
                      onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})}
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone *</Label>
                    <Input
                      id="phoneNumber"
                      value={newVendor.phoneNumber}
                      onChange={(e) => setNewVendor({...newVendor, phoneNumber: e.target.value})}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={newVendor.address}
                      onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddVendorModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Adding Vendor...' : 'Add Vendor'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Vendor Orders Modal */}
        <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Purchase Orders - {selectedVendor?.name}
              </DialogTitle>
              <DialogDescription>
                Manage purchase orders for {selectedVendor?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {vendorOrders.length} order(s) found
              </p>
              {canAddOrder && (
                <Button 
                  onClick={() => setAddOrderModalOpen(true)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              )}
            </div>

            {vendorOrders.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No purchase orders found for this vendor.</p>
                {canAddOrder && (
                  <Button 
                    onClick={() => setAddOrderModalOpen(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Order
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorOrders.map(order => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{formatOrderId(order.id)}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{formatDate(order.expectedDelivery)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
  			${((order?.totalOrderValue ?? order?.totalAmount ?? 0)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openOrderDetail(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DialogFooter>
              <Button onClick={() => setVendorModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Purchase Order Modal */}
        <Dialog open={addOrderModalOpen} onOpenChange={setAddOrderModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Create a new purchase order for {selectedVendor?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={newOrder.expectedDelivery}
                    onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Order Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg">
                    <div className="col-span-5">
                      <Label htmlFor={`partName-${index}`}>Part Name</Label>
                      <Input
                        id={`partName-${index}`}
                        value={item.partName}
                        onChange={(e) => updateOrderItem(index, 'partName', e.target.value)}
                        placeholder="Enter part name"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Qty</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="p-2 border rounded text-sm font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {newOrder.items.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  placeholder="Any additional notes for this order..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Order Total:</span>
                  <span className="text-lg">
                    ${newOrder.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOrderModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingOrder}>
                  {creatingOrder ? 'Creating Order...' : 'Create Purchase Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Order Detail Modal */}
        <Dialog open={orderDetailModalOpen} onOpenChange={setOrderDetailModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details {selectedOrder && formatOrderId(selectedOrder.id)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vendor</Label>
                    <p className="font-medium">{selectedOrder.vendorName}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <Label>Order Date</Label>
                    <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <p className="font-medium">{formatDate(selectedOrder.expectedDelivery)}</p>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <Label>Order Items</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Name</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.partName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
			        ${((item?.unitPrice ?? 0)).toFixed(2)}
			      </TableCell>
			      <TableCell className="text-right">
			        ${((item?.totalPrice ?? 0)).toFixed(2)}
			      </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

               <div className="border-t pt-4">
		  <div className="flex justify-between items-center font-semibold text-lg">
		    <span>Total Amount:</span>
		    <span>${((selectedOrder?.totalOrderValue ?? selectedOrder?.totalAmount ?? 0)).toFixed(2)}</span>
		  </div>
		</div>

                {selectedOrder.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setOrderDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Vendors;
