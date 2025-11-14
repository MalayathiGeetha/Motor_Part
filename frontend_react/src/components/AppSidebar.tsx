import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Building2, 
  Settings, 
  FileText, 
  Users, 
  LogOut,
  Truck,
  Menu
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SHOP_OWNER', 'INVENTORY_MANAGER', 'SALES_EXECUTIVE', 'SYSTEM_ADMIN'],
  },
  {
    title: 'Sales Terminal',
    url: '/sales-terminal',
    icon: ShoppingCart,
    roles: ['SHOP_OWNER', 'SALES_EXECUTIVE'],
  },
  {
    title: 'Inventory',
    url: '/inventory',
    icon: Package,
    roles: ['SHOP_OWNER', 'INVENTORY_MANAGER'],
  },
  {
    title: 'Vendors',
    url: '/vendors',
    icon: Building2,
    roles: ['SHOP_OWNER', 'INVENTORY_MANAGER'],
  },
  {
    title: 'Vendor Portal',
    url: '/vendor-portal',
    icon: Truck,
    roles: ['VENDOR'],
  },
  {
    title: 'System Settings',
    url: '/settings',
    icon: Settings,
    roles: ['SHOP_OWNER', 'SYSTEM_ADMIN'],
  },
  {
    title: 'Audit Logs',
    url: '/audit-logs',
    icon: FileText,
    roles: ['AUDITOR', 'SYSTEM_ADMIN'],
  },
  {
    title: 'User Management',
    url: '/user-management',
    icon: Users,
    roles: ['SYSTEM_ADMIN'],
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className={collapsed ? 'w-16' : 'w-64'}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">MotoHub</h2>
              <p className="text-xs text-sidebar-foreground/60">Parts Management</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary mx-auto">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start"
          size={collapsed ? 'icon' : 'default'}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
