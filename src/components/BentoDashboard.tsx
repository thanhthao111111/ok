import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Wrench,
  ShoppingBag,
  Bell,
  Key,
  Database,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Branch, LicenseInfo, NotificationLog, RMATicket, WarrantyItem, WooCommerceOrder } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';

interface BentoDashboardProps {
  license: LicenseInfo;
  branches: Branch[];
  warranties: WarrantyItem[];
  rmaTickets: RMATicket[];
  orders: WooCommerceOrder[];
  notifications: NotificationLog[];
  onNavigateTab: (tab: any) => void;
  onQuickVerifyLicense: () => void;
  onOpenAddWarranty: () => void;
  onOpenAddRMA: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  license,
  branches,
  warranties,
  rmaTickets,
  orders,
  notifications,
  onNavigateTab,
  onQuickVerifyLicense,
  onOpenAddWarranty,
  onOpenAddRMA,
}) => {
  const isBlocked = isStrictDataBlocked(license);
  const activeWarranties = warranties.filter((w) => w.status === 'active').length;
  const expiringWarranties = warranties.filter((w) => w.status === 'expiring_soon').length;
  const activePercent = warranties.length > 0 ? Math.round((activeWarranties / warranties.length) * 100) : 0;
  const inRepairTickets = rmaTickets.filter((r) => r.status === 'repairing' || r.status === 'checking').length;

  return (
    <div className="space-y-6">
      {/* Bento Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
              Bento Control Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              v2.5.0 Enterprise Pro
            </span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            Tổng Quan Hệ Thống Bảo Hành Điện Tử Thành Audio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản trị giấy phép bản quyền, cơ chế Strict Data Block, 4 chi nhánh phân phối & quy trình RMA kỹ thuật.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('import_export')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel 9 Cột</span>
          </button>
          <button
            onClick={onOpenAddWarranty}
            disabled={isBlocked}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition ${
              isBlocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-[#F27D26] hover:bg-[#d96c1d] text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Phiếu Mới</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* BENTO CARD 1: License Security (Col 4) */}
        <section className="md:col-span-4 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#F27D26]" />
                License Security
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                  license.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                }`}
              >
                {license.status === 'active' ? 'Active Pro' : 'Incomplete'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <label className="text-[10px] text-slate-500 block uppercase font-mono mb-1">
                  Server Endpoint
                </label>
                <code className="text-xs text-blue-400 font-mono break-all">
                  {license.server_url}/api/v1/verify-license
                </code>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <label className="text-[10px] text-slate-500 block uppercase font-mono mb-1">
                  License Key
                </label>
                <div className="font-mono text-xs text-slate-200 truncate">
                  {license.license_key || 'THANHAUDIO-PRO-DEMO-XXXX'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Version</span>
                  <span className="text-xs font-mono text-slate-200">v2.5.0-PRO</span>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Auto-Cron</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">24H ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('license')}
              className="flex-1 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] text-white font-bold rounded-lg transition-colors text-xs uppercase tracking-wider text-center"
            >
              Verify System
            </button>
            <button
              onClick={onQuickVerifyLicense}
              title="Kiểm thử xác thực bản quyền nhanh"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* BENTO CARD 2: Warranty Database (Col 8) */}
        <section className="md:col-span-8 bg-[#1E293B] border border-slate-700/80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-700/80 flex flex-wrap justify-between items-center bg-slate-900/50 gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Warranty Database {isBlocked && <span className="text-red-400 font-mono">(Read-Only Mode)</span>}
                </h2>
                <span className="text-[11px] font-mono text-slate-500">
                  ({warranties.length} entries)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('serials')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 border border-slate-700"
                >
                  <span>Xem Toàn Bộ</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onNavigateTab('import_export')}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-xs flex items-center gap-1.5 font-semibold"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-mono">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Mã Serial/IMEI</th>
                    <th className="px-4 py-3 font-semibold">Khách Hàng</th>
                    <th className="px-4 py-3 font-semibold">Chi Nhánh/Nơi Bán</th>
                    <th className="px-4 py-3 font-semibold">Trạng Thái</th>
                    <th className="px-4 py-3 font-semibold">Ngày Hết Hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {warranties.slice(0, 4).map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#F27D26] font-semibold">
                        {w.serial_number}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-200">{w.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{w.customer_phone}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 truncate max-w-[140px]">
                        {w.branch_name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            w.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : w.status === 'expiring_soon'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {w.status === 'active'
                            ? 'Còn hạn'
                            : w.status === 'expiring_soon'
                            ? 'Sắp hết hạn'
                            : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">
                        {w.expiry_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 text-center border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            {isBlocked
              ? 'Dữ liệu được bảo vệ trong chế độ Chỉ Đọc (Strict Data Block Active)'
              : 'Hệ thống đồng bộ trực tuyến với WordPress MySQL CSDL'}
          </div>
        </section>

        {/* BENTO CARD 3: Hệ Thống Chi Nhánh (Col 4) */}
        <section className="md:col-span-4 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#F27D26]" />
                Hệ Thống Chi Nhánh
              </h2>
              <button
                onClick={() => onNavigateTab('branches')}
                className="text-[11px] text-[#F27D26] hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>Quản lý</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {branches.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-2.5 bg-slate-900/60 rounded-lg border-l-4 border-[#F27D26] border border-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{b.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{b.address}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-slate-300">{b.phone}</div>
                    <div className="text-[9px] uppercase text-[#F27D26] font-semibold">
                      {b.is_active ? 'Hoạt động' : 'Tạm nghỉ'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <div className="text-lg font-bold text-white font-mono">{branches.length}</div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Tổng điểm bán</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {warranties.length}
              </div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Mã Serial</div>
            </div>
          </div>
        </section>

        {/* BENTO CARD 4: RMA Status Tracking (Col 4) */}
        <section className="md:col-span-4 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                RMA Status Tracking
              </h2>
              <button
                onClick={() => onNavigateTab('rma')}
                className="text-[11px] text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>Quy trình</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-around py-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-[#F27D26] flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs font-bold font-mono text-white">{activePercent}%</span>
                </div>
                <span className="text-[9px] uppercase text-slate-400 font-semibold">Active Rate</span>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-slate-300 font-medium">6 Bước Kỹ Thuật:</div>
                <div className="flex gap-1.5">
                  <div className="w-5 h-5 bg-blue-500 rounded text-[9px] font-bold flex items-center justify-center text-white" title="Mới tiếp nhận">1</div>
                  <div className="w-5 h-5 bg-amber-500 rounded text-[9px] font-bold flex items-center justify-center text-slate-950" title="Đang kiểm tra">2</div>
                  <div className="w-5 h-5 bg-indigo-500 rounded text-[9px] font-bold flex items-center justify-center text-white animate-pulse" title="Đang sửa chữa">3</div>
                  <div className="w-5 h-5 bg-emerald-500 rounded text-[9px] font-bold flex items-center justify-center text-slate-950" title="Hoàn tất">4</div>
                  <div className="w-5 h-5 bg-purple-500 rounded text-[9px] font-bold flex items-center justify-center text-white" title="Đã trả khách">5</div>
                </div>
                <div className="text-[11px] text-blue-400 font-mono font-semibold">
                  Đang xử lý: {inRepairTickets} phiếu
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAddRMA}
            disabled={isBlocked}
            className={`mt-3 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              isBlocked
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tiếp Nhận Sửa Chữa RMA</span>
          </button>
        </section>

        {/* BENTO CARD 5: Automation Hub (Col 4) */}
        <section className="md:col-span-4 bg-gradient-to-br from-indigo-950/60 via-[#1E293B] to-[#1E293B] border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Automation Hub
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono border border-indigo-500/40">
                Woo + ZNS
              </span>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-indigo-900/40 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                  WooCommerce Hook:
                </span>
                <span className="text-emerald-400 font-mono font-bold">Enabled</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  Zalo ZNS / SMS Brand:
                </span>
                <span className="text-amber-400 font-mono font-bold">Ready</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Đơn hàng chờ sync:</span>
                <span className="font-mono text-slate-200">{orders.filter((o) => !o.is_synced_to_warranty).length} đơn</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('woocommerce')}
              className="py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/50 rounded-lg text-[10px] uppercase font-bold tracking-wider transition text-center"
            >
              Woo Hook
            </button>
            <button
              onClick={() => onNavigateTab('notifications')}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] uppercase font-bold tracking-wider transition text-center"
            >
              Gateway ZNS
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
