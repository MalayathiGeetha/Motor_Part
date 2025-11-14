import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SalesTerminal from "./pages/SalesTerminal";
import Inventory from "./pages/Inventory";
import Vendors from "./pages/Vendors";
import VendorPortal from "./pages/VendorPortal";
import SystemSettings from "./pages/SystemSettings";
import AuditLogs from "./pages/AuditLogs";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER', 'INVENTORY_MANAGER', 'SALES_EXECUTIVE', 'SYSTEM_ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-terminal"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER', 'SALES_EXECUTIVE']}>
                  <SalesTerminal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER', 'INVENTORY_MANAGER']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER', 'INVENTORY_MANAGER']}>
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-portal"
              element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER', 'SYSTEM_ADMIN']}>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['AUDITOR', 'SYSTEM_ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
