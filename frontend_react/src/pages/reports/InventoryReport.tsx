import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  value: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

interface StockMovement {
  id: string;
  product: string;
  type: 'Incoming' | 'Outgoing' | 'Adjustment';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockTurnover: number;
  growthRate: string;
}

export default function InventoryReport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      try {
        // Mock inventory data
        const mockInventoryData: InventoryItem[] = [
          {
            id: '1',
            name: 'Engine Oil 5W-30',
            category: 'Fluids',
            currentStock: 8,
            minStock: 20,
            maxStock: 100,
            unitPrice: 25.99,
            value: 207.92,
            status: 'Low Stock',
            lastUpdated: '2024-01-15'
          },
          {
            id: '2',
            name: 'Air Filter',
            category: 'Filters',
            currentStock: 12,
            minStock: 25,
            maxStock: 150,
            unitPrice: 15.50,
            value: 186.00,
            status: 'Low Stock',
            lastUpdated: '2024-01-15'
          },
          {
            id: '3',
            name: 'Brake Pads',
            category: 'Brakes',
            currentStock: 45,
            minStock: 30,
            maxStock: 200,
            unitPrice: 45.99,
            value: 2069.55,
            status: 'In Stock',
            lastUpdated: '2024-01-14'
          },
          {
            id: '4',
            name: 'Spark Plugs',
            category: 'Ignition',
            currentStock: 0,
            minStock: 15,
            maxStock: 100,
            unitPrice: 8.99,
            value: 0,
            status: 'Out of Stock',
            lastUpdated: '2024-01-13'
          },
          {
            id: '5',
            name: 'Oil Filter',
            category: 'Filters',
            currentStock: 35,
            minStock: 20,
            maxStock: 120,
            unitPrice: 12.99,
            value: 454.65,
            status: 'In Stock',
            lastUpdated: '2024-01-15'
          },
          {
            id: '6',
            name: 'Transmission Fluid',
            category: 'Fluids',
            currentStock: 28,
            minStock: 15,
            maxStock: 80,
            unitPrice: 18.75,
            value: 525.00,
            status: 'In Stock',
            lastUpdated: '2024-01-14'
          }
        ];

        const mockStockMovements: StockMovement[] = [
          {
            id: '1',
            product: 'Spark Plugs',
            type: 'Incoming',
            quantity: 100,
            date: '2024-01-15',
            reason: 'Restock',
            user: 'Inventory Manager'
          },
          {
            id: '2',
            product: 'Oil Filter',
            type: 'Outgoing',
            quantity: 45,
            date: '2024-01-14',
            reason: 'Sales',
            user: 'Sales Terminal'
          },
          {
            id: '3',
            product: 'Air Filter',
            type: 'Incoming',
            quantity: 200,
            date: '2024-01-13',
            reason: 'Restock',
            user: 'Inventory Manager'
          },
          {
            id: '4',
            product: 'Engine Oil 5W-30',
            type: 'Outgoing',
            quantity: 25,
            date: '2024-01-12',
            reason: 'Sales',
            user: 'Sales Terminal'
          },
          {
            id: '5',
            product: 'Brake Pads',
            type: 'Adjustment',
            quantity: -5,
            date: '2024-01-11',
            reason: 'Damage',
            user: 'Quality Control'
          }
        ];

        const mockStats: InventoryStats = {
          totalItems: 245,
          totalValue: 87520,
          lowStockItems: 8,
          outOfStockItems: 3,
          stockTurnover: 4.2,
          growthRate: '+5.3%'
        };

        setInventoryData(mockInventoryData);
        setStockMovements(mockStockMovements);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'Incoming':
        return 'text-green-500 bg-green-500/10';
      case 'Outgoing':
        return 'text-blue-500 bg-blue-500/10';
      case 'Adjustment':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventoryData.filter(item => item.status === 'Low Stock');
  const outOfStockItems = inventoryData.filter(item => item.status === 'Out of Stock');

  const handleExport = () => {
    console.log('Exporting inventory report...');
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
            <p className="text-muted-foreground">Loading inventory report...</p>
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
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Inventory Report</h1>
                <p className="text-muted-foreground">Stock levels, movements, and analytics</p>
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
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems}</div>
              <p className="text-xs text-muted-foreground">Unique products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalValue?.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {stats?.growthRate} from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stockTurnover}</div>
              <p className="text-xs text-muted-foreground">Times per year</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Detailed Analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>Complete inventory listing with stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className={getStockStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.currentStock} units</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Min: {item.minStock}</span>
                          <span>Max: {item.maxStock}</span>
                          <span>${item.unitPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Low Stock Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Items ({lowStockItems.length})
                  </CardTitle>
                  <CardDescription>Items below minimum stock level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-700">{item.currentStock} / {item.minStock}</p>
                          <Badge variant="outline" className="bg-yellow-100">
                            Order Needed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Out of Stock Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Out of Stock Items ({outOfStockItems.length})
                  </CardTitle>
                  <CardDescription>Items that need immediate restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {outOfStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-700">0 / {item.minStock}</p>
                          <Badge variant="outline" className="bg-red-100 text-red-700">
                            Urgent
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movements</CardTitle>
                <CardDescription>Recent inventory transactions and adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getMovementColor(movement.type)}`}>
                          {movement.type === 'Incoming' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : movement.type === 'Outgoing' ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <BarChart3 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{movement.product}</p>
                          <p className="text-sm text-muted-foreground">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          movement.type === 'Incoming' ? 'text-green-500' :
                          movement.type === 'Outgoing' ? 'text-blue-500' : 'text-orange-500'
                        }`}>
                          {movement.type === 'Incoming' ? '+' : movement.type === 'Outgoing' ? '-' : '±'}{movement.quantity}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(movement.date).toLocaleDateString()}
                          <span className="text-xs">by {movement.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Inventory Distribution
                  </CardTitle>
                  <CardDescription>Stock levels by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Fluids</span>
                      <div className="text-right">
                        <span className="font-bold">36 items</span>
                        <p className="text-xs text-muted-foreground">15% of inventory</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Filters</span>
                      <div className="text-right">
                        <span className="font-bold">42 items</span>
                        <p className="text-xs text-muted-foreground">17% of inventory</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Brakes</span>
                      <div className="text-right">
                        <span className="font-bold">28 items</span>
                        <p className="text-xs text-muted-foreground">11% of inventory</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Ignition</span>
                      <div className="text-right">
                        <span className="font-bold">35 items</span>
                        <p className="text-xs text-muted-foreground">14% of inventory</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Key inventory performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Inventory Accuracy</span>
                      <Badge variant="secondary">98.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Carrying Cost</span>
                      <span className="font-bold">$12,450</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Stockout Rate</span>
                      <Badge variant="secondary">1.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Average Stock Level</span>
                      <span className="font-bold">64%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
