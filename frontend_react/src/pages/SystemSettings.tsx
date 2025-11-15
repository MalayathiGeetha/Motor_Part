import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Setting {
  key: string;
  value: string;
  label: string;
  description: string;
  type: 'number' | 'text';
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([
    {
      key: 'TAX_RATE',
      value: '0.08',
      label: 'Tax Rate',
      description: 'Sales tax rate (as decimal, e.g., 0.08 for 8%)',
      type: 'number',
    },
    {
      key: 'LOW_STOCK_THRESHOLD',
      value: '10',
      label: 'Low Stock Threshold',
      description: 'Default threshold for low stock alerts',
      type: 'number',
    },
    {
      key: 'CURRENCY',
      value: 'USD',
      label: 'Currency',
      description: 'Currency code (e.g., USD, EUR, GBP)',
      type: 'text',
    },
    {
      key: 'COMPANY_NAME',
      value: 'MotoHub',
      label: 'Company Name',
      description: 'Your company name for invoices and reports',
      type: 'text',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role');

  useEffect(() => {
    // Check role access first
    if (!role) {
      window.location.href = '/login';
      return;
    }
    if (!['SHOP_OWNER', 'SYSTEM_ADMIN'].includes(role)) {
      toast.error('Access denied');
      window.location.href = '/dashboard';
      return;
    }
    
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      // Update settings with fetched values
      if (response.data && response.data.length > 0) {
        setSettings(prevSettings =>
          prevSettings.map(setting => {
            const fetchedSetting = response.data.find((s: any) => s.key === setting.key);
            return {
              ...setting,
              value: fetchedSetting?.value || setting.value,
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      await api.put('/settings', settingsObject);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Only Shop Owners and System Admins can modify settings.');
      } else {
        toast.error('Failed to save settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-1">Manage global system configuration</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid gap-6">
          {settings.map((setting) => (
            <Card key={setting.key} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {setting.label}
                </CardTitle>
                <CardDescription>{setting.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.label}</Label>
                  <Input
                    id={setting.key}
                    type={setting.type}
                    value={setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    step={setting.type === 'number' ? '0.01' : undefined}
                    min={setting.type === 'number' ? '0' : undefined}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card bg-muted/50">
          <CardHeader>
            <CardTitle>About System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              These settings affect the entire system. Changes here will be applied to all users and operations.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tax rate is used for all sales calculations</li>
              <li>Low stock threshold triggers alerts when inventory falls below this level</li>
              <li>Currency affects how prices are displayed throughout the system</li>
              <li>Company name appears on invoices and reports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
