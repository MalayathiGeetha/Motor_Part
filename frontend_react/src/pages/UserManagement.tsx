import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Shield } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('SALES_EXECUTIVE');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(`/admin/update-role`, {
        userId: selectedUser.id,
        role: newRole,
      });
      toast.success('User role updated successfully');
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      SHOP_OWNER: 'bg-primary text-primary-foreground',
      INVENTORY_MANAGER: 'bg-accent text-accent-foreground',
      SALES_EXECUTIVE: 'bg-success text-success-foreground',
      SYSTEM_ADMIN: 'bg-destructive text-destructive-foreground',
      AUDITOR: 'bg-warning text-warning-foreground',
      VENDOR: 'bg-secondary text-secondary-foreground',
    };
    return <Badge className={roleColors[role]}>{role.replace('_', ' ')}</Badge>;
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'SHOP_OWNER', label: 'Shop Owner' },
    { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
    { value: 'SALES_EXECUTIVE', label: 'Sales Executive' },
    { value: 'SYSTEM_ADMIN', label: 'System Admin' },
    { value: 'AUDITOR', label: 'Auditor' },
    { value: 'VENDOR', label: 'Vendor' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and their roles</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRoleDialog(user)}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Update Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <div className="p-3 rounded-lg bg-muted">
                  {selectedUser && getRoleBadge(selectedUser.role)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
