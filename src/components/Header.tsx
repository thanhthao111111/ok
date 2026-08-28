import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  Building2,
  FileSpreadsheet,
  Wrench,
  Key,
  Bell,
  RefreshCw,
  Database,
  Code2,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import {
  ActiveTab,
  AppViewMode,
  LicenseInfo,
  UserProfile,
} from '../types';

interface HeaderProps {
  viewMode: AppViewMode;
  onSelectViewMode: (mode: AppViewMode) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  license: LicenseInfo;
  onUpdateLicenseStatus: (status: 'active' | 'invalid' | 'expired' | 'unlicensed') => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onTriggerCronCheck: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onSelectViewMode,
  activeTab,
  onSelectTab,
  license,
  onUpdateLicenseStatus,
  currentUser,
  allUsers,
  onSwitchUser,
  onTriggerCronCheck,
  notificationCount,
}) => {
  const [showLicenseMenu, setShowLicenseMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLicenseActive = license.status === 'active' && !license.is_write_blocked;

  return (
    <header className="bg-[#1E293B] text-slate-100 border-b border-slate-700/80 sticky top-0 z-40">
      {/* Top micro bar for WordPress simulation & view toggle */}
      <div className="bg-[#0F172A] px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[#F27D26]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F27D26] animate-pulse" />
            <span className="font-bold">WORDPRESS 6.7</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-sans text-[11px]">Plugin v2.5.0-PRO</span>
          </div>

          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Server Xác Thực:{' '}
            <code className="text-emerald-400 font-mono text-[11px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
              thanhaudio.vn/security/api/v1
            </code>
          </span>
        </div>

        {/* View Switcher: Admin vs Shortcodes */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
          <button
            id="view-mode-admin"
            onClick={() => onSelectViewMode('admin')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'admin'
                ? 'bg-[#F27D26] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WP-Admin Backend</span>
          </button>

          <button
            id="view-mode-lookup"
            onClick={() => onSelectViewMode('frontend_lookup')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'frontend_lookup'
                ? 'bg-[#F27D26] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>[warranty_lookup]</span>
          </button>

          <button
            id="view-mode-activation"
            onClick={() => onSelectViewMode('frontend_activation')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'frontend_activation'
                ? 'bg-[#F27D26] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>[warranty_activation]</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Bento Style */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F27D26] flex items-center justify-center text-white shadow-md font-black tracking-tighter text-xl shrink-0">
              TA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                  THÀNH AUDIO WARRANTY PRO
                </span>
                <span className="bg-[#F27D26]/20 text-[#F27D26] text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#F27D26]/40">
                  BENTO EDITION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase hidden sm:block">
                Enterprise Warranty & Security License Manager
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live API Status indicator */}
            <div className="hidden md:flex items-center gap-2.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/80">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  API Status
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">
                  {isLicenseActive ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLicenseActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick License Status Pill */}
            <div className="relative">
              <button
                id="btn-license-status-pill"
                onClick={() => setShowLicenseMenu(!showLicenseMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isLicenseActive
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25 animate-pulse'
                }`}
              >
                {isLicenseActive ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                )}
                <span className="hidden lg:inline text-slate-400 font-normal">Bản quyền:</span>
                <span className="font-bold">
                  {license.status === 'active'
                    ? 'Đã kích hoạt (Pro)'
                    : license.status === 'expired'
                    ? 'Đã hết hạn'
                    : license.status === 'invalid'
                    ? 'Không hợp lệ'
                    : 'Chưa kích hoạt'}
                </span>
              </button>

              {/* License Simulation Popover */}
              {showLicenseMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#F27D26]" />
                      Trình kiểm tra Bản quyền
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isLicenseActive
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                          : 'bg-red-900 text-red-200 border border-red-700'
                      }`}
                    >
                      {license.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="text-slate-400 text-[11px]">
                      Kiểm thử phản ứng của hệ thống khi trạng thái bản quyền thay đổi:
                    </p>
                    <button
                      onClick={() => {
                        onUpdateLicenseStatus('active');
                        setShowLicenseMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 flex items-center justify-between border border-emerald-800/60"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hợp lệ (Full Quyền Ghi & Import)</span>
                      </span>
                      {license.status === 'active' && <span className="text-[10px]">Đang chọn</span>}
                    </button>

                    <button
                      onClick={() => {
                        onUpdateLicenseStatus('expired');
                        setShowLicenseMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 flex items-center justify-between border border-amber-800/60"
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đã Hết Hạn (Khóa Ghi / Read-Only)</span>
                      </span>
                      {license.status === 'expired' && <span className="text-[10px]">Đang chọn</span>}
                    </button>

                    <button
                      onClick={() => {
                        onUpdateLicenseStatus('invalid');
                        setShowLicenseMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 flex items-center justify-between border border-red-800/60"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>Sai Key / Chưa kích hoạt</span>
                      </span>
                      {license.status === 'invalid' && <span className="text-[10px]">Đang chọn</span>}
                    </button>

                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                      <button
                        onClick={() => {
                          onTriggerCronCheck();
                          setShowLicenseMenu(false);
                        }}
                        className="text-[11px] text-[#F27D26] hover:text-amber-300 flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Chạy Cron 24h Kiểm tra Server
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('license');
                          setShowLicenseMenu(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        Mở chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active User Switcher (RBAC) */}
            <div className="relative">
              <button
                id="btn-user-role-switcher"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs border border-slate-700 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#F27D26]"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-[11px] font-bold text-white truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#F27D26] font-medium">
                    {currentUser.role === 'administrator'
                      ? 'Administrator'
                      : currentUser.role === 'branch_manager'
                      ? 'Branch Manager'
                      : 'Technician'}
                  </div>
                </div>
              </button>

              {/* User Switch Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-700">
                    Chuyển vai trò người dùng (RBAC)
                  </div>
                  <div className="mt-2 space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition ${
                          currentUser.id === u.id
                            ? 'bg-[#F27D26]/20 border border-[#F27D26]/40 text-white'
                            : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-600"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-[#F27D26]">
                            {u.role === 'administrator'
                              ? 'Admin Toàn quyền'
                              : u.role === 'branch_manager'
                              ? `Quản lý ${u.branch_name}`
                              : 'Kỹ thuật viên RMA'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => onSelectTab('notifications')}
              className="relative p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Thông báo tự động (Zalo / SMS / Email)"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F27D26] text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs (Only visible when viewMode === 'admin') */}
      {viewMode === 'admin' && (
        <div className="bg-[#0F172A] border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            <TabButton
              id="tab-btn-dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => onSelectTab('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Bento Dashboard"
            />
            <TabButton
              id="tab-btn-serials"
              active={activeTab === 'serials'}
              onClick={() => onSelectTab('serials')}
              icon={<Search className="w-4 h-4" />}
              label="Phiếu Bảo Hành & Serials"
            />
            <TabButton
              id="tab-btn-branches"
              active={activeTab === 'branches'}
              onClick={() => onSelectTab('branches')}
              icon={<Building2 className="w-4 h-4" />}
              label="Nơi Bán & Chi Nhánh"
            />
            <TabButton
              id="tab-btn-rma"
              active={activeTab === 'rma'}
              onClick={() => onSelectTab('rma')}
              icon={<Wrench className="w-4 h-4" />}
              label="Quy Trình Sửa Chữa (RMA)"
            />
            <TabButton
              id="tab-btn-import-export"
              active={activeTab === 'import_export'}
              onClick={() => onSelectTab('import_export')}
              icon={<FileSpreadsheet className="w-4 h-4" />}
              label="Nhập / Xuất Excel"
            />
            <TabButton
              id="tab-btn-woocommerce"
              active={activeTab === 'woocommerce'}
              onClick={() => onSelectTab('woocommerce')}
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Tự Động WooCommerce"
            />
            <TabButton
              id="tab-btn-notifications"
              active={activeTab === 'notifications'}
              onClick={() => onSelectTab('notifications')}
              icon={<Bell className="w-4 h-4" />}
              label="Cổng Thông Báo (Zalo/SMS)"
            />
            <TabButton
              id="tab-btn-license"
              active={activeTab === 'license'}
              onClick={() => onSelectTab('license')}
              icon={<Key className="w-4 h-4" />}
              label="Cài Đặt Bản Quyền"
            />
            <TabButton
              id="tab-btn-db-inspector"
              active={activeTab === 'db_inspector'}
              onClick={() => onSelectTab('db_inspector')}
              icon={<Database className="w-4 h-4" />}
              label="Cơ Sở Dữ Liệu (DB)"
            />
            <TabButton
              id="tab-btn-plugin-code"
              active={activeTab === 'plugin_code'}
              onClick={() => onSelectTab('plugin_code')}
              icon={<Code2 className="w-4 h-4" />}
              label="Mã Nguồn Plugin (PHP)"
            />
          </nav>
        </div>
      )}
    </header>
  );
};

interface TabButtonProps {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ id, active, onClick, icon, label }) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
        active
          ? 'bg-[#F27D26] text-white shadow-sm font-bold'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

