import React, { useState, useEffect } from 'react';
import {
  Search, Barcode, Plus, Minus, Trash2,
  CreditCard, QrCode, Banknote, BookOpen, Receipt, Sparkles, Check
} from 'lucide-react';
import type { Product, Customer, CartItem, Invoice } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

interface POSBillingViewProps {
  onCheckoutSuccess: (invoice: Invoice) => void;
}

export const POSBillingView: React.FC<POSBillingViewProps> = ({ onCheckoutSuccess }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Udhaar' | 'Card'>('Cash');
  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [prods, custs] = await Promise.all([api.getProducts(), api.getUdhaarCustomers()]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      return existing
        ? prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: number, delta: number) => {
    setCart(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const simulateBarcodeScan = (barcode: string) => {
    const prod = products.find(p => p.barcode === barcode);
    if (prod) { handleAddToCart(prod); setSearch(''); }
    else { setErrorMsg(`Barcode ${barcode} not found`); setTimeout(() => setErrorMsg(''), 3000); }
  };

  const subtotal = cart.reduce((acc, i) => acc + i.product.selling_price * i.quantity, 0);
  const gstAmount = ((subtotal - discount) * gstPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discount + gstAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Udhaar' && !selectedCustomer) {
      setErrorMsg('Select a customer for Udhaar billing'); return;
    }
    try {
      setSubmitting(true); setErrorMsg('');
      const res = await api.checkout({
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        payment_method: paymentMethod,
        customer_id: selectedCustomer?.id,
        customer_name: selectedCustomer?.name || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || '',
        discount, gst_percent: gstPercent,
      });
      onCheckoutSuccess(res.invoice);
      setCart([]); setDiscount(0); setSelectedCustomer(null); setPaymentMethod('Cash');
      loadInitialData();
    } catch (err: any) { setErrorMsg(err.message || 'Checkout failed'); }
    finally { setSubmitting(false); }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = ['All', 'Kirana / Staple', 'Dairy', 'Bakery', 'Confectionery', 'Sweets', 'Beverages'];

  const paymentModes = [
    { id: 'Cash' as const, label: 'Cash', icon: Banknote },
    { id: 'UPI' as const, label: 'UPI', icon: QrCode },
    { id: 'Udhaar' as const, label: 'Udhaar', icon: BookOpen },
    { id: 'Card' as const, label: 'Card', icon: CreditCard },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-112px)] max-w-screen-xl mx-auto">
      {/* ── LEFT: Product Catalog ── */}
      <div className="flex flex-col gap-4 flex-[1.5]">
        {/* Search + Scanner */}
        <div className="minimal-card p-4 space-y-3 shrink-0">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('pos.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full input-minimal pl-9"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => simulateBarcodeScan('8901058852341')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold badge-slate hover:bg-slate-200 transition-colors"
              >
                <Barcode className="w-4 h-4" /> Atta
              </button>
              <button
                onClick={() => simulateBarcodeScan('8901262010052')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold badge-slate hover:bg-slate-200 transition-colors"
              >
                <Barcode className="w-4 h-4" /> Butter
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="grid grid-cols-3 gap-4 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 minimal-card bg-slate-100" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Barcode className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map(p => {
                const isLow = p.stock_quantity <= p.min_stock_alert;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className="minimal-card minimal-card-hover p-4 cursor-pointer flex flex-col justify-between relative group"
                  >
                    {isLow && (
                      <span className="absolute top-2 right-2 badge-amber text-[10px] font-bold px-1.5 py-0.5 rounded">Low</span>
                    )}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {p.category.split('/')[0].trim()}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-1 leading-tight">{p.name}</h4>
                      <p className="text-xs mt-1 text-slate-500 font-mono">
                        {p.batch_no || 'No Batch'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <div>
                        <div className="text-base font-bold text-slate-900">₹{p.selling_price}</div>
                        <div className="text-xs text-slate-500">{p.stock_quantity} {p.unit} in stock</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart & Checkout ── */}
      <div className="w-[340px] minimal-card flex flex-col shrink-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900">{t('pos.currentOrder')}</span>
          </div>
          <span className="badge-blue text-xs font-semibold px-2.5 py-0.5 rounded-full">{cart.length} {t('common.items').toLowerCase()}</span>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-4 p-3 rounded-lg text-sm font-medium badge-rose shrink-0">
            {errorMsg}
          </div>
        )}

        <div className="px-4 pt-4 shrink-0">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {t('common.customer')} {paymentMethod === 'Udhaar' ? '(Required)' : ''}
          </label>
          <select
            value={selectedCustomer?.id || ''}
            onChange={e => {
              const c = customers.find(c => c.id === Number(e.target.value));
              setSelectedCustomer(c || null);
            }}
            className="w-full input-minimal text-sm"
          >
            <option value="">{t('pos.walkInCustomer')}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} (₹{c.balance} balance)</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-8 h-8 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">{t('pos.cartEmpty')}</p>
                <p className="text-xs">{t('pos.selectProducts')}</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.product.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      ₹{item.product.selling_price} × {item.quantity} = <span className="font-semibold text-slate-900">₹{(item.product.selling_price * item.quantity).toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <button onClick={() => handleUpdateQty(item.product.id, -1)} className="px-2 py-1.5 hover:bg-slate-50 text-slate-500"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="px-2 text-sm font-medium text-slate-900">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product.id, 1)} className="px-2 py-1.5 hover:bg-slate-50 text-slate-900"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => setCart(prev => prev.filter(i => i.product.id !== item.product.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 space-y-4 shrink-0 border-t border-slate-200 bg-slate-50 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('pos.discount')}</label>
              <input
                type="number" min="0" value={discount || ''} placeholder="0"
                onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full input-minimal text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('pos.gstRate')}</label>
              <select value={gstPercent} onChange={e => setGstPercent(Number(e.target.value))} className="w-full input-minimal text-sm">
                <option value={0}>0% Exempt</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {paymentModes.map(pm => {
              const Icon = pm.icon;
              const active = paymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-semibold transition-all border ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {pm.label}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
            <div className="flex justify-between text-sm text-slate-500">
              <span>{t('pos.subtotal')}</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Discount</span><span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            {gstAmount > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>GST</span><span>+₹{gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-slate-100 pt-2 mt-2 text-slate-900">
              <span>{t('common.total')}</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              cart.length === 0 || submitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-[0.98]'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{submitting ? 'Processing...' : `${t('pos.charge')} ₹${grandTotal.toFixed(2)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
