import React, { useState, useEffect } from 'react';
import {
  Package, Search, Plus, Pencil, Trash2, AlertTriangle, Clock, X, Save, FileUp
} from 'lucide-react';
import type { Product } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

const CATEGORIES = ['Kirana / Staple', 'Dairy', 'Bakery', 'Confectionery', 'Sweets', 'Beverages'];
const emptyForm = (): Omit<Product, 'id'> => ({
  name: '', barcode: '', category: 'Kirana / Staple', unit: 'kg', batch_no: '',
  cost_price: 0, selling_price: 0, stock_quantity: 0, min_stock_alert: 5,
  expiry_date: '',
});

export const InventoryView: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'low' | 'expiring'>('all');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { setLoading(true); setProducts(await api.getProducts()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditingProduct(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setForm({ ...p }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, form);
      else await api.addProduct(form);
      setShowModal(false);
      fetchProducts();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await api.uploadProductsCSV(file);
      alert('Products imported successfully!');
      fetchProducts();
    } catch (err: any) {
      alert(`Error importing CSV: ${err.message}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await api.deleteProduct(id); fetchProducts(); } catch (e) { console.error(e); }
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const in7Days = new Date(today); in7Days.setDate(in7Days.getDate() + 7);

  const baseList = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(filter.toLowerCase()) || p.barcode.includes(filter);
    const catMatch = catFilter === 'All' || p.category === catFilter;
    return searchMatch && catMatch;
  });
  const displayed = tab === 'low'
    ? baseList.filter(p => p.stock_quantity <= p.min_stock_alert)
    : tab === 'expiring'
    ? baseList.filter(p => {
        if (!p.expiry_date) return false;
        const d = new Date(p.expiry_date);
        return d >= today && d <= in7Days;
      })
    : baseList;

  const lowCount = products.filter(p => p.stock_quantity <= p.min_stock_alert).length;
  const expCount = products.filter(p => {
    if (!p.expiry_date) return false;
    const d = new Date(p.expiry_date);
    return d >= today && d <= in7Days;
  }).length;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('inventory.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {products.length} {t('inventory.subtitle')}
          </p>
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
            <FileUp className="w-4 h-4" /> {t('inventory.importCsv')}
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('inventory.addProduct')}
          </button>
        </div>
      </div>

      <div className="minimal-card p-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${
              tab === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            {t('inventory.allProducts')} <span className="badge-slate px-1.5 py-0.5 rounded text-xs">{products.length}</span>
          </button>
          <button
            onClick={() => setTab('low')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${
              tab === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            {t('inventory.lowStock')} <span className="badge-amber px-1.5 py-0.5 rounded text-xs">{lowCount}</span>
          </button>
          <button
            onClick={() => setTab('expiring')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${
              tab === 'expiring' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            {t('inventory.expiring')} <span className="badge-rose px-1.5 py-0.5 rounded text-xs">{expCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input-minimal pl-9 text-sm w-48"
            />
          </div>
          <select 
            value={catFilter} 
            onChange={e => setCatFilter(e.target.value)}
            className="input-minimal text-sm"
          >
            <option value="All">{t('inventory.allCategories')}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="minimal-card overflow-hidden bg-white">
        <table className="w-full text-sm text-left">
          <thead className="table-header">
            <tr>
              <th className="py-3 px-5">{t('common.nameBatch')}</th>
              <th className="py-3 px-5">{t('common.category')}</th>
              <th className="py-3 px-5">{t('common.barcode')}</th>
              <th className="py-3 px-5 text-right">{t('common.cost')}</th>
              <th className="py-3 px-5 text-right">{t('common.selling')}</th>
              <th className="py-3 px-5 text-right">{t('common.stock')}</th>
              <th className="py-3 px-5 text-center">{t('common.status')}</th>
              <th className="py-3 px-5 text-center">{t('common.expiry')}</th>
              <th className="py-3 px-5 text-center">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={9} className="py-10 text-center text-slate-500">Loading inventory...</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-slate-500">No products match your criteria.</td></tr>
            ) : displayed.map(p => {
              const isLow = p.stock_quantity <= p.min_stock_alert;
              let expiryStatus = 'ok';
              if (p.expiry_date) {
                const d = new Date(p.expiry_date);
                if (d < today) expiryStatus = 'expired';
                else if (d <= in7Days) expiryStatus = 'soon';
              }
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{p.batch_no || 'No batch'}</p>
                  </td>
                  <td className="py-3 px-5">
                    <span className="badge-slate text-[10px] font-bold px-2 py-1 rounded-md">{p.category}</span>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-500 text-xs">{p.barcode}</td>
                  <td className="py-3 px-5 text-right font-medium text-slate-600">₹{p.cost_price}</td>
                  <td className="py-3 px-5 text-right font-semibold text-slate-900">₹{p.selling_price}</td>
                  <td className="py-3 px-5 text-right">
                    <span className={`font-bold px-2 py-1 rounded-md text-[11px] ${isLow ? 'badge-amber' : 'badge-emerald'}`}>
                      {p.stock_quantity} {p.unit}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    {isLow
                      ? <span className="badge-amber text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit mx-auto"><AlertTriangle className="w-3 h-3" />Low</span>
                      : <span className="badge-emerald text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit mx-auto"><Package className="w-3 h-3" />OK</span>
                    }
                  </td>
                  <td className="py-3 px-5 text-center">
                    {!p.expiry_date ? <span className="text-slate-400">—</span>
                      : expiryStatus === 'expired'
                      ? <span className="badge-rose text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit mx-auto"><X className="w-3 h-3" />Expired</span>
                      : expiryStatus === 'soon'
                      ? <span className="badge-amber text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit mx-auto"><Clock className="w-3 h-3" />{p.expiry_date}</span>
                      : <span className="badge-emerald text-[10px] px-2 py-1 rounded-md font-medium">{p.expiry_date}</span>
                    }
                  </td>
                  <td className="py-3 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay px-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl animate-fade-up border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-lg">{editingProduct ? t('inventory.addProduct') : t('inventory.addProduct')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
              {([
                ['name', 'Product Name', 'text', 'col-span-2'],
                ['barcode', 'Barcode', 'text', ''],
                ['batch_no', 'Batch No', 'text', ''],
                ['cost_price', 'Cost Price (₹)', 'number', ''],
                ['selling_price', 'Selling Price (₹)', 'number', ''],
                ['stock_quantity', 'Stock Qty', 'number', ''],
                ['min_stock_alert', 'Min Alert Level', 'number', ''],
                ['expiry_date', 'Expiry Date', 'date', ''],
              ] as const).map(([key, label, type, cls]) => (
                <div key={key} className={cls || ''}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type as string}
                    value={(form as any)[key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full input-minimal"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t('common.category')}</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full input-minimal">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Unit</label>
                <select value={form.unit} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))} className="w-full input-minimal">
                  {['kg', 'g', 'L', 'mL', 'pcs', 'box', 'pack', 'dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
