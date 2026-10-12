import React, { useState, useEffect } from 'react';
import { Truck, Plus, MapPin, X, Pencil, Trash2, Phone, Mail, FileUp } from 'lucide-react';
import type { Supplier } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

const emptyForm = (): Omit<Supplier, 'id'> => ({
  name: '', contact_person: '', phone: '', email: '', address: '', category: '', pending_orders: 0
});

export const SupplierView: React.FC = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);
  const load = async () => { try { setLoading(true); setSuppliers(await api.getSuppliers()); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleSave = async () => {
    try {
      if (editing) await api.updateSupplier(editing.id, form);
      else await api.addSupplier(form);
      setShowModal(false); load();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await api.uploadSuppliersCSV(file);
      alert('Suppliers imported successfully!');
      load();
    } catch (err: any) {
      alert(`Error importing CSV: ${err.message}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this supplier?')) return;
    try { await api.deleteSupplier(id); load(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('supplier.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('supplier.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2">
            <FileUp className="w-4 h-4" /> {t('supplier.importCsv')}
          </button>
          <button onClick={() => { setEditing(null); setForm(emptyForm()); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('supplier.addSupplier')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 minimal-card bg-slate-100 animate-pulse" />)
        ) : suppliers.length === 0 ? (
          <div className="col-span-full minimal-card p-12 flex flex-col items-center justify-center text-slate-400">
            <Truck className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-slate-600">{t('supplier.noSuppliers')}</p>
          </div>
        ) : suppliers.map(s => (
          <div key={s.id} className="minimal-card minimal-card-hover flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl icon-box-blue flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(s); setForm({...s}); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{s.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{s.contact_person || t('supplier.noContact')}</p>
            </div>

            <div className="p-5 space-y-3 flex-1 bg-slate-50/50">
              {s.category && (
                <div className="mb-3">
                  <span className="badge-slate text-[10px] font-bold px-2 py-1 rounded-md">{s.category}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{s.phone}</span>
              </div>
              
              {s.email && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
              )}
              
              {s.address && (
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl animate-fade-up border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-lg">{editing ? t('supplier.editSupplier') : t('supplier.addSupplier')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                ['name', t('supplier.companyName'), 'col-span-2'],
                ['contact_person', t('supplier.contactPerson'), ''],
                ['phone', t('udhaar.phone'), ''],
                ['email', 'Email', ''],
                ['address', t('udhaar.address'), ''],
                ['category', t('supplier.categorySupplied'), ''],
              ] as const).map(([k, l, cls]) => (
                <div key={k} className={cls || ''}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{l}</label>
                  <input
                    type="text"
                    value={(form as any)[k] || ''}
                    onChange={e => setForm(prev => ({...prev, [k]: e.target.value}))}
                    className="w-full input-minimal"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={handleSave} className="btn-primary">{t('supplier.saveSupplier')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
