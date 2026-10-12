import type {
  Product, Customer, UdhaarTransaction, Supplier, Invoice, DashboardData, SynopsisData, SalesAnalytics
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('kirana_os_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options?.headers as Record<string, string> || {}),
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (res.status === 401 || res.status === 422) {
    localStorage.removeItem('kirana_os_token');
    localStorage.removeItem('kirana_os_user');
    window.location.reload(); // Force re-login
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}

export const api = {
  // Auth
  login: (credentials: any) => fetchJson<{ token: string; user: any }>('/auth/login', {
    method: 'POST', body: JSON.stringify(credentials)
  }),
  register: (data: any) => fetchJson<{ message: string }>('/auth/register', {
    method: 'POST', body: JSON.stringify(data)
  }),

  // Dashboard
  getDashboard: () => fetchJson<DashboardData>('/dashboard'),

  // Products / Inventory
  getProducts: (params?: { search?: string; category?: string; expiring?: boolean; low_stock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.expiring) query.append('expiring', 'true');
    if (params?.low_stock) query.append('low_stock', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Product[]>(`/products${queryString}`);
  },

  addProduct: (product: Partial<Product>) =>
    fetchJson<Product>('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: number, product: Partial<Product>) =>
    fetchJson<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: number) =>
    fetchJson<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
    
  uploadProductsCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ message: string }>('/products/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Billing Checkout
  checkout: (payload: any) =>
    fetchJson<{ message: string; invoice: Invoice }>('/billing/checkout', { method: 'POST', body: JSON.stringify(payload) }),

  // Invoices History
  getInvoices: () => fetchJson<Invoice[]>('/invoices'),

  // Udhaar Ledger
  getUdhaarCustomers: () => fetchJson<Customer[]>('/udhaar/customers'),
  addUdhaarCustomer: (customer: any) => fetchJson<Customer>('/udhaar/customers', { method: 'POST', body: JSON.stringify(customer) }),
  getUdhaarHistory: (customerId: number) => fetchJson<UdhaarTransaction[]>(`/udhaar/transactions/${customerId}`),
  recordUdhaarPayment: (payload: any) => fetchJson<{ message: string }>('/udhaar/payment', { method: 'POST', body: JSON.stringify(payload) }),

  // Suppliers
  getSuppliers: () => fetchJson<Supplier[]>('/suppliers'),
  addSupplier: (supplier: any) => fetchJson<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(supplier) }),
  updateSupplier: (id: number, supplier: Partial<Supplier>) => fetchJson<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(supplier) }),
  deleteSupplier: (id: number) => fetchJson<{ message: string }>(`/suppliers/${id}`, { method: 'DELETE' }),

  uploadSuppliersCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ message: string }>('/suppliers/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Analytics
  getSalesAnalytics: () => fetchJson<SalesAnalytics>('/analytics'),

  // PPT Synopsis
  getSynopsis: () => fetchJson<SynopsisData>('/synopsis'),
};
