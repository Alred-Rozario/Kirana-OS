import React, { useState, useRef, useEffect } from 'react';
import { Store, UserCircle, Bell, LogOut, ChevronDown, Globe, Shield } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HeaderNavbarProps {
  userRole: 'Owner' | 'Staff';
  setUserRole: (role: 'Owner' | 'Staff') => void;
  lowStockCount: number;
  expiringCount: number;
  onAlertsClick?: () => void;
  onLogout?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  userRole,
  setUserRole,
  lowStockCount,
  expiringCount,
  onAlertsClick,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const languages = ['English', 'Hindi'];
  const roles: ('Owner' | 'Staff')[] = ['Owner', 'Staff'];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">KIRANA-OS</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{t('header.subtitle')}</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Alerts */}
          <div className="flex items-center gap-2">
            {(lowStockCount > 0 || expiringCount > 0) ? (
              <div 
                onClick={onAlertsClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors"
              >
                <Bell className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-semibold text-rose-700">
                  {lowStockCount + expiringCount} {t('header.alerts')}
                </span>
              </div>
            ) : (
              <div className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <Bell className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{language}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === lang 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

          {/* User Profile */}
          <div className="relative flex items-center gap-3" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                <UserCircle className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{userRole} {t('header.account')}</div>
                <div className="text-xs text-slate-500">{t('header.viewProfile')}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">Admin Owner</p>
                  <p className="text-xs text-slate-500 truncate">admin@kirana.com</p>
                </div>
                
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('header.switchRole')}
                  </div>
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setUserRole(role);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                        userRole === role 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      {role} Role
                    </button>
                  ))}
                </div>

                {onLogout && (
                  <div className="border-t border-slate-100 pt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
