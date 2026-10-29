import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, BookOpen,
  Truck, BarChart3, ShieldCheck, ChevronRight, Cloud
} from 'lucide-react';
import { useLanguage } from '../i18n';

export type TabType = 'dashboard' | 'pos' | 'inventory' | 'udhaar' | 'suppliers' | 'analytics' | 'synopsis' | 'cloud';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: 'Owner' | 'Staff';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard' as TabType, label: t('menu.dashboard'), icon: LayoutDashboard, role: 'All' },
    { id: 'pos' as TabType, label: t('menu.pos'), icon: ShoppingCart, role: 'All', badge: 'FAST' },
    { id: 'inventory' as TabType, label: t('menu.inventory'), icon: Package, role: 'All' },
    { id: 'udhaar' as TabType, label: t('menu.udhaar'), icon: BookOpen, role: 'All' },
    { id: 'suppliers' as TabType, label: t('menu.suppliers'), icon: Truck, role: 'Owner' },
    { id: 'analytics' as TabType, label: t('menu.analytics'), icon: BarChart3, role: 'Owner' },
    { id: 'cloud' as TabType, label: 'AWS Cloud Hub', icon: Cloud, role: 'All', badge: '3-TIER' },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Main Menu
        </p>

        {menuItems.map((item) => {
          if (item.role === 'Owner' && userRole !== 'Owner') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              <div className="flex-1 text-sm font-medium leading-none">
                {item.label}
              </div>

              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}

              {!isActive && (
                <ChevronRight className="w-3 h-3 shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      <div 
        onClick={() => setActiveTab('cloud')}
        className="p-4 border-t border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
        title="Click to view AWS Cloud Services details"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">AWS Cloud Online</p>
            <p className="text-[10px] text-slate-500 truncate">EC2 • S3 • CloudFront</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
