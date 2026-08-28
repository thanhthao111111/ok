import React, { useState } from 'react';
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  PackageCheck,
  RefreshCw,
  Code,
  Layers,
} from 'lucide-react';
import { Branch, LicenseInfo, WarrantyItem, WooCommerceOrder } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';

interface WooCommerceAutomationProps {
  orders: WooCommerceOrder[];
  branches: Branch[];
  onCompleteOrder: (order: WooCommerceOrder) => void;
  license: LicenseInfo;
}

export const WooCommerceAutomation: React.FC<WooCommerceAutomationProps> = ({
  orders,
  branches,
  onCompleteOrder,
  license,
}) => {
  const isBlocked = isStrictDataBlocked(license);
  const [prefixRule, setPrefixRule] = useState('TA-{SKU}-{YEAR}-{RANDOM}');
  const [autoBranchMode, setAutoBranchMode] = useState<'customer_geo' | 'default_hq'>('customer_geo');

  const handleTriggerComplete = (order: WooCommerceOrder) => {
    if (isBlocked) {
      alert('CẢNH BÁO KHÓA DỮ LIỆU: Không thể tạo phiếu bảo hành do bản quyền chưa được xác thực.');
      return;
    }
    onCompleteOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
            PHẦN V: TỰ ĐỘNG HÓA WOOCOMMERCE
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Hook: woocommerce_order_status_completed
          </span>
        </div>
        <h1 className="text-xl font-black text-white mt-2 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#F27D26]" />
          Tích Hợp WooCommerce & Tự Động Tạo Phiếu Bảo Hành
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Khi đơn hàng WooCommerce chuyển sang trạng thái <strong className="text-white">"Completed" (Hoàn thành)</strong>, hệ thống tự động gán mã Serial duy nhất, gắn điểm bán/chi nhánh phụ trách và tạo phiếu bảo hành điện tử ngay lập tức.
        </p>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-5 space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-700/80 pb-3">
            <Zap className="w-4 h-4 text-[#F27D26]" />
            Cấu Hình Quy Tắc Tự Động Sinh Mã Serial
          </h3>
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Định dạng sinh mã Serial tự động
            </label>
            <input
              type="text"
              value={prefixRule}
              onChange={(e) => setPrefixRule(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Ví dụ: <code className="text-[#F27D26] font-bold">TA-JBL-2026-88120</code>
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Quy tắc gán Chi Nhánh / Showroom phụ trách
            </label>
            <select
              value={autoBranchMode}
              onChange={(e) => setAutoBranchMode(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
            >
              <option value="customer_geo">Tự động gán Showroom gần địa chỉ khách hàng nhất</option>
              <option value="default_hq">Mặc định gán Trụ sở chính (Showroom Cầu Giấy)</option>
            </select>
          </div>
        </div>

        {/* Hook Info */}
        <div className="bg-[#1E293B] text-slate-200 rounded-2xl border border-slate-700/80 shadow-md p-5 space-y-3 text-xs">
          <h3 className="font-bold text-[#F27D26] uppercase tracking-wide flex items-center gap-2 border-b border-slate-700/80 pb-3">
            <Code className="w-4 h-4" />
            WordPress Action Hook Execution
          </h3>
          <div className="font-mono text-[11px] bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto">
            <pre>
{`add_action('woocommerce_order_status_completed', function($order_id) {
    if (ThanhAudio_License::is_write_blocked()) return;
    $order = wc_get_order($order_id);
    ThanhAudio_Warranty::create_from_wc_order($order);
});`}
            </pre>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Cơ chế Strict Write-Block sẽ chặn hook này kích hoạt nếu giấy phép chưa được xác thực.
          </p>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md overflow-hidden text-xs">
        <div className="p-4 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-white">
            Danh Sách Đơn Hàng WooCommerce ({orders.length} Đơn)
          </h3>
          <span className="text-[11px] text-slate-400">
            Bấm "Hoàn Tất Đơn" để thử nghiệm kích hoạt tự động
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Sản Phẩm & Giá Trị</th>
                <th className="py-3 px-4">Chi Nhánh Gán</th>
                <th className="py-3 px-4">Trạng Thái Đơn</th>
                <th className="py-3 px-4">Phiếu Bảo Hành</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {orders.map((order) => {
                const matchedBranch = branches.find((b) => b.id === order.branch_id) || branches[0];

                return (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{order.product_title}</div>
                      <div className="text-emerald-400 font-mono font-bold">
                        {order.total_amount.toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {matchedBranch.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" /> {order.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.is_synced_to_warranty && order.assigned_serial ? (
                        <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30 font-bold inline-block">
                          SN: {order.assigned_serial}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Chưa tạo</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {order.status !== 'completed' ? (
                        <button
                          onClick={() => handleTriggerComplete(order)}
                          disabled={isBlocked}
                          className="px-3 py-1.5 bg-[#F27D26] hover:bg-[#d96c1d] text-white font-bold rounded-lg shadow-xs transition inline-flex items-center gap-1 ml-auto disabled:opacity-40"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Chuyển Sang Completed</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Đã tự động tạo BH</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
