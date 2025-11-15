import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Part {
  id: string;
  partName: string;
  description: string;
  unitPrice: number;
  currentStock: number;
  imageUrl?: string;
  rackLocation?: string;
}

interface CartItem extends Part {
  quantity: number;
}

interface DailySummary {
  grossSalesAmount: number;      // before tax
  taxCollectedAmount: number;    // tax
  netRevenueAmount: number;      // after tax (grand total)
  totalTransactions: number;     // count
}


const SalesTerminal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taxRate] = useState(0.08);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
const [showDetails, setShowDetails] = useState(false);


  const [dailySummary, setDailySummary] = useState<DailySummary>({
    totalRevenue: 0,
    totalSalesCount: 0,
    totalTaxCollected: 0,
  });

  const [invoiceDialog, setInvoiceDialog] = useState(false);

  // ✅ safer lastInvoice default
  const [lastInvoice, setLastInvoice] = useState<{
    id?: number;
    total: number;
    subtotal: number;
    tax: number;
    items: { name: string; quantity: number; price: number; total: number }[];
    date: Date;
  }>({
    total: 0,
    subtotal: 0,
    tax: 0,
    items: [],
    date: new Date(),
  });

  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!role) {
      window.location.href = '/login';
    } else if (!['SALES_EXECUTIVE', 'SHOP_OWNER'].includes(role)) {
      toast.error('Access denied');
      window.location.href = '/dashboard';
    } else {
      fetchDailySummary();
      fetchAllParts();
    }
  }, []);

const fetchAllParts = async () => {
  try {
    const response = await api.get('/inventory/parts');
    setParts(response.data);
  } catch (err: any) {
    console.error("❌ Failed to fetch parts:", err.response?.status, err.response?.data);
    toast.error('Failed to fetch inventory');
  }
};



  const searchParts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (!searchQuery.trim()) {
        response = await api.get('/inventory/parts');
      } else {
        response = await api.get(`/inventory/parts/search?query=${searchQuery}`);
      }
      setParts(response.data);
    } catch {
      toast.error('Failed to load parts');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (part: Part) => {
  const existing = cart.find((i) => i.id === part.id);

  if (existing) {
    if (existing.quantity >= part.currentStock)
      return toast.error('Not enough stock available');

    // Increase quantity
    setCart(cart.map((i) =>
      i.id === part.id ? { ...i, quantity: i.quantity + 1 } : i
    ));

    // Reduce stock in parts list
    setParts(parts.map((p) =>
      p.id === part.id ? { ...p, currentStock: p.currentStock - 1 } : p
    ));

  } else {
    if (part.currentStock <= 0)
      return toast.error('Out of stock');

    setCart([...cart, { ...part, quantity: 1 }]);

    setParts(parts.map((p) =>
      p.id === part.id ? { ...p, currentStock: p.currentStock - 1 } : p
    ));
  }

  toast.success('Added to cart');
};


  const updateQuantity = (id: string, change: number) => {
  const cartItem = cart.find((item) => item.id === id);
  if (!cartItem) return;

  const part = parts.find((p) => p.id === id);
  if (!part) return;

  if (change === 1) {
    if (part.currentStock <= 0)
      return toast.error('Not enough stock');

    // Increase cart quantity
    setCart(cart.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    ));

    // Reduce available stock
    setParts(parts.map((p) =>
      p.id === id ? { ...p, currentStock: p.currentStock - 1 } : p
    ));
  }

  if (change === -1) {
    if (cartItem.quantity === 1) return; // no negatives

    // Decrease cart quantity
    setCart(cart.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity - 1 } : i
    ));

    // Increase stock back
    setParts(parts.map((p) =>
      p.id === id ? { ...p, currentStock: p.currentStock + 1 } : p
    ));
  }
};


  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.success('Removed from cart');
  };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // ✅ FIXED recordSale
