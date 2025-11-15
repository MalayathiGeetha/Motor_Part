import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setApiError(false);
      
      // Try to fetch from the correct API endpoint
      const response = await api.get('/admin/audit').catch(() => {
        // If API call fails, use mock data
        throw new Error('API endpoint not available');
      });
      
      setLogs(response.data.content || response.data); // Handle both pageable and array responses
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setApiError(true);
      // Use mock data as fallback
      const mockLogs = getMockAuditLogs();
      setLogs(mockLogs);
      toast.info('Using demo audit data');
    } finally {
      setLoading(false);
    }
  };

  const getMockAuditLogs = (): AuditLog[] => [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user1',
      userName: 'John Doe',
      action: 'CREATE',
      entityType: 'PART',
      entityId: 'PART-001',
      details: 'Created new part: Oil Filter Z-10'
    },
    {
      id: '2',
      timestamp: '2024-01-15T11:15:00Z',
      userId: 'user2',
      userName: 'Jane Smith',
      action: 'UPDATE',
      entityType: 'INVENTORY',
      entityId: 'INV-005',
      details: 'Updated stock quantity from 50 to 45'
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00Z',
      userId: 'user3',
      userName: 'Mike Johnson',
      action: 'DELETE',
      entityType: 'USER',
      entityId: 'USER-008',
      details: 'Deleted user account: old-employee@company.com'
    },
    {
      id: '4',
      timestamp: '2024-01-15T16:45:00Z',
      userId: 'user4',
      userName: 'Sarah Wilson',
      action: 'LOGIN',
      entityType: 'SYSTEM',
      entityId: 'AUTH-012',
      details: 'Successful login from IP: 192.168.1.100'
    },
    {
      id: '5',
      timestamp: '2024-01-16T09:10:00Z',
      userId: 'user1',
      userName: 'John Doe',
      action: 'CREATE',
      entityType: 'SALE',
      entityId: 'SALE-202',
      details: 'Created new sale with total $250.00'
    }
  ];

  const filterLogs = () => {
    let filtered = [...logs];

    if (entityFilter !== 'all') {
      filtered = filtered.filter(log => log.entityType === entityFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    const actionColors = {
      CREATE: 'bg-green-500 text-white',
      UPDATE: 'bg-blue-500 text-white',
      DELETE: 'bg-red-500 text-white',
      LOGIN: 'bg-purple-500 text-white',
      VIEW: 'bg-gray-500 text-white',
    };
    return <Badge className={actionColors[action as keyof typeof actionColors] || 'bg-gray-500 text-white'}>{action}</Badge>;
  };

  const entityTypes = ['all', 'PART', 'SALE', 'VENDOR', 'PURCHASE_ORDER', 'USER', 'INVENTORY', 'SYSTEM'];
  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'VIEW'];

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
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">Track all system changes and user activities</p>
          </div>
          {apiError && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Using Demo Data
            </Badge>
          )}
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
                    Using demo audit log data. Real API endpoints are not available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Entity Type</label>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action === 'all' ? 'All Actions' : action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Trail ({filteredLogs.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No audit logs found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.entityType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.entityId}
                        </TableCell>
                        <TableCell className="max-w-md">{log.details}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
