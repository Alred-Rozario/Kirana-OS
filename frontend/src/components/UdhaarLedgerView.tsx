import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, CreditCard, CheckCircle, X, IndianRupee, Phone } from 'lucide-react';
import type { Customer, UdhaarTransaction } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

export const UdhaarLedgerView: React.FC = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<UdhaarTransaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try { setLoading(true); setCustomers(await api.getUdhaarCustomers()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchEntries = async (id: number) => {
    try { setEntries(await api.getUdhaarHistory(id)); } catch (e) { console.error(e); }
  };

  const handleAddCustomer = async () => {
    try { await api.addUdhaarCustomer(newCustomer); setShowAddModal(false); setNewCustomer({ name:'',phone:'',address:'' }); fetchCustomers(); }
    catch (e) { console.error(e); }
  };

  const handlePayment = async () => {
    if (!selectedCustomer || paymentAmount <= 0) return;
    try {
      await api.recordUdhaarPayment({ customer_id: selectedCustomer.id, amount: paymentAmount });
      setShowPaymentModal(false); setPaymentAmount(0); fetchCustomers();
      if (selectedCustomer) fetchEntries(selectedCustomer.id);
    } catch (e) { console.error(e); }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('udhaar.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('udhaar.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="minimal-card px-4 py-2 flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('udhaar.totalCredit')}</span>
            <span className="text-lg font-bold text-amber-600">₹{totalOutstanding.toFixed(2)}</span>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('udhaar.newCustomer')}
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 flex flex-col gap-4">
          <div className="minimal-card flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <input type="text" placeholder={t('udhaar.search')} className="w-full input-minimal text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Loading...</div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">{t('udhaar.noCustomers')}</div>
              ) : customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); fetchEntries(c.id); }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedCustomer?.id === c.id
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-semibold ${selectedCustomer?.id === c.id ? 'text-blue-900' : 'text-slate-900'}`}>{c.name}</p>
                    <span className={`text-xs font-bold ${c.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ₹{c.balance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-2/3 flex flex-col min-h-0">
          {!selectedCustomer ? (
            <div className="minimal-card flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="font-medium text-slate-600">{t('udhaar.selectCustomer')}</p>
            </div>
          ) : (
            <div className="minimal-card flex-1 flex flex-col min-h-0">
              <div className="p-5 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('udhaar.currentBalance')}</p>
                    <p className={`text-xl font-bold ${selectedCustomer.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ₹{selectedCustomer.balance.toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => setShowPaymentModal(true)} className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <IndianRupee className="w-4 h-4" /> {t('udhaar.receivePayment')}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/50">
                <table className="w-full text-sm text-left">
                  <thead className="table-header bg-white sticky top-0">
                    <tr>
                      <th className="py-3 px-5">{t('common.date')}</th>
                      <th className="py-3 px-5">{t('udhaar.type')}</th>
                      <th className="py-3 px-5">{t('udhaar.description')}</th>
                      <th className="py-3 px-5 text-right">{t('common.amount')}</th>
                      <th className="py-3 px-5 text-right">{t('udhaar.balanceAfter')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-500">{t('udhaar.noTransactions')}</td></tr>
                    ) : entries.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="py-3 px-5 text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-5">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${e.type === 'CREDIT' ? 'badge-rose' : 'badge-emerald'}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-700">{e.note || '—'}</td>
                        <td className={`py-3 px-5 text-right font-semibold ${e.type === 'CREDIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {e.type === 'CREDIT' ? '+' : '-'}₹{e.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-5 text-right font-semibold text-slate-900">₹{selectedCustomer.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl animate-fade-up border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-lg">{t('udhaar.newCustomer')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t('udhaar.customerName')}</label>
                <input type="text" value={newCustomer.name} onChange={e => setNewCustomer(prev => ({...prev, name: e.target.value}))} className="w-full input-minimal" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t('udhaar.phone')}</label>
                <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer(prev => ({...prev, phone: e.target.value}))} className="w-full input-minimal" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t('udhaar.address')}</label>
                <textarea value={newCustomer.address} onChange={e => setNewCustomer(prev => ({...prev, address: e.target.value}))} className="w-full input-minimal min-h-[80px]" placeholder="Local address" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={handleAddCustomer} className="btn-primary">{t('udhaar.addCustomer')}</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl animate-fade-up border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-lg">{t('udhaar.receivePayment')}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm">{t('udhaar.receivePayment')} from</p>
              <p className="font-bold text-lg text-slate-900">{selectedCustomer.name}</p>
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 text-left">Amount Received (₹)</label>
                <input
                  type="number" min="0" value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full input-minimal text-xl font-bold text-center py-3 text-emerald-600 focus:ring-emerald-100 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={handlePayment} disabled={paymentAmount <= 0} className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 flex justify-center gap-2 py-3 disabled:opacity-50">
                <CheckCircle className="w-5 h-5" /> {t('udhaar.confirmPayment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
