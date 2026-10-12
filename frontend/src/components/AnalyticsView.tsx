import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, ShoppingCart, Calendar } from 'lucide-react';
import type { SalesAnalytics } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

export const AnalyticsView: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { setData(await api.getSalesAnalytics()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading analytics...</div>;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-900">{t('analytics.title')}</h2>
        <p className="text-sm text-slate-500">{t('analytics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="minimal-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl icon-box-emerald flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('analytics.totalRevenue')}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{data.total_revenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="minimal-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl icon-box-blue flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('analytics.totalBills')}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{data.total_bills}</p>
          </div>
        </div>
        <div className="minimal-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl icon-box-amber flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('analytics.avgBill')}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{data.avg_bill_value.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="minimal-card p-6">
          <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {t('analytics.dailySales')}
          </h3>
          <div className="h-64 flex items-end gap-3 pb-4 border-b border-slate-100 px-2">
            {data.daily_sales.map((d, i) => {
              const maxRev = Math.max(...data.daily_sales.map(x => x.revenue));
              const h = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                  <div className="w-full bg-blue-500 rounded-t-md relative transition-all group-hover:bg-blue-600 shadow-sm" style={{ height: `${Math.max(h, 2)}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 badge-slate text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      ₹{d.revenue.toFixed(0)}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{d.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="minimal-card p-6">
            <h3 className="font-semibold text-slate-900 mb-5">{t('analytics.paymentBreakdown')}</h3>
            <div className="space-y-4">
              {data.payment_breakdown.map((pb, i) => {
                const total = data.payment_breakdown.reduce((s, x) => s + x.revenue, 0);
                const pct = total > 0 ? (pb.revenue / total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{pb.method}</span>
                      <span className="font-semibold text-slate-900">₹{pb.revenue.toLocaleString()} <span className="text-slate-400 font-normal ml-1">({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="minimal-card p-6">
            <h3 className="font-semibold text-slate-900 mb-5">{t('analytics.topCategories')}</h3>
            <div className="space-y-4">
              {data.category_breakdown.map((cb, i) => {
                const total = data.category_breakdown.reduce((s, x) => s + x.revenue, 0);
                const pct = total > 0 ? (cb.revenue / total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{cb.category}</span>
                      <span className="font-semibold text-slate-900">₹{cb.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
