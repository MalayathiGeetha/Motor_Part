import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, AlertCircle, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Part {
  id: string;
  partName: string;
  partCode?: string;
  description: string;
  unitPrice: number;
  initialLevel: number;
  reorderThreshold: number;
  imageUrl?: string;
  category?: string;
}

interface Vendor {
  id: number;
  vendorName: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
}

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  vendor: Vendor;
  status: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items?: any[];
}

interface StockLog {
  id: number;
  timestamp: string;
  action: string;
  description: string;
}

const Inventory = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [reorderHistory, setReorderHistory] = useState<PurchaseOrder[]>([]);
  const [partLogs, setPartLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [detailsPart, setDetailsPart] = useState<Part | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'alerts'>('all');
  const [formData, setFormData] = useState({
    partCode: '',
    partName: '',
    description: '',
    unitPrice: '',
    initialLevel: '',
    reorderThreshold: '',
    imageUrl: '',
    category: '',
  });

  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchParts();
    fetchVendors();
    fetchReorderHistory();
  }, []);

  useEffect(() => {
    const savedTab = localStorage.getItem('inventoryActiveTab') as 'all' | 'alerts';
    if (savedTab) setActiveTab(savedTab);
  }, []);

  const handleTabChange = (tab: 'all' | 'alerts') => {
    setActiveTab(tab);
    localStorage.setItem('inventoryActiveTab', tab);
  };

  const fetchParts = async () => {
    try {
      const response = await api.get('/inventory/parts');
      const data = response.data.map((p: any) => ({
        ...p,
        initialLevel: p.initialLevel ?? p.stockLevel,
      }));
      setParts(data);
      setLowStockParts(data.filter((p: Part) => p.initialLevel === 0 || p.initialLevel <= p.reorderThreshold));
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendor');
      setVendors(res.data);
    } catch {
      toast.error('Failed to load vendors');
    }
  };

  const fetchReorderHistory = async () => {
    try {
      const res = await api.get('/vendor/history');
      setReorderHistory(res.data);
    } catch {
      toast.error('Failed to load reorder history');
    }
  };

  const fetchPartLogs = async (partId: string) => {
    try {
      const res = await api.get(`/inventory/part/${partId}/audit`);
      setPartLogs(res.data);
    } catch {
      toast.error('Failed to load stock logs');
      setPartLogs([]);
    }
  };

  const getStockBadge = (part: Part) => {
    if (part.initialLevel === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (part.initialLevel <= part.reorderThreshold) return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ensurePartCode = (code: string, name: string) => {
        if (code && code.trim().length > 0) return code.trim();
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 30);
        return `${slug || 'part'}-${Date.now().toString().slice(-5)}`;
      };

      const partData = {
        ...formData,
        partCode: ensurePartCode(formData.partCode, formData.partName),
        unitPrice: parseFloat(formData.unitPrice),
        initialLevel: parseInt(formData.initialLevel),
        reorderThreshold: parseInt(formData.reorderThreshold),
      };

      if (editingPart) {
        await api.put(`/inventory/part/${editingPart.id}`, partData);
        const updatedParts = parts.map(p => (p.id === editingPart.id ? { ...p, ...partData } : p));
        setParts(updatedParts);
        toast.success('Part updated successfully');
      } else {
        const response = await api.post('/inventory/part', partData);
        const updatedParts = [...parts, response.data];
        setParts(updatedParts);
        toast.success('Part added successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save part');
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partCode: part.partCode || '',
      partName: part.partName || '',
      description: part.description || '',
      unitPrice: part.unitPrice?.toString() || '',
      initialLevel: part.initialLevel?.toString() || '',
      reorderThreshold: part.reorderThreshold?.toString() || '',
      imageUrl: part.imageUrl || '',
      category: part.category || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    try {
      await api.delete(`/inventory/part/${id}`);
      setParts(parts.filter(p => p.id !== id));
      toast.success('Part deleted successfully');
    } catch {
      toast.error('Failed to delete part');
    }
  };

  const resetForm = () => {
    setFormData({
      partCode: '',
      partName: '',
      description: '',
      unitPrice: '',
      initialLevel: '',
      reorderThreshold: '',
      imageUrl: '',
      category: '',
    });
    setEditingPart(null);
  };

  // --- ROLE CHECK ---
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!role) {
      window.location.href = '/login';
    } else if (!['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role)) {
      toast.error('Access denied');
      window.location.href = '/dashboard';
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Top Buttons */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>

          <div className="flex gap-3">
            {['INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role || '') && (
              <>
                <Button size="lg" onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-5 w-5 mr-2" /> Add Part
                </Button>

                <Button size="lg" onClick={() => setVendorDialogOpen(true)}>
                  <Archive className="h-5 w-5 mr-2" /> Vendors & Reorder History
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Inventory Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Parts ({parts.length})</TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Low Stock ({lowStockParts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {parts.map(part => (
                <Card
                  key={part.id}
                  className="shadow-card hover:shadow-glow cursor-pointer"
                  onClick={() => {
                    setDetailsPart(part);
                    fetchPartLogs(part.id);
                  }}
                >
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {part.imageUrl ? (
                          <img src={part.imageUrl} alt={part.partName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{part.partName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{part.description}</p>
                        {getStockBadge(part)}
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleEdit(part); }}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDelete(part.id); }}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Part Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPart ? 'Edit Part' : 'Add New Part'}</DialogTitle>
              <DialogDescription>Fill in part details below.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Part Name</Label>
                <Input
                  required
                  value={formData.partName}
                  onChange={e => setFormData({ ...formData, partName: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    required
                    type="number"
                    value={formData.unitPrice}
                    onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Initial Level</Label>
                  <Input
                    required
                    type="number"
                    value={formData.initialLevel}
                    onChange={e => setFormData({ ...formData, initialLevel: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Reorder Threshold</Label>
                  <Input
                    required
                    type="number"
                    value={formData.reorderThreshold}
                    onChange={e => setFormData({ ...formData, reorderThreshold: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingPart ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;

