import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  User,
  Phone,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Printer,
  QrCode,
  Wrench,
  CheckCircle2,
  ShoppingBag,
  Store,
  Sparkles,
} from 'lucide-react';
import { Branch, LicenseInfo, UserProfile, WarrantyItem, WarrantyStatus } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';

interface SerialWarrantyManagementProps {
  warranties: WarrantyItem[];
  branches: Branch[];
  onAddWarranty: (item: Omit<WarrantyItem, 'id' | 'created_at'>) => void;
  onUpdateWarranty: (id: number, item: Partial<WarrantyItem>) => void;
  onDeleteWarranty: (id: number) => void;
  onCreateRMATicketFromWarranty: (warranty: WarrantyItem) => void;
  onViewCertificate: (warranty: WarrantyItem) => void;
  license: LicenseInfo;
  currentUser: UserProfile;
}

export const SerialWarrantyManagement: React.FC<SerialWarrantyManagementProps> = ({
  warranties,
  branches,
  onAddWarranty,
  onUpdateWarranty,
  onDeleteWarranty,
  onCreateRMATicketFromWarranty,
  onViewCertificate,
  license,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>(
    currentUser.role === 'branch_manager' && currentUser.assigned_branch_id
      ? String(currentUser.assigned_branch_id)
      : 'all'
  );

  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WarrantyItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    serial_number: '',
    sku: 'JBL-PASION-10',
    product_name: 'Loa Karaoke JBL Pasion 10 (Bass 25cm, 200W)',
    category: 'Loa Karaoke',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_months: 24,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    branch_id: branches[0]?.id || 1,
    seller_name: 'Nguyễn Tuấn Anh',
    seller_phone: '0966.123.999',
    seller_role: 'Sale Staff' as const,
    invoice_number: '',
    notes: '',
  });

  const isBlocked = isStrictDataBlocked(license);
  const isTechnician = currentUser.role === 'technician';

  // Filter items
  const filteredItems = warranties.filter((item) => {
    // RBAC branch restriction
    if (currentUser.role === 'branch_manager' && currentUser.assigned_branch_id) {
      if (item.branch_id !== currentUser.assigned_branch_id) return false;
    }

    if (branchFilter !== 'all' && String(item.branch_id) !== branchFilter) {
      return false;
    }

    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    const s = searchTerm.toLowerCase();
    return (
      item.serial_number.toLowerCase().includes(s) ||
      item.sku.toLowerCase().includes(s) ||
      item.product_name.toLowerCase().includes(s) ||
      item.customer_name.toLowerCase().includes(s) ||
      item.customer_phone.includes(s) ||
      item.seller_name.toLowerCase().includes(s) ||
      item.branch_name.toLowerCase().includes(s)
    );
  });

  const calculateExpiry = (purchaseDate: string, months: number) => {
    const d = new Date(purchaseDate);
    d.setMonth(d.getMonth() + Number(months));
    return d.toISOString().split('T')[0];
  };

  const handleOpenAdd = () => {
    if (isBlocked) {
      alert('CẢNH BÁO: Tính năng bị khóa do bản quyền chưa hợp lệ từ thanhaudio.vn/security.');
      return;
    }
    const defaultBranch =
      branches.find((b) => b.id === currentUser.assigned_branch_id) || branches[0];
    const randomSerial = `TA-AUDIO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    setFormData({
      serial_number: randomSerial,
      sku: 'JBL-PASION-10',
      product_name: 'Loa Karaoke JBL Pasion 10',
      category: 'Loa Karaoke',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_months: 24,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
      branch_id: defaultBranch?.id || 1,
      seller_name: currentUser.name.split('(')[0].trim(),
      seller_phone: '0987.654.321',
      seller_role: 'Sale Staff',
      invoice_number: `HD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: WarrantyItem) => {
    if (isBlocked) {
      alert('CẢNH BÁO: Tính năng sửa bị khóa trong chế độ Chỉ Đọc (Read-Only Mode).');
      return;
    }
    setFormData({
      serial_number: item.serial_number,
      sku: item.sku,
      product_name: item.product_name,
      category: item.category,
      purchase_date: item.purchase_date,
      warranty_months: item.warranty_months,
      customer_name: item.customer_name,
      customer_phone: item.customer_phone,
      customer_email: item.customer_email || '',
      customer_address: item.customer_address || '',
      branch_id: item.branch_id,
      seller_name: item.seller_name,
      seller_phone: item.seller_phone || '',
      seller_role: item.seller_role,
      invoice_number: item.invoice_number || '',
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      alert('Không thể lưu do hệ thống đang bị khóa bảo mật bản quyền.');
      return;
    }

    const selectedBranch = branches.find((b) => b.id === Number(formData.branch_id)) || branches[0];
    const expiryDate = calculateExpiry(formData.purchase_date, formData.warranty_months);

    const now = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    let status: WarrantyStatus = 'active';
    if (diffDays < 0) status = 'expired';
    else if (diffDays <= 30) status = 'expiring_soon';

    const payload = {
      ...formData,
      branch_id: selectedBranch.id,
      branch_name: selectedBranch.name,
      branch_phone: selectedBranch.phone,
      branch_address: selectedBranch.address,
      expiry_date: expiryDate,
      status,
    };

    if (editingItem) {
      onUpdateWarranty(editingItem.id, payload);
    } else {
      onAddWarranty({
        ...payload,
        rma_count: 0,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                PHẦN II & V: QUẢN LÝ SERIAL & PHIẾU BẢO HÀNH
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {warranties.length} Thiết bị trong hệ thống
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F27D26]" />
              Danh Sách Phiếu Bảo Hành & Mã Serial/IMEI
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Quản lý toàn bộ thiết bị âm thanh được kích hoạt, theo dõi ngày mua, hạn bảo hành, gắn chặt chẽ điểm bán/chi nhánh và người phụ trách bàn giao.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-new-serial"
              onClick={handleOpenAdd}
              disabled={isBlocked}
              title={isBlocked ? 'Tính năng bị khóa do bản quyền chưa hợp lệ' : 'Tạo phiếu bảo hành mới'}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition ${
                isBlocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Phiếu Bảo Hành Mới</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Serial, SKU, Tên khách hàng, Số điện thoại, Người bán..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-slate-200"
            >
              <option value="all">Tất cả trạng thái bảo hành</option>
              <option value="active">Còn hạn bảo hành (Active)</option>
              <option value="expiring_soon">Sắp hết hạn (≤ 30 ngày)</option>
              <option value="expired">Đã hết hạn (Expired)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              disabled={currentUser.role === 'branch_manager'}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-slate-200 disabled:bg-slate-950 disabled:text-slate-600"
            >
              <option value="all">Tất cả chi nhánh / điểm bán</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Warranties Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-300 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Mã Serial / SKU</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Điểm Bán & Người Bán</th>
                <th className="py-3 px-4">Ngày Mua & Hạn BH</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    Không tìm thấy phiếu bảo hành nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isExpiring = item.status === 'expiring_soon';
                  const isExpired = item.status === 'expired';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Serial & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white flex items-center gap-1.5">
                          <span>{item.serial_number}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#F27D26] bg-[#F27D26]/10 inline-block px-1.5 py-0.5 rounded mt-0.5 border border-[#F27D26]/30">
                          {item.sku}
                        </div>
                        {item.woocommerce_order_id && (
                          <div className="text-[10px] text-indigo-400 flex items-center gap-1 mt-0.5">
                            <ShoppingBag className="w-3 h-3" />
                            <span>Đơn WC: {item.woocommerce_order_id}</span>
                          </div>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-100 truncate" title={item.product_name}>
                          {item.product_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.category} • BH {item.warranty_months} tháng
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {item.customer_name}
                        </div>
                        <div className="text-slate-300 font-mono text-[11px]">
                          {item.customer_phone}
                        </div>
                        {item.customer_address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={item.customer_address}>
                            {item.customer_address}
                          </div>
                        )}
                      </td>

                      {/* Branch & Seller */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-semibold text-[#F27D26] flex items-center gap-1 truncate" title={item.branch_name}>
                          <Store className="w-3 h-3 text-[#F27D26] shrink-0" />
                          <span className="truncate">{item.branch_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>Người bán: <strong className="text-slate-300">{item.seller_name}</strong></span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4">
                        <div className="text-slate-400 text-[11px]">
                          Mua: <strong className="font-mono text-slate-300">{item.purchase_date}</strong>
                        </div>
                        <div className="text-white font-bold text-[11px] mt-0.5">
                          Hết hạn: <span className="font-mono text-[#F27D26]">{item.expiry_date}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {item.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <ShieldCheck className="w-3 h-3" />
                            Còn Hạn
                          </span>
                        )}
                        {isExpiring && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Sắp Hết Hạn
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            <XCircle className="w-3 h-3" />
                            Đã Hết Hạn
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Certificate / Card */}
                          <button
                            onClick={() => onViewCertificate(item)}
                            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                            title="In Phiếu / Xem Chứng Nhận Bảo Hành"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Quick Create RMA ticket */}
                          <button
                            onClick={() => onCreateRMATicketFromWarranty(item)}
                            disabled={isBlocked}
                            className={`p-1.5 rounded-lg border transition ${
                              isBlocked
                                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-400 border-blue-800/60'
                            }`}
                            title={isBlocked ? 'Khóa bảo mật' : 'Tiếp Nhận Sửa Chữa (Tạo Phiếu RMA)'}
                          >
                            <Wrench className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            disabled={isBlocked || isTechnician}
                            className={`p-1.5 rounded-lg border transition ${
                              isBlocked || isTechnician
                                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                            }`}
                            title={isBlocked ? 'Khóa do bản quyền' : 'Chỉnh sửa'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (isBlocked) {
                                alert('Không thể xóa do hệ thống đang trong chế độ Khóa Ghi (Strict Write-Block).');
                                return;
                              }
                              if (confirm(`Bạn có chắc chắn muốn xóa mã serial "${item.serial_number}"?`)) {
                                onDeleteWarranty(item.id);
                              }
                            }}
                            disabled={isBlocked || isTechnician}
                            className={`p-1.5 rounded-lg border transition ${
                              isBlocked || isTechnician
                                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                : 'bg-red-950/60 hover:bg-red-900/80 text-red-400 border-red-800/60'
                            }`}
                            title="Xóa phiếu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Warranty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F27D26]" />
                {editingItem ? 'Chỉnh Sửa Phiếu Bảo Hành' : 'Kích Hoạt Phiếu Bảo Hành Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Product & Serial */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-[#F27D26] uppercase tracking-wider text-[10px] font-mono">
                  1. Thông Tin Thiết Bị Âm Thanh & Serial
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Mã Serial / IMEI <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.serial_number}
                      onChange={(e) =>
                        setFormData({ ...formData, serial_number: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono uppercase font-bold text-white focus:border-[#F27D26]"
                      placeholder="TA-JBL-2026-XXXX"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Mã SKU Sản Phẩm <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono uppercase text-white focus:border-[#F27D26]"
                      placeholder="JBL-PASION-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Tên Sản Phẩm <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                      placeholder="Loa Karaoke JBL Pasion 10"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Danh Mục Thiết Bị
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                    >
                      <option value="Loa Karaoke">Loa Karaoke</option>
                      <option value="Cục Đẩy Công Suất">Cục Đẩy Công Suất</option>
                      <option value="Vang Số / Vang Cơ">Vang Số / Vang Cơ</option>
                      <option value="Micro">Micro Không Dây / Có Dây</option>
                      <option value="Loa Subwoofer">Loa Subwoofer Siêu Trầm</option>
                      <option value="Dàn Âm Thanh Trọn Gói">Dàn Âm Thanh Trọn Gói</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-[#F27D26] uppercase tracking-wider text-[10px] font-mono">
                  2. Thông Tin Khách Hàng
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Họ Tên Khách Hàng <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Số Điện Thoại Khách <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                      placeholder="0912345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Email Khách Hàng
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                      placeholder="khachhang@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Địa Chỉ Giao Hàng / Lắp Đặt
                    </label>
                    <input
                      type="text"
                      value={formData.customer_address}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_address: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                      placeholder="Số nhà, Phường, Quận, Tỉnh/TP"
                    />
                  </div>
                </div>
              </div>

              {/* Branch & Seller Assignment */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-[#F27D26] uppercase tracking-wider text-[10px] font-mono">
                  3. Nơi Bán & Nhân Viên Phụ Trách (Section II Requirements)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Chi Nhánh / Điểm Bán <span className="text-[#F27D26]">*</span>
                    </label>
                    <select
                      value={formData.branch_id}
                      onChange={(e) =>
                        setFormData({ ...formData, branch_id: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-[#F27D26]"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Nhân Viên / Người Bán <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.seller_name}
                      onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                      placeholder="Nguyễn Tuấn Anh (Sale)"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      SĐT Người Bán
                    </label>
                    <input
                      type="text"
                      value={formData.seller_phone}
                      onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                      placeholder="0987.654.321"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Ngày Mua <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Thời Hạn BH (Tháng) <span className="text-[#F27D26]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={formData.warranty_months}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty_months: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-[#F27D26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Số Hóa Đơn / Phiếu Xuất
                    </label>
                    <input
                      type="text"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                      placeholder="HD-2026-001"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ghi Chú Đơn Hàng / Thiết Bị</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  placeholder="Kèm phụ kiện, dây loa, chính sách bảo hành đặc biệt..."
                />
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isBlocked}
                  className="px-5 py-2 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Kích Hoạt Phiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
