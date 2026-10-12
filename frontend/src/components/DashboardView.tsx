import React from 'react';
import {
  IndianRupee, ShoppingCart, AlertTriangle, Clock,
  BookOpen, TrendingUp, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../i18n';
import type { DashboardData } from '../types';
import type { TabType } from './Sidebar';

interface DashboardViewProps {
  data: DashboardData | null;
  loading: boolean;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, loading, setActiveTab }) => {
  const { t } = useLanguage();

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 minimal-card bg-slate-100" />)}
        </div>
        <div className="h-72 minimal-card bg-slate-100" />
      </div>
    );
  }

  const { metrics, recent_invoices, low_stock_items, expiring_items } = data;

  const statCards = [
    {
      label: t('dashboard.todaySales'),
      value: `₹${metrics.today_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      sub: `${metrics.today_bills_count} bills generated`,
      icon: IndianRupee,
      iconClass: 'icon-box-emerald',
      textColor: 'text-emerald-700',
    },
    {
      label: t('dashboard.activeUdhaar'),
      value: `₹${metrics.total_udhaar_outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      sub: 'Credit to recover',
      icon: BookOpen,
      iconClass: 'icon-box-blue',
      textColor: 'text-blue-700',
      onClick: () => setActiveTab('udhaar'),
    },
    {
      label: t('dashboard.lowStock'),
      value: `${metrics.low_stock_count}`,
      sub: 'Items below minimum',
      icon: AlertTriangle,
      iconClass: 'icon-box-amber',
      textColor: 'text-amber-700',
      onClick: () => setActiveTab('inventory'),
    },
    {
      label: 'Expiring Soon',
      value: `${metrics.expiring_soon_count}`,
      sub: 'Within 7 days',
      icon: Clock,
      iconClass: 'icon-box-rose',
      textColor: 'text-rose-700',
      onClick: () => setActiveTab('inventory'),
    },
  ];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* ── Welcome Banner ── */}
      <div className="minimal-card p-6 bg-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-slate-900">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('dashboard.greeting')}, Store Manager!</h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('dashboard.overview')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">

          <button
            onClick={() => setActiveTab('pos')}
            className="btn-primary flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('dashboard.openPos')}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`minimal-card p-5 minimal-card-hover ${card.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                {card.onClick && <TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="xl:col-span-2 minimal-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900">{t('dashboard.recentTransactions')}</h3>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('dashboard.viewPos')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-header">
                <tr>
                  <th className="py-3 px-5">{t('common.invoiceNo')}</th>
                  <th className="py-3 px-5">{t('common.customer')}</th>
                  <th className="py-3 px-5">{t('common.payment')}</th>
                  <th className="py-3 px-5 text-right">{t('common.amount')}</th>
                  <th className="py-3 px-5 text-right">{t('common.time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">{t('dashboard.noTransactions')}</td>
                  </tr>
                ) : recent_invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-mono text-slate-600">{inv.invoice_number}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{inv.customer_name}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        inv.payment_method === 'Udhaar' ? 'badge-blue' :
                        inv.payment_method === 'UPI' ? 'badge-emerald' :
                        inv.payment_method === 'Card' ? 'badge-slate' : 'badge-amber'
                      }`}>
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-slate-900">₹{inv.total.toFixed(2)}</td>
                    <td className="py-3 px-5 text-right text-slate-500">{inv.created_at?.slice(11, 16) || '--:--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="minimal-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-900">{t('inventory.lowStock')}</span>
              </div>
              <span className="badge-amber px-2 py-0.5 text-xs rounded-full font-bold">{low_stock_items.length}</span>
            </div>
            <div className="p-4 space-y-2.5">
              {low_stock_items.length === 0 ? (
                <p className="text-sm text-center text-slate-500 py-2">{t('dashboard.healthyStock')}</p>
              ) : low_stock_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </div>
                  <span className="badge-amber text-xs font-bold px-2 py-1 rounded ml-3 shrink-0">
                    {item.stock_quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring */}
          <div className="minimal-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-semibold text-slate-900">{t('inventory.expiring')}</span>
              </div>
              <span className="badge-rose px-2 py-0.5 text-xs rounded-full font-bold">{expiring_items.length}</span>
            </div>
            <div className="p-4 space-y-2.5">
              {expiring_items.length === 0 ? (
                <p className="text-sm text-center text-slate-500 py-2">{t('dashboard.noExpiring')}</p>
              ) : expiring_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-rose-600 mt-0.5 font-medium">{t('dashboard.exp')} {item.expiry_date}</p>
                  </div>
                  <span className="badge-rose text-xs font-bold px-2 py-1 rounded ml-3 shrink-0">
                    {item.stock_quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
