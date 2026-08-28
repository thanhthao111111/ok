import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Phone,
  MapPin,
  User,
  Mail,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  Store,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { Branch, LicenseInfo, UserProfile } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';

interface BranchManagementProps {
  branches: Branch[];
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
  onUpdateBranch: (id: number, branch: Partial<Branch>) => void;
  onDeleteBranch: (id: number) => void;
  license: LicenseInfo;
  currentUser: UserProfile;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({
  branches,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  license,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    address: '',
    manager_name: '',
    email: '',
    is_active: true,
    notes: '',
  });

  const isBlocked = isStrictDataBlocked(license);
  const isAdmin = currentUser.role === 'administrator';

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    if (isBlocked) {
      alert(
        'CẢNH BÁO KHÓA DỮ LIỆU: Plugin chưa kích hoạt bản quyền hợp lệ từ thanhaudio.vn/security. Không thể thêm mới chi nhánh!'
      );
      return;
    }
    setFormData({
      code: `CN-${branches.length + 1}`,
      name: '',
      phone: '',
      address: '',
      manager_name: '',
      email: '',
      is_active: true,
      notes: '',
    });
    setEditingBranch(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    if (isBlocked) {
      alert(
        'CẢNH BÁO KHÓA DỮ LIỆU: Plugin chưa kích hoạt bản quyền hợp lệ từ thanhaudio.vn/security. Không thể sửa đổi chi nhánh!'
      );
      return;
    }
    setFormData({
      code: branch.code,
      name: branch.name,
      phone: branch.phone,
      address: branch.address,
      manager_name: branch.manager_name,
      email: branch.email,
      is_active: branch.is_active,
      notes: branch.notes || '',
    });
    setEditingBranch(branch);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      alert('Không thể lưu do hệ thống đang trong chế độ Chỉ Đọc (Read-Only Mode).');
      return;
    }
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (Tên chi nhánh, Số điện thoại, Địa chỉ).');
      return;
    }

    if (editingBranch) {
      onUpdateBranch(editingBranch.id, formData);
    } else {
      onAddBranch({
        ...formData,
        total_warranties: 0,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                PHẦN II: BRANCH & SELLER MANAGEMENT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {branches.length} Chi nhánh / Điểm bán
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#F27D26]" />
              Quản Lý Nơi Bán, Chi Nhánh & Thông Tin Điểm Bán Hàng
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Quản lý danh sách Showroom chính hãng và Đại lý ủy quyền. Thông tin Hotline, Địa chỉ và Người bán sẽ tự động xuất hiện trên phiếu bảo hành và giao diện tra cứu của khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-new-branch"
              onClick={handleOpenAdd}
              disabled={isBlocked || !isAdmin}
              title={
                isBlocked
                  ? 'Tính năng bị khóa do bản quyền chưa hợp lệ'
                  : !isAdmin
                  ? 'Chỉ Administrator mới có quyền tạo chi nhánh'
                  : 'Thêm chi nhánh mới'
              }
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition ${
                isBlocked || !isAdmin
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chi Nhánh Mới</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên chi nhánh, số điện thoại, địa chỉ, người quản lý..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-slate-100 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Lookup Preview Box Requirement */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30 rounded-lg shrink-0 mt-0.5">
            <Store className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200">
              Quy Chuẩn Hiển Thị Điểm Bán Trên Kết Quả Tra Cứu Khách Hàng (Section II):
            </div>
            <p className="text-slate-400">
              Khi khách hàng tra cứu Serial hoặc SĐT trên trang chủ, hệ thống sẽ hiển thị nổi bật điểm bán:
            </p>
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-[#F27D26] font-semibold">
              Mua tại: [Tên Chi Nhánh] - ĐC: [Địa chỉ Chi Nhánh] - Hotline Bảo Hành Chi Nhánh: [SĐT Chi Nhánh]
            </div>
          </div>
        </div>
      </div>

      {/* Branches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-5 hover:border-[#F27D26]/50 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {branch.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Hoạt động
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug">
                    {branch.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/80">
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#F27D26] shrink-0 mt-0.5" />
                  <span className="font-mono font-semibold text-white">
                    Hotline: {branch.phone}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-tight">
                    {branch.address}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">
                    Quản lý/Đại diện:{' '}
                    <strong className="text-slate-200">{branch.manager_name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400 font-mono text-[11px]">
                    {branch.email}
                  </span>
                </div>

                {branch.notes && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 italic">
                    {branch.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom stats & action */}
            <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Đã cấp BH:{' '}
                <strong className="text-[#F27D26] font-mono font-bold">
                  {branch.total_warranties || 0}
                </strong>{' '}
                thiết bị
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(branch)}
                  disabled={isBlocked || !isAdmin}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition disabled:opacity-30"
                  title={isBlocked ? 'Khóa do bản quyền' : 'Sửa chi nhánh'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (isBlocked) {
                      alert('Không thể xóa do hệ thống đang trong chế độ Khóa Ghi (Write-Block).');
                      return;
                    }
                    if (confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${branch.name}"?`)) {
                      onDeleteBranch(branch.id);
                    }
                  }}
                  disabled={isBlocked || !isAdmin || branches.length <= 1}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg border border-red-900/50 transition disabled:opacity-20"
                  title="Xóa chi nhánh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F27D26]" />
                {editingBranch ? 'Cập Nhật Thông Tin Chi Nhánh' : 'Thêm Chi Nhánh / Showroom Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-300 mb-1">
                    Mã Chi Nhánh
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono uppercase text-white focus:border-[#F27D26]"
                    placeholder="HN-CG"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    Tên Chi Nhánh / Đại Lý <span className="text-[#F27D26]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                    placeholder="Thành Audio - Showroom Cầu Giấy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Số Điện Thoại Hotline <span className="text-[#F27D26]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                    placeholder="0987.654.321"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Người Đại Diện / Quản Lý <span className="text-[#F27D26]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manager_name}
                    onChange={(e) =>
                      setFormData({ ...formData, manager_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                    placeholder="Nguyễn Văn Thành"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Địa Chỉ Chi Nhánh (Hiển thị cho khách tra cứu){' '}
                  <span className="text-[#F27D26]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  placeholder="Số 168 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Email Liên Hệ Chi Nhánh
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                  placeholder="chinhanh@thanhaudio.vn"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Ghi Chú Phân Loại
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  placeholder="Đại lý phân phối cấp 1, trung tâm bảo hành miền Bắc..."
                />
              </div>

              <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-2">
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
                  {editingBranch ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