const recordSale = async () => {
  if (cart.length === 0) return toast.error('Cart is empty');

  try {
    const saleRequest = {
      customerName: 'Walk-in Customer',
      items: cart.map((i) => ({
        partId: Number(i.id),
        quantity: Number(i.quantity),
      })),
    };

    const res = await api.post('/sales/record', saleRequest);

    // ✅ Extract updated summary correctly
    if (res.data?.updatedSummary) {
      const s = res.data.updatedSummary;
      setDailySummary({
        grossSalesAmount: s.grossSalesAmount ?? 0,
        taxCollectedAmount: s.taxCollectedAmount ?? 0,
        netRevenueAmount: s.netRevenueAmount ?? 0,
        totalTransactions: s.totalTransactions ?? 0,
      });
    }

    toast.success('✅ Sale recorded successfully!');

    const invoiceData = res.data?.invoice;
    setLastInvoice({
      id: invoiceData?.id || Date.now(),
      date: new Date(),
      subtotal: invoiceData?.subTotal ?? subtotal,
      tax: invoiceData?.taxAmount ?? tax,
      total: invoiceData?.grandTotal ?? total,
      items: cart.map((i) => ({
        name: i.partName,
        quantity: i.quantity,
        price: i.unitPrice,
        total: i.unitPrice * i.quantity,
      })),
    });

    setInvoiceDialog(true);
  } catch (error: any) {
    console.error('❌ Failed to record sale:', error.response?.data || error.message);
    const backendMsg = error.response?.data?.message || '';
    if (backendMsg.toLowerCase().includes('insufficient stock')) {
      toast.error(`🚫 ${backendMsg}`);
    } else if (error.response?.status === 403) {
      toast.error('🚫 You are not authorized to record sales.');
    } else if (error.response?.status === 400) {
      toast.error('⚠️ Sale failed: Invalid data or unavailable stock.');
    } else {
      toast.error('❌ Failed to record sale. Please try again.');
    }
  }
};


