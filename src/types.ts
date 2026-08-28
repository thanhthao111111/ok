export type LicenseStatus = 'active' | 'invalid' | 'expired' | 'unlicensed';
export type LicenseType = 'Lifetime Pro' | 'Agency Enterprise' | 'Standard 1 Year';

export interface LicenseInfo {
  license_key: string;
  domain: string;
  ip_address: string;
  plugin_version: string;
  status: LicenseStatus;
  license_type: LicenseType;
  expiry_date: string;
  registered_to: string;
  server_url: string;
  api_endpoint: string;
  last_verified_at: string;
  next_cron_check: string;
  is_write_blocked: boolean;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  phone: string;
  address: string;
  manager_name: string;
  email: string;
  is_active: boolean;
  notes?: string;
  total_warranties?: number;
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'void';

export interface WarrantyItem {
  id: number;
  serial_number: string;
  sku: string;
  product_name: string;
  category: string;
  purchase_date: string;
  warranty_months: number;
  expiry_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  branch_id: number;
  branch_name: string;
  branch_phone: string;
  branch_address: string;
  seller_name: string;
  seller_phone?: string;
  seller_role: 'Sale Staff' | 'Technical Lead' | 'Store Manager' | 'Dealer Agent';
  status: WarrantyStatus;
  invoice_number?: string;
  invoice_image?: string;
  notes?: string;
  woocommerce_order_id?: string;
  created_at: string;
  rma_count?: number;
}

export type RMAStatus =
  | 'new'
  | 'checking'
  | 'repairing'
  | 'completed'
  | 'returned'
  | 'rejected';

export interface RMATicket {
  id: number;
  ticket_code: string;
  serial_number: string;
  sku: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  branch_id: number;
  branch_name: string;
  receiving_staff: string;
  technician_name: string;
  intake_date: string;
  status: RMAStatus;
  fault_description: string;
  accessories_included?: string;
  technician_notes: string;
  customer_notes: string;
  repair_cost: number;
  replaced_parts: string[];
  completed_date?: string;
  return_date?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  warranty_covered: boolean;
}

export type UserRole = 'administrator' | 'branch_manager' | 'technician';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  assigned_branch_id?: number;
  branch_name?: string;
  avatar: string;
}

export interface NotificationLog {
  id: string | number;
  type: 'email' | 'zalo_zns' | 'sms';
  recipient: string;
  template: string;
  trigger: 'activation_success' | 'expiring_soon' | 'rma_status_change';
  title: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WooCommerceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  product_title: string;
  sku: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  assigned_serial?: string;
  branch_id: number;
  is_synced_to_warranty: boolean;
}

export interface ExcelImportRow {
  row_index: number;
  serial_number: string;
  sku: string;
  purchase_date: string;
  customer_name: string;
  customer_phone: string;
  branch_name: string;
  branch_address?: string;
  branch_phone?: string;
  seller_name?: string;
  product_name?: string;
  warranty_months?: number;
  validation_errors: string[];
  is_valid: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'serials'
  | 'branches'
  | 'rma'
  | 'import_export'
  | 'woocommerce'
  | 'license'
  | 'notifications'
  | 'db_inspector'
  | 'plugin_code';

export type AppViewMode = 'admin' | 'frontend_lookup' | 'frontend_activation';
