import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  ArrowRight,
  Printer,
  ShieldCheck,
  Building2,
  DollarSign,
  Layers,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { Branch, LicenseInfo, RMATicket, RMAStatus, UserProfile } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';

interface RMATicketManagementProps {
  rmaTickets: RMATicket[];
  branches: Branch[];
  onAddRMATicket: (ticket: Omit<RMATicket, 'id'>) => void;
  onUpdateRMATicket: (id: number, ticket: Partial<RMATicket>) => void;
  onPrintReceipt: (ticket: RMATicket) => void;
  license: LicenseInfo;
  currentUser: UserProfile;
}

const RMA_STAGES: { key: RMAStatus; label: string; color: string; badge: string }[] = [
  { key: 'new', label: '1. Mới tiếp nhận', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'checking', label: '2. Đang kiểm tra', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  { key: 'repairing', label: '3. Đang sửa chữa', color: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { key: 'completed', label: '4. Hoàn tất', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { key: 'returned', label: '5. Đã trả khách', color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
  { key: 'rejected', label: '6. Từ chối bảo hành', color: 'bg-red-500', badge: 'bg-red-100 text-red-800 border-red-300' },
];

export const RMATicketManagement: React.FC<RMATicketManagementProps> = ({
  rmaTickets,
  branches,
  onAddRMATicket,
  onUpdateRMATicket,
  onPrintReceipt,
  license,
  currentUser,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>(
    currentUser.role === 'branch_manager' && currentUser.assigned_branch_id
      ? String(currentUser.assigned_branch_id)
      : 'all'
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<RMATicket | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    ticket_code: '',
    serial_number: '',
    sku: 'JBL-PASION-10',
    product_name: 'Loa Karaoke JBL Pasion 10',
    customer_name: '',
    customer_phone: '',
    branch_id: branches[0]?.id || 1,
    receiving_staff: 'Nguyễn Tuấn Anh',
    technician_name: 'Trần Văn Kỹ',
    intake_date: new Date().toISOString(),
    status: 'new' as RMAStatus,
    fault_description: '',
    accessories_included: 'Dây nguồn, phụ kiện đi kèm',
    technician_notes: '',
    customer_notes: '',
    repair_cost: 0,
    replaced_parts: '',
    priority: 'normal' as const,
    warranty_covered: true,
  });

  const isBlocked = isStrictDataBlocked(license);

  const filteredTickets = rmaTickets.filter((t) => {
    if (currentUser.role === 'branch_manager' && currentUser.assigned_branch_id) {
      if (t.branch_id !== currentUser.assigned_branch_id) return false;
    }
    if (branchFilter !== 'all' && String(t.branch_id) !== branchFilter) {
      return false;
    }
    if (stageFilter !== 'all' && t.status !== stageFilter) {
      return false;
    }
    const q = searchTerm.toLowerCase();
    return (
      t.ticket_code.toLowerCase().includes(q) ||
      t.serial_number.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.customer_phone.includes(q) ||
      t.product_name.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    if (isBlocked) {
      alert('CẢNH BÁO: Tính năng bị khóa do bản quyền chưa được xác thực từ thanhaudio.vn/security.');
      return;
    }
    const curBranch =
      branches.find((b) => b.id === currentUser.assigned_branch_id) || branches[0];
    const ticketCode = `RMA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
      ticket_code: ticketCode,
      serial_number: '',
      sku: 'JBL-PASION-10',
      product_name: 'Loa Karaoke JBL Pasion 10',
      customer_name: '',
      customer_phone: '',
      branch_id: curBranch.id,
      receiving_staff: currentUser.name.split('(')[0].trim(),
      technician_name: 'Trần Văn Kỹ',
      intake_date: new Date().toISOString(),
      status: 'new',
      fault_description: '',
      accessories_included: 'Máy trần, không hộp',
      technician_notes: 'Đã nhận máy, bắt đầu kiểm tra đo đạc nguồn.',
      customer_notes: 'Đã tiếp nhận sản phẩm tại chi nhánh.',
      repair_cost: 0,
      replaced_parts: '',
      priority: 'normal',
      warranty_covered: true,
    });
    setEditingTicket(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (ticket: RMATicket) => {
    if (isBlocked) {
      alert('CẢNH BÁO: Không thể sửa đổi khi đang ở chế độ Chỉ Đọc (Read-Only Mode).');
      return;
    }
    setFormData({
      ticket_code: ticket.ticket_code,
      serial_number: ticket.serial_number,
      sku: ticket.sku,
      product_name: ticket.product_name,
      customer_name: ticket.customer_name,
      customer_phone: ticket.customer_phone,
      branch_id: ticket.branch_id,
      receiving_staff: ticket.receiving_staff,
      technician_name: ticket.technician_name,
      intake_date: ticket.intake_date,
      status: ticket.status,
      fault_description: ticket.fault_description,
      accessories_included: ticket.accessories_included || '',
      technician_notes: ticket.technician_notes || '',
      customer_notes: ticket.customer_notes || '',
      repair_cost: ticket.repair_cost || 0,
      replaced_parts: (ticket.replaced_parts || []).join(', '),
      priority: ticket.priority,
      warranty_covered: ticket.warranty_covered,
    });
    setEditingTicket(ticket);
    setShowAddModal(true);
  };

  const handleQuickAdvanceStatus = (ticket: RMATicket, nextStatus: RMAStatus) => {
    if (isBlocked) {
      alert('Chặn lưu dữ liệu: Giấy phép bản quyền không hợp lệ.');
      return;
    }
    onUpdateRMATicket(ticket.id, {
      status: nextStatus,
      completed_date:
        nextStatus === 'completed' || nextStatus === 'returned'
          ? new Date().toISOString()
          : ticket.completed_date,
      return_date: nextStatus === 'returned' ? new Date().toISOString() : ticket.return_date,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      alert('Chặn lưu: Tính năng bị khóa do bản quyền.');
      return;
    }

    const branch = branches.find((b) => b.id === Number(formData.branch_id)) || branches[0];
    const partsArray = formData.replaced_parts
      ? formData.replaced_parts.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const payload = {
      ticket_code: formData.ticket_code,
      serial_number: formData.serial_number,
      sku: formData.sku,
      product_name: formData.product_name,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      branch_id: branch.id,
      branch_name: branch.name,
      receiving_staff: formData.receiving_staff,
      technician_name: formData.technician_name,
      intake_date: formData.intake_date,
      status: formData.status,
      fault_description: formData.fault_description,
      accessories_included: formData.accessories_included,
      technician_notes: formData.technician_notes,
      customer_notes: formData.customer_notes,
      repair_cost: Number(formData.repair_cost),
      replaced_parts: partsArray,
      priority: formData.priority,
      warranty_covered: formData.warranty_covered,
      completed_date:
        formData.status === 'completed' || formData.status === 'returned'
          ? new Date().toISOString()
          : undefined,
      return_date: formData.status === 'returned' ? new Date().toISOString() : undefined,
    };

    if (editingTicket) {
      onUpdateRMATicket(editingTicket.id, payload);
    } else {
      onAddRMATicket(payload);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                PHẦN V: RMA TICKET SYSTEM
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Quy trình 6 bước sửa chữa kỹ thuật
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#F27D26]" />
              Quản Lý Quy Trình Sửa Chữa & Tiếp Nhận RMA
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Theo dõi tiến trình kỹ thuật: <strong className="text-slate-200">Mới tiếp nhận ➔ Đang kiểm tra ➔ Đang sửa chữa ➔ Hoàn tất ➔ Đã trả khách ➔ Từ chối bảo hành</strong>. Ghi nhận chi phí, linh kiện thay thế và in phiếu tiếp nhận khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-rma-ticket"
              onClick={handleOpenAdd}
              disabled={isBlocked}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition ${
                isBlocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tiếp Nhận Sửa Chữa Mới (Tạo Phiếu RMA)</span>
            </button>
          </div>
        </div>

        {/* Filter bar & view toggle */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã phiếu RMA, Serial, Tên khách, SĐT..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-slate-100 placeholder-slate-500"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              disabled={currentUser.role === 'branch_manager'}
              className="px-3 py-2 text-xs border border-slate-700 rounded-lg bg-slate-900 text-slate-200"
            >
              <option value="all">Tất cả chi nhánh xử lý</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${
                viewMode === 'kanban' ? 'bg-[#F27D26] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bảng Tiến Trình (Kanban)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${
                viewMode === 'list' ? 'bg-[#F27D26] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dạng Bảng Danh Sách
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {RMA_STAGES.map((stage) => {
            const stageTickets = filteredTickets.filter((t) => t.status === stage.key);

            return (
              <div
                key={stage.key}
                className="bg-[#1E293B] rounded-2xl border border-slate-700/80 p-3.5 flex flex-col min-w-[240px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/80">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <span>{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-[#F27D26] border border-slate-700 px-1.5 py-0.5 rounded">
                    {stageTickets.length}
                  </span>
                </div>

                {/* Stage Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageTickets.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-[11px] italic">
                      Không có phiếu nào
                    </div>
                  ) : (
                    stageTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-slate-900/90 rounded-xl border border-slate-700/70 shadow-xs p-3 space-y-2 hover:border-[#F27D26]/50 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-mono font-bold text-xs text-[#F27D26] bg-[#F27D26]/10 px-1.5 py-0.5 rounded border border-[#F27D26]/30">
                            {ticket.ticket_code}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              ticket.priority === 'urgent'
                                ? 'bg-red-600 text-white'
                                : ticket.priority === 'high'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-white line-clamp-1" title={ticket.product_name}>
                          {ticket.product_name}
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div className="font-mono text-slate-300 font-bold">
                            SN: {ticket.serial_number}
                          </div>
                          <div>Khách: <strong className="text-slate-200">{ticket.customer_name}</strong> ({ticket.customer_phone})</div>
                          <div className="text-slate-400 text-[10px] truncate">
                            CN: {ticket.branch_name}
                          </div>
                        </div>

                        <div className="text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300 line-clamp-2">
                          <strong className="text-[#F27D26]">Lỗi:</strong> {ticket.fault_description}
                        </div>

                        {ticket.repair_cost > 0 && (
                          <div className="text-[11px] font-bold text-emerald-400">
                            Chi phí: {ticket.repair_cost.toLocaleString('vi-VN')} đ
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => onPrintReceipt(ticket)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="In Phiếu Tiếp Nhận"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(ticket)}
                            className="text-[11px] text-[#F27D26] hover:text-[#d96c1d] font-bold"
                          >
                            Chi Tiết / Sửa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 font-mono font-bold">Mã Phiếu RMA</th>
                <th className="py-3.5 px-4">Thiết Bị & Serial</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Chi Nhánh Tiếp Nhận</th>
                <th className="py-3.5 px-4">Kỹ Thuật Viên</th>
                <th className="py-3.5 px-4">Tiến Trình</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70 text-slate-300">
              {filteredTickets.map((ticket) => {
                const stageObj = RMA_STAGES.find((s) => s.key === ticket.status);

                return (
                  <tr key={ticket.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#F27D26]">
                      {ticket.ticket_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{ticket.product_name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{ticket.serial_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{ticket.customer_name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{ticket.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{ticket.branch_name}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{ticket.technician_name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${stageObj?.badge}`}>
                        {stageObj?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPrintReceipt(ticket)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700"
                          title="In phiếu"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ticket)}
                          className="px-2.5 py-1 bg-[#F27D26]/20 hover:bg-[#F27D26]/30 text-[#F27D26] border border-[#F27D26]/40 text-xs font-bold rounded-lg transition"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit RMA Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#F27D26]" />
                {editingTicket ? `Cập Nhật Tiến Trình Sửa Chữa #${formData.ticket_code}` : 'Tiếp Nhận Sửa Chữa Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Ticket Basic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mã Phiếu RMA
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ticket_code}
                    onChange={(e) => setFormData({ ...formData, ticket_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold uppercase text-white focus:border-[#F27D26]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mã Serial / IMEI Thiết Bị <span className="text-[#F27D26]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono uppercase text-white focus:border-[#F27D26]"
                    placeholder="TA-JBL-..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:border-[#F27D26]"
                  >
                    <option value="low">Thấp (Low)</option>
                    <option value="normal">Bình thường (Normal)</option>
                    <option value="high">Ưu tiên cao (High)</option>
                    <option value="urgent">Gấp / Khách VIP (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* Status Workflow Selector */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <label className="block font-bold text-[#F27D26] uppercase tracking-wide text-[11px]">
                  Tiến Trình Xử Lý Kỹ Thuật (6 Bước Quy Chuẩn)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RMAStatus })}
                  className="w-full px-3 py-2.5 border border-slate-700 rounded-lg bg-slate-950 font-bold text-[#F27D26] text-sm focus:border-[#F27D26]"
                >
                  <option value="new">1. Mới tiếp nhận (Tiếp tân / Kỹ thuật ghi nhận)</option>
                  <option value="checking">2. Đang kiểm tra (Đo đạc điện áp, thẩm định lỗi)</option>
                  <option value="repairing">3. Đang sửa chữa (Thay linh kiện, căn chỉnh)</option>
                  <option value="completed">4. Hoàn tất (Đã test ổn định 24-48h, chờ khách lấy)</option>
                  <option value="returned">5. Đã trả khách (Khách đã nhận máy ký biên bản)</option>
                  <option value="rejected">6. Từ chối bảo hành (Rơi vỡ, vô nước, cạy phá tem)</option>
                </select>
              </div>

              {/* Customer & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Tên Khách Hàng <span className="text-[#F27D26]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
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
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:border-[#F27D26]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Chi Nhánh Tiếp Nhận <span className="text-[#F27D26]">*</span>
                  </label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fault & Accessories */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Mô Tả Hiện Tượng Lỗi <span className="text-[#F27D26]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.fault_description}
                  onChange={(e) => setFormData({ ...formData, fault_description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  placeholder="Mất tiếng, ù xì, cháy sò công suất, lỗi bluetooth..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Phụ Kiện Nhận Kèm
                  </label>
                  <input
                    type="text"
                    value={formData.accessories_included}
                    onChange={(e) => setFormData({ ...formData, accessories_included: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                    placeholder="Dây nguồn, điều khiển, thùng hộp..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Kỹ Thuật Viên Phụ Trách
                  </label>
                  <input
                    type="text"
                    value={formData.technician_name}
                    onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                  />
                </div>
              </div>

              {/* Technician Notes & Customer Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Ghi Chú Kỹ Thuật Nội Bộ (Chỉ nhân viên thấy)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.technician_notes}
                    onChange={(e) => setFormData({ ...formData, technician_notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-[11px] text-white focus:border-[#F27D26]"
                    placeholder="Đã thay cặp sò công suất 2SA1943, đo dòng phân cực ổn..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Thông Báo Cho Khách Hàng (Hiển thị khi tra cứu)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customer_notes}
                    onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-white focus:border-[#F27D26]"
                    placeholder="Đã sửa xong linh kiện, thiết bị đang được test âm thanh 24h..."
                  />
                </div>
              </div>

              {/* Costs & Parts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Linh Kiện Thay Thế (Ngăn cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.replaced_parts}
                    onChange={(e) => setFormData({ ...formData, replaced_parts: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#F27D26]"
                    placeholder="Tụ nguồn 10000uF, Sò 2SA1943, Chiết áp Echo"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Chi Phí Sửa Chữa (VNĐ - Nhập 0 nếu miễn phí BH)
                  </label>
                  <input
                    type="number"
                    value={formData.repair_cost}
                    onChange={(e) => setFormData({ ...formData, repair_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-[#F27D26]"
                  />
                </div>
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
                  {editingTicket ? 'Lưu Cập Nhật Tiến Trình' : 'Tạo Phiếu Tiếp Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
