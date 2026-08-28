import React, { useState } from 'react';
import {
  INITIAL_BRANCHES,
  INITIAL_LICENSE,
  INITIAL_NOTIFICATIONS,
  INITIAL_RMA_TICKETS,
  INITIAL_USERS,
  INITIAL_WARRANTIES,
  INITIAL_WOOCOMMERCE_ORDERS,
} from './mockData';
import {
  ActiveTab,
  AppViewMode,
  Branch,
  LicenseInfo,
  LicenseStatus,
  NotificationLog,
  RMATicket,
  UserProfile,
  WarrantyItem,
  WooCommerceOrder,
} from './types';
import { Header } from './components/Header';
import { BentoDashboard } from './components/BentoDashboard';
import { LicenseNoticeBanner } from './components/LicenseNoticeBanner';
import { LicenseSettings } from './components/LicenseSettings';
import { BranchManagement } from './components/BranchManagement';
import { SerialWarrantyManagement } from './components/SerialWarrantyManagement';
import { ImportExportModal } from './components/ImportExportModal';
import { RMATicketManagement } from './components/RMATicketManagement';
import { WooCommerceAutomation } from './components/WooCommerceAutomation';
import { NotificationCenter } from './components/NotificationCenter';
import { DatabaseInspector } from './components/DatabaseInspector';
import { WordPressPluginExporter } from './components/WordPressPluginExporter';
import { FrontendLookup } from './components/FrontendLookup';
import { FrontendActivation } from './components/FrontendActivation';
import { WarrantyCertificateModal } from './components/WarrantyCertificateModal';
import { RMAReceiptModal } from './components/RMAReceiptModal';
import { isStrictDataBlocked } from './services/licenseService';