const fetchDailySummary = async () => {
  try {
    const res = await api.get('/sales/summary/daily');
    setDailySummary({
      grossSalesAmount: res.data?.grossSalesAmount ?? 0,
      taxCollectedAmount: res.data?.taxCollectedAmount ?? 0,
      netRevenueAmount: res.data?.netRevenueAmount ?? 0,
      totalTransactions: res.data?.totalTransactions ?? 0,
    });
  } catch {
    toast.error('Failed to fetch daily summary');
  }
};


  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !lastInvoice) return;

    const html = `
      <html>
        <head><title>Invoice #${lastInvoice.id}</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h2>🧾 MotorShop Invoice</h2>
          <p><strong>Date:</strong> ${new Date(lastInvoice.date).toLocaleString()}</p>
          <hr/>
          <table width="100%" border="1" cellspacing="0" cellpadding="8">
            <thead><tr><th>Part</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${lastInvoice.items
                .map(
                  (i) =>
                    `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price.toFixed(
                      2
                    )}</td><td>$${i.total.toFixed(2)}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
          <hr/>
          <p><strong>Subtotal:</strong> $${lastInvoice.subtotal.toFixed(2)}<br/>
          <strong>Tax:</strong> $${lastInvoice.tax.toFixed(2)}<br/>
          <strong>Total:</strong> $${lastInvoice.total.toFixed(2)}</p>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onafterprint = async () => {
    await fetchDailySummary();
    await fetchAllParts();
  };
    printWindow.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        {/* PRODUCT DETAILS MODAL */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPart?.partName}</DialogTitle>
            </DialogHeader>

            {selectedPart && (
              <div className="space-y-3">
                <img
                  src={selectedPart.imageUrl}
                  alt={selectedPart.partName}
                  className="w-full h-40 object-cover rounded-md"
                />

                <p><strong>Description:</strong> {selectedPart.description || 'No description'}</p>
	        <p><strong>Stock:</strong> {selectedPart.currentStock}</p>
	        <p><strong>Price:</strong> ${selectedPart.unitPrice.toFixed(2)}</p>

                <Button
                  className="w-full"
                  onClick={() => {
                    addToCart(selectedPart);
                    setShowDetails(false);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        
          <div>
            <h1 className="text-3xl font-bold">Sales Terminal</h1>
            <p className="text-muted-foreground mt-1">Search and add parts to complete a sale</p>
          </div>

          <Card className="w-72">
	  <CardContent className="p-4">
	    <p className="font-semibold text-sm">Today's Summary</p>
	   <p className="text-sm text-muted-foreground mt-1">
	  Sales: <strong>{dailySummary?.totalTransactions ?? 0}</strong><br />
	  Gross: <strong>${(dailySummary?.grossSalesAmount ?? 0).toFixed(2)}</strong><br />
	  Tax: <strong>${(dailySummary?.taxCollectedAmount ?? 0).toFixed(2)}</strong><br />
	  Net: <strong>${(dailySummary?.netRevenueAmount ?? 0).toFixed(2)}</strong>
	</p>

	  </CardContent>
	</Card>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Search Parts</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, code, or rack location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchParts()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={searchParts} disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {parts.map((p) => (
                <Card 
		   key={p.id} 
		   className="shadow-card hover:shadow-glow transition-shadow cursor-pointer"
		   onClick={() => {
		      setSelectedPart(p);
		      setShowDetails(true);
		   }}
		>

                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 bg-muted flex items-center justify-center overflow-hidden rounded-lg">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.partName} className="h-full w-full object-cover" />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{p.partName}</h3>
                        <p className="text-sm text-muted-foreground truncate">{p.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold">${p.unitPrice.toFixed(2)}</span>
                          {p.currentStock <= 0 ? (
			  <Badge variant="destructive">Out of stock</Badge>
			) : (
			  <Badge variant={p.currentStock > 10 ? 'default' : 'destructive'}>
			    {p.currentStock} in stock
			  </Badge>
			)}

                        </div>
                        <Button size="sm" onClick={() => addToCart(p)} disabled={p.currentStock === 0}>
			  Add to Cart
			</Button>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div>
            <Card className="shadow-card sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((i) => (
                        <div key={i.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{i.partName}</p>
                            <p className="text-sm text-muted-foreground">${i.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => updateQuantity(i.id, -1)} className="h-8 w-8">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{i.quantity}</span>
                            <Button size="icon" variant="ghost" onClick={() => updateQuantity(i.id, 1)} className="h-8 w-8">
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => removeFromCart(i.id)} className="h-8 w-8 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ✅ Fixed totals display */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span><span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={recordSale} className="w-full" size="lg">Record Sale</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ✅ Invoice Dialog */}
        <Dialog
		  open={invoiceDialog}
          onOpenChange={async (open) => {
            setInvoiceDialog(open);
            if (!open) {
              // ✅ Wait for backend to finish saving invoice before refreshing summary
              await new Promise((resolve) => setTimeout(resolve, 800));

              try {
                await fetchDailySummary();
                await fetchAllParts();
              } catch (err) {
                console.error('Error refreshing after invoice close:', err);
              }

              setCart([]);
              setSearchQuery('');
            }
          }}
		>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Sale Invoice</DialogTitle>
            </DialogHeader>
            {lastInvoice && (
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> {new Date(lastInvoice.date).toLocaleString()}</p>
                <p><strong>Total:</strong> ${lastInvoice.total.toFixed(2)}</p>
                <p><strong>Items:</strong></p>
                <ul className="list-disc pl-5">
                  {lastInvoice.items.map((i, idx) => (
                    <li key={idx}>
                      {i.name} × {i.quantity} = ${i.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button onClick={printInvoice}>
                <Receipt className="h-4 w-4 mr-2" />Print Invoice
              </Button>
              <Button variant="secondary" onClick={() => setInvoiceDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SalesTerminal;






