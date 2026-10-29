export interface Product {
  id: number;
  name: string;
  barcode: string;
  category: string;
  selling_price: number;
  cost_price: number;
  unit: string;
  stock_quantity: number;
  min_stock_alert: number;
  expiry_date?: string | null;
  batch_no?: string | null;
  image_url?: string | null;
  created_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  credit_limit: number;
  created_at?: string;
}

export interface UdhaarTransaction {
  id: number;
  customer_id: number;
  type: 'CREDIT' | 'PAYMENT';
  amount: number;
  invoice_id?: number | null;
  note?: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  pending_orders: number;
  last_restock_date?: string;
  created_at?: string;
}

export interface InvoiceItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  payment_method: 'Cash' | 'UPI' | 'Udhaar' | 'Card';
  subtotal: number;
  discount: number;
  gst_percent?: number;
  gst_amount: number;
  total: number;
  created_at: string;
  items?: InvoiceItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardMetrics {
  today_sales: number;
  today_bills_count: number;
  low_stock_count: number;
  expiring_soon_count: number;
  total_udhaar_outstanding: number;
  total_products: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recent_invoices: Invoice[];
  low_stock_items: Product[];
  expiring_items: Product[];
}

export interface SalesAnalytics {
  total_revenue: number;
  total_bills: number;
  avg_bill_value: number;
  daily_sales: { date: string; revenue: number }[];
  payment_breakdown: { method: string; revenue: number }[];
  category_breakdown: { category: string; revenue: number }[];
}

export interface SynopsisData {
  project_title: string;
  subtitle: string;
  submitted_by: { name: string; roll: string }[];
  class: string;
  guide: string;
  date: string;
  scope: string[];
  pilot_survey: {
    total_responses: number;
    store_types: number;
    period: string;
    questions_count: number;
    key_findings: { stat: string; label: string }[];
  };
  solution_matrix: {
    capability: string;
    manual: string;
    generic_apps: string;
    kirana_os: string;
  }[];
  novelty: {
    id: number;
    title: string;
    desc: string;
  }[];
  timeline: {
    month: string;
    phase: string;
    status: string;
  }[];
}

export interface CloudServiceEC2 {
  service_name: string;
  category: string;
  status: string;
  instance_id: string;
  instance_type: string;
  region: string;
  public_ip: string;
  os: string;
  runtime: string;
  uptime: string;
  cpu_utilization: string;
  memory_used_mb: number;
  memory_total_mb: number;
}

export interface CloudServiceS3 {
  service_name: string;
  category: string;
  status: string;
  bucket_name: string;
  region: string;
  storage_class: string;
  encryption: string;
  total_objects: number;
  storage_used_mb: number;
  free_tier_limit_gb: number;
  features: string[];
}

export interface CloudServiceCloudFront {
  service_name: string;
  category: string;
  status: string;
  distribution_domain: string;
  edge_protocol: string;
  edge_locations: string[];
  cache_hit_ratio: string;
  avg_edge_latency_ms: number;
  ttl_seconds: number;
  origin: string;
}

export interface CloudServicesStatus {
  mode: 'live' | 'simulated';
  message: string;
  services: {
    ec2: CloudServiceEC2;
    s3: CloudServiceS3;
    cloudfront: CloudServiceCloudFront;
  };
}

export interface CloudBackupRecord {
  id: number;
  tenant_id: number;
  filename: string;
  s3_key: string;
  cloudfront_url: string;
  size_bytes: number;
  backup_type: string;
  created_at: string;
}