export const App: React.FC = () => {
  // Global State
  const [license, setLicense] = useState<LicenseInfo>(INITIAL_LICENSE);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [warranties, setWarranties] = useState<WarrantyItem[]>(INITIAL_WARRANTIES);
  const [rmaTickets, setRmaTickets] = useState<RMATicket[]>(INITIAL_RMA_TICKETS);
  const [orders, setOrders] = useState<WooCommerceOrder[]>(INITIAL_WOOCOMMERCE_ORDERS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  // User & View Mode / Tab State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [viewMode, setViewMode] = useState<AppViewMode>('admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals for printing
  const [selectedCertificateWarranty, setSelectedCertificateWarranty] =
    useState<WarrantyItem | null>(null);
  const [selectedRMAReceipt, setSelectedRMAReceipt] = useState<RMATicket | null>(null);

  // License Handlers
  const handleUpdateLicense = (newLicense: LicenseInfo) => {
    setLicense(newLicense);
  };

  const handleUpdateLicenseStatus = (status: LicenseStatus) => {
    const isBlocked = status !== 'active';
    setLicense((prev) => ({
      ...prev,
      status,
      is_write_blocked: isBlocked,
      last_verified_at: new Date().toISOString(),
    }));
  };

  const handleTriggerCronCheck = () => {
    const nextCheck = new Date();
    nextCheck.setHours(nextCheck.getHours() + 24);

    setLicense((prev) => ({
      ...prev,
      last_verified_at: new Date().toISOString(),
      next_cron_check: nextCheck.toISOString(),
    }));

    const newNotif: NotificationLog = {
      id: Date.now(),
      type: 'email',
      recipient: 'admin@thanhaudio.vn',
      template: 'CRON_LICENSE_VERIFIED',
      trigger: 'activation_success',
      title: 'Cron 24h: Xác thực License Server thành công',
      content: `[THANHAUDIO SECURITY] Cron job đã kết nối tới thanhaudio.vn/security/api/v1 - Bản quyền Pro đang hoạt động hợp lệ.`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    alert('Đã thực thi Cron Check 24h! Kết nối License Server https://thanhaudio.vn/security thành công.');
  };

  // Branch CRUD
  const handleAddBranch = (branch: Omit<Branch, 'id'>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể thêm chi nhánh khi bản quyền chưa hợp lệ.');
      return;
    }
    const newId = branches.length > 0 ? Math.max(...branches.map((b) => b.id)) + 1 : 1;
    setBranches([...branches, { ...branch, id: newId }]);
  };

  const handleUpdateBranch = (id: number, branch: Partial<Branch>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể sửa chi nhánh khi bản quyền chưa hợp lệ.');
      return;
    }
    setBranches(branches.map((b) => (b.id === id ? { ...b, ...branch } : b)));
  };

  const handleDeleteBranch = (id: number) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể xóa chi nhánh khi bản quyền chưa hợp lệ.');
      return;
    }
    setBranches(branches.filter((b) => b.id !== id));
  };

  // Warranty Serial CRUD
  const handleAddWarranty = (warranty: Omit<WarrantyItem, 'id' | 'created_at'>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể tạo phiếu bảo hành khi bản quyền chưa hợp lệ.');
      return;
    }
    const newId = warranties.length > 0 ? Math.max(...warranties.map((w) => w.id)) + 1 : 1;
    const newItem: WarrantyItem = {
      ...warranty,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setWarranties([newItem, ...warranties]);

    // Dispatch automatic notification
    const newNotif: NotificationLog = {
      id: Date.now(),
      type: 'zalo_zns',
      recipient: warranty.customer_phone,
      template: 'ZNS_WARRANTY_ACTIVATION',
      trigger: 'activation_success',
      title: 'Kích hoạt bảo hành điện tử thành công',
      content: `[THANHAUDIO] Thiết bị ${warranty.product_name} (SN: ${warranty.serial_number}) đã được kích hoạt bảo hành đến ngày ${warranty.expiry_date}.`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateWarranty = (id: number, warranty: Partial<WarrantyItem>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể sửa phiếu bảo hành khi bản quyền chưa hợp lệ.');
      return;
    }
    setWarranties(warranties.map((w) => (w.id === id ? { ...w, ...warranty } : w)));
  };

  const handleDeleteWarranty = (id: number) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể xóa phiếu bảo hành khi bản quyền chưa hợp lệ.');
      return;
    }
    setWarranties(warranties.filter((w) => w.id !== id));
  };

  const handleBatchImportWarranties = (
    newItems: Omit<WarrantyItem, 'id' | 'created_at'>[]
  ) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể Import khi bản quyền chưa hợp lệ.');
      return;
    }
    let currentMaxId = warranties.length > 0 ? Math.max(...warranties.map((w) => w.id)) : 0;
    const preparedItems: WarrantyItem[] = newItems.map((item) => {
      currentMaxId += 1;
      return {
        ...item,
        id: currentMaxId,
        created_at: new Date().toISOString(),
      };
    });
    setWarranties([...preparedItems, ...warranties]);
  };

  // Create RMA Ticket directly from Warranty Item
  const handleCreateRMATicketFromWarranty = (warranty: WarrantyItem) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể tạo phiếu RMA khi bản quyền chưa hợp lệ.');
      return;
    }
    const ticketCode = `RMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = rmaTickets.length > 0 ? Math.max(...rmaTickets.map((r) => r.id)) + 1 : 1;
    const newTicket: RMATicket = {
      id: newId,
      ticket_code: ticketCode,
      serial_number: warranty.serial_number,
      sku: warranty.sku,
      product_name: warranty.product_name,
      customer_name: warranty.customer_name,
      customer_phone: warranty.customer_phone,
      customer_address: warranty.customer_address,
      branch_id: warranty.branch_id,
      branch_name: warranty.branch_name,
      receiving_staff: currentUser.name,
      technician_name: 'Trần Văn Kỹ',
      intake_date: new Date().toISOString(),
      status: 'new',
      fault_description: 'Khách hàng yêu cầu kiểm tra/bảo hành thiết bị',
      accessories_included: 'Thân máy, phụ kiện tiêu chuẩn',
      technician_notes: 'Tiếp nhận trực tiếp từ danh mục bảo hành',
      customer_notes: '',
      repair_cost: 0,
      replaced_parts: [],
      priority: 'normal',
      warranty_covered: warranty.status === 'active' || warranty.status === 'expiring_soon',
    };
    setRmaTickets([newTicket, ...rmaTickets]);

    // Update warranty rma_count
    setWarranties(
      warranties.map((w) =>
        w.id === warranty.id ? { ...w, rma_count: (w.rma_count || 0) + 1 } : w
      )
    );

    // Also dispatch notification
    const newNotif: NotificationLog = {
      id: Date.now(),
      type: 'sms',
      recipient: warranty.customer_phone,
      template: 'SMS_RMA_INTAKE',
      trigger: 'rma_status_change',
      title: `Tiếp nhận sửa chữa #${ticketCode}`,
      content: `[THANHAUDIO] Đã tiếp nhận thiết bị ${warranty.product_name} (SN: ${warranty.serial_number}) tại ${warranty.branch_name}. Mã phiếu: ${ticketCode}.`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setActiveTab('rma');
    setViewMode('admin');
    alert(`Đã tạo thành công Phiếu Tiếp Nhận RMA #${ticketCode} cho thiết bị ${warranty.serial_number}!`);
  };

  // RMA CRUD
  const handleAddRMATicket = (ticket: Omit<RMATicket, 'id'>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể tạo phiếu RMA khi bản quyền chưa hợp lệ.');
      return;
    }
    const newId = rmaTickets.length > 0 ? Math.max(...rmaTickets.map((r) => r.id)) + 1 : 1;
    const newTicket: RMATicket = {
      ...ticket,
      id: newId,
    };
    setRmaTickets([newTicket, ...rmaTickets]);

    // Send SMS / Zalo to customer
    const newNotif: NotificationLog = {
      id: Date.now(),
      type: 'sms',
      recipient: ticket.customer_phone,
      template: 'SMS_RMA_INTAKE',
      trigger: 'rma_status_change',
      title: `Tiếp nhận sửa chữa #${ticket.ticket_code}`,
      content: `[THANHAUDIO] Đã tiếp nhận thiết bị ${ticket.product_name} tại ${ticket.branch_name}. Mã phiếu: ${ticket.ticket_code}.`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateRMATicket = (id: number, ticket: Partial<RMATicket>) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể sửa phiếu RMA khi bản quyền chưa hợp lệ.');
      return;
    }
    setRmaTickets(rmaTickets.map((r) => (r.id === id ? { ...r, ...ticket } : r)));
  };

  // WooCommerce Complete order action
  const handleCompleteOrder = (order: WooCommerceOrder) => {
    if (isStrictDataBlocked(license)) {
      alert('Strict Data Block: Không thể hoàn tất đơn hàng và tạo bảo hành khi bản quyền chưa hợp lệ.');
      return;
    }

    const matchedBranch = branches.find((b) => b.id === order.branch_id) || branches[0];
    const generatedSerial = `TA-${order.sku}-${new Date().getFullYear()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    const expiryDate = d.toISOString().split('T')[0];

    // 1. Add warranty
    const newWarranty: WarrantyItem = {
      id: warranties.length > 0 ? Math.max(...warranties.map((w) => w.id)) + 1 : 1,
      serial_number: generatedSerial,
      sku: order.sku,
      product_name: order.product_title,
      category: 'Thiết Bị Âm Thanh Chính Hãng',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_months: 12,
      expiry_date: expiryDate,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      customer_address: order.customer_address,
      branch_id: matchedBranch.id,
      branch_name: matchedBranch.name,
      branch_phone: matchedBranch.phone,
      branch_address: matchedBranch.address,
      seller_name: 'WooCommerce Automation Hook',
      seller_role: 'Sale Staff',
      status: 'active',
      invoice_number: `WC-${order.id}`,
      woocommerce_order_id: String(order.id),
      notes: 'Tự động tạo từ đơn hàng WooCommerce completed',
      rma_count: 0,
      created_at: new Date().toISOString(),
    };
    setWarranties([newWarranty, ...warranties]);

    // 2. Update order state
    setOrders(
      orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'completed',
              is_synced_to_warranty: true,
              assigned_serial: generatedSerial,
            }
          : o
      )
    );

    // 3. Dispatch ZNS notification
    const newNotif: NotificationLog = {
      id: Date.now(),
      type: 'zalo_zns',
      recipient: order.customer_phone,
      template: 'ZNS_WOO_AUTO_WARRANTY',
      trigger: 'activation_success',
      title: 'Kích hoạt bảo hành từ đơn hàng WooCommerce',
      content: `[THANHAUDIO] Đơn hàng #${order.order_number} hoàn tất. Mã serial bảo hành của bạn là ${generatedSerial}. Hạn đến ${expiryDate}.`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    alert(
      `Đã kích hoạt thành công đơn hàng #${order.order_number}! Mã Serial ${generatedSerial} đã được tạo và lưu vào wp_warranty_serials.`
    );
  };

  const handleSendCustomNotification = (
    log: Omit<NotificationLog, 'id' | 'timestamp'>
  ) => {
    const newLog: NotificationLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    setNotifications([newLog, ...notifications]);
    alert(`Đã phát thông báo thành công qua cổng ${log.type.toUpperCase()} tới ${log.recipient}!`);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setViewMode('admin');
  };

  const handleSelectViewMode = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        viewMode={viewMode}
        onSelectViewMode={handleSelectViewMode}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        license={license}
        onUpdateLicenseStatus={handleUpdateLicenseStatus}
        currentUser={currentUser}
        allUsers={INITIAL_USERS}
        onSwitchUser={setCurrentUser}
        onTriggerCronCheck={handleTriggerCronCheck}
        notificationCount={notifications.length}
      />

      {/* Global License Notice Banner (Visible across all tabs if unlicensed or warning) */}
      <LicenseNoticeBanner
        license={license}
        onOpenLicenseSettings={() => {
          setActiveTab('license');
          setViewMode('admin');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW MODE: CUSTOMER LOOKUP SHORTCODE [warranty_lookup] */}
        {viewMode === 'frontend_lookup' && (
          <FrontendLookup
            warranties={warranties}
            rmaTickets={rmaTickets}
            branches={branches}
            onViewCertificate={(item) => setSelectedCertificateWarranty(item)}
            onOpenActivation={() => setViewMode('frontend_activation')}
          />
        )}

        {/* VIEW MODE: CUSTOMER ACTIVATION SHORTCODE [warranty_activation] */}
        {viewMode === 'frontend_activation' && (
          <FrontendActivation
            branches={branches}
            onActivateWarranty={handleAddWarranty}
            onViewCertificate={(item) => setSelectedCertificateWarranty(item)}
            onOpenLookup={() => setViewMode('frontend_lookup')}
          />
        )}

        {/* VIEW MODE: WP-ADMIN BACKEND */}
        {viewMode === 'admin' && (
          <>
            {/* TAB 0: BENTO DASHBOARD */}
            {activeTab === 'dashboard' && (
              <BentoDashboard
                license={license}
                branches={branches}
                warranties={warranties}
                rmaTickets={rmaTickets}
                orders={orders}
                notifications={notifications}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onQuickVerifyLicense={handleTriggerCronCheck}
                onOpenAddWarranty={() => setActiveTab('serials')}
                onOpenAddRMA={() => setActiveTab('rma')}
              />
            )}

            {/* TAB 1: SERIAL & WARRANTY MANAGEMENT */}
            {activeTab === 'serials' && (
              <SerialWarrantyManagement
                warranties={warranties}
                branches={branches}
                onAddWarranty={handleAddWarranty}
                onUpdateWarranty={handleUpdateWarranty}
                onDeleteWarranty={handleDeleteWarranty}
                onCreateRMATicketFromWarranty={handleCreateRMATicketFromWarranty}
                onViewCertificate={(item) => setSelectedCertificateWarranty(item)}
                license={license}
                currentUser={currentUser}
              />
            )}

            {/* TAB 2: BRANCH MANAGEMENT */}
            {activeTab === 'branches' && (
              <BranchManagement
                branches={branches}
                warranties={warranties}
                onAddBranch={handleAddBranch}
                onUpdateBranch={handleUpdateBranch}
                onDeleteBranch={handleDeleteBranch}
                license={license}
                currentUser={currentUser}
              />
            )}

            {/* TAB 3: RMA TICKET SYSTEM */}
            {activeTab === 'rma' && (
              <RMATicketManagement
                rmaTickets={rmaTickets}
                branches={branches}
                onAddRMATicket={handleAddRMATicket}
                onUpdateRMATicket={handleUpdateRMATicket}
                onPrintReceipt={(ticket) => setSelectedRMAReceipt(ticket)}
                license={license}
                currentUser={currentUser}
              />
            )}

            {/* TAB 4: EXCEL IMPORT / EXPORT SYSTEM */}
            {activeTab === 'import_export' && (
              <ImportExportModal
                warranties={warranties}
                branches={branches}
                onBatchImport={handleBatchImportWarranties}
                license={license}
              />
            )}

            {/* TAB 5: WOOCOMMERCE AUTOMATION */}
            {activeTab === 'woocommerce' && (
              <WooCommerceAutomation
                orders={orders}
                branches={branches}
                onCompleteOrder={handleCompleteOrder}
                license={license}
              />
            )}

            {/* TAB 6: NOTIFICATIONS GATEWAY */}
            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={notifications}
                onSendCustomNotification={handleSendCustomNotification}
              />
            )}

            {/* TAB 7: LICENSE SECURITY SETTINGS */}
            {activeTab === 'license' && (
              <LicenseSettings
                license={license}
                onUpdateLicense={handleUpdateLicense}
              />
            )}

            {/* TAB 8: DATABASE TABLES INSPECTOR */}
            {activeTab === 'db_inspector' && (
              <DatabaseInspector
                license={license}
                branches={branches}
                warranties={warranties}
                rmaTickets={rmaTickets}
              />
            )}

            {/* TAB 9: WORDPRESS PHP CODE EXPORTER */}
            {activeTab === 'plugin_code' && <WordPressPluginExporter />}
          </>
        )}
      </main>

      {/* Printable E-Warranty Certificate Card Modal */}
      <WarrantyCertificateModal
        warranty={selectedCertificateWarranty}
        onClose={() => setSelectedCertificateWarranty(null)}
      />

      {/* Printable RMA Intake Receipt Modal */}
      <RMAReceiptModal
        ticket={selectedRMAReceipt}
        onClose={() => setSelectedRMAReceipt(null)}
      />

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-700/80 py-6 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">THÀNH AUDIO WARRANTY PRO v2.5.0</span>
            <span>•</span>
            <span className="text-slate-400">Server Bản Quyền: https://thanhaudio.vn/security</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Cơ Chế Bảo Mật Strict Data Block & Báo Cáo Tự Động Định Kỳ
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

