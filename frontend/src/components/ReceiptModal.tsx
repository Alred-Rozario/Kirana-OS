import React from 'react';
import { X, CheckCircle, Printer, Download, Store } from 'lucide-react';
import type { Invoice } from '../types';

interface ReceiptModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => { window.print(); };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 animate-fade-up overflow-hidden flex flex-col">
        {/* Header - non printable */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100 text-emerald-900 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">Payment Successful</span>
          </div>
          <button onClick={onClose} className="text-emerald-700 hover:text-emerald-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body - Printable area */}
        <div id="printable-receipt" className="p-6 bg-white flex-1 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">KIRANA-OS</h2>
            <p className="text-sm text-slate-500 mt-1">Smart Retail POS System</p>
            <p className="text-xs text-slate-400 mt-1">123 Main Market, New Delhi, India</p>
            <p className="text-xs text-slate-400">Ph: +91 98765 43210</p>
          </div>

          <div className="border-t border-b border-slate-200 border-dashed py-3 mb-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-mono font-medium text-slate-900">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Date:</span>
              <span className="font-mono font-medium text-slate-900">{new Date(invoice.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-900">{invoice.customer_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-slate-900 uppercase">{invoice.payment_method}</span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              <span>Item (Qty x Price)</span>
              <span>Amount</span>
            </div>
            {invoice.items?.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-xs">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-slate-900 line-clamp-1">{item.product_name}</p>
                  <p className="text-slate-500 mt-0.5">{item.quantity} x ₹{item.unit_price}</p>
                </div>
                <span className="font-bold text-slate-900 mt-0.5 shrink-0">₹{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span><span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.gst_amount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST ({invoice.gst_percent}%)</span><span>+₹{invoice.gst_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg pt-2 mt-2 border-t border-slate-900 text-slate-900">
              <span>TOTAL</span><span>₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-8 space-y-1">
            <p className="text-sm font-bold text-slate-900">Thank you for shopping!</p>
            <p className="text-xs text-slate-500">Please visit again</p>
          </div>
        </div>

        {/* Footer Actions - non printable */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3 print:hidden">
          <button onClick={handlePrint} className="btn-secondary flex justify-center gap-2 border-slate-300">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="btn-secondary flex justify-center gap-2 border-slate-300">
            <Download className="w-4 h-4" /> Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
