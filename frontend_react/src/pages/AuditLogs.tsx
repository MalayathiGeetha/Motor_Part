import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter } from 'lucide-react';
import api from '@/lib/api';
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

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

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
      CREATE: 'bg-success text-success-foreground',
      UPDATE: 'bg-primary text-primary-foreground',
      DELETE: 'bg-destructive text-destructive-foreground',
      LOGIN: 'bg-accent text-accent-foreground',
    };
    return <Badge className={actionColors[action as keyof typeof actionColors] || 'bg-muted'}>{action}</Badge>;
  };

  const entityTypes = ['all', 'PART', 'SALE', 'VENDOR', 'PURCHASE_ORDER', 'USER'];
  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all system changes and user activities</p>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
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
        <Card className="shadow-card">
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
                  {filteredLogs.map((log) => (
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
                        {log.entityId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
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
