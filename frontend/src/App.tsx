import { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { POSBillingView } from './components/POSBillingView';
import { InventoryView } from './components/InventoryView';
import { UdhaarLedgerView } from './components/UdhaarLedgerView';
import { SupplierView } from './components/SupplierView';
import { AnalyticsView } from './components/AnalyticsView';
import { CloudServicesView } from './components/CloudServicesView';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthView } from './components/AuthView';
import type { DashboardData, Invoice } from './types';
import { api } from './services/api';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'Owner' | 'Staff'>('Owner');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Native Routing State
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const activeTab = (currentPath.split('/')[1] || 'dashboard') as TabType;

  useEffect(() => {
    if (currentPath === '/') {
      navigate('/dashboard');
    }
  }, [currentPath]);

  useEffect(() => {
    const token = localStorage.getItem('kirana_os_token');
    const user = localStorage.getItem('kirana_os_user');
    if (token && user) {
      setIsAuthenticated(true);
      setUserRole(JSON.parse(user).role);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [activeTab, isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSuccess = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    fetchDashboard();
  };

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('kirana_os_token', token);
    localStorage.setItem('kirana_os_user', JSON.stringify(user));
    setUserRole(user.role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kirana_os_token');
    localStorage.removeItem('kirana_os_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const handleTabChange = (tab: TabType) => {
    navigate(`/${tab}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <HeaderNavbar
        userRole={userRole}
        setUserRole={setUserRole}
        lowStockCount={dashboardData?.metrics.low_stock_count || 0}
        expiringCount={dashboardData?.metrics.expiring_soon_count || 0}
        onAlertsClick={() => handleTabChange('inventory')}
        onCloudClick={() => handleTabChange('cloud')}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          userRole={userRole}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                data={dashboardData}
                loading={loading}
                setActiveTab={handleTabChange}
              />
            )}
            {activeTab === 'pos' && (
              <POSBillingView onCheckoutSuccess={handleCheckoutSuccess} />
            )}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'udhaar' && <UdhaarLedgerView />}
            {activeTab === 'suppliers' && <SupplierView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'cloud' && <CloudServicesView />}
          </div>
        </main>
      </div>

      <ReceiptModal
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
}

export default App;
