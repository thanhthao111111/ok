import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Layers,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationCenterProps {
  notifications: NotificationLog[];
  onSendCustomNotification: (log: Omit<NotificationLog, 'id' | 'timestamp'>) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onSendCustomNotification,
}) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'zalo' | 'sms' | 'email'>('all');
  const [showSendModal, setShowSendModal] = useState(false);

  const [formType, setFormType] = useState<'zalo_zns' | 'sms' | 'email'>('zalo_zns');
  const [formRecipient, setFormRecipient] = useState('0901234567');
  const [formTitle, setFormTitle] = useState('Thông Báo Thành Audio');
  const [formContent, setFormContent] = useState(
    'Cảm ơn Quý khách đã mua sản phẩm tại Thành Audio. Phiếu bảo hành của bạn đã được kích hoạt thành công.'
  );

  const filteredLogs = notifications.filter((n) => {
    if (activeChannel === 'all') return true;
    if (activeChannel === 'zalo') return n.type === 'zalo_zns';
    if (activeChannel === 'sms') return n.type === 'sms';
    if (activeChannel === 'email') return n.type === 'email';
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendCustomNotification({
      type: formType,
      recipient: formRecipient,
      template: 'CUSTOM_TEMPLATE_DISPATCH',
      trigger: 'activation_success',
      title: formTitle,
      content: formContent,
      status: 'delivered',
    });
    setShowSendModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                PHẦN IV: CỔNG THÔNG BÁO TỰ ĐỘNG
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Zalo ZNS / SMS Brandname / Email
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#F27D26]" />
              Cổng Thông Báo Tự Động (Notifications Gateway)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Tích hợp gửi tin nhắn tự động khi: <strong>1. Kích hoạt bảo hành thành công</strong>, <strong>2. Sản phẩm sắp hết hạn (30/15/7 ngày)</strong>, và <strong>3. Trạng thái sửa chữa RMA thay đổi</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Tin Nhắn Thử Nghiệm</span>
          </button>
        </div>
      </div>

      {/* 3 Automated Templates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mẫu 1: Kích Hoạt Thành Công</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Gửi qua Zalo ZNS hoặc SMS Brandname ngay sau khi khách hàng tự đăng ký hoặc đơn WooCommerce chuyển Completed.
          </p>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 font-mono text-[10px] text-slate-300">
            [THANHAUDIO] Kích hoạt bảo hành thành công thiết bị {'{product_name}'} (SN: {'{serial}'}) đến ngày {'{expiry_date}'}.
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md space-y-2.5">
          <div className="flex items-center gap-2 text-[#F27D26] font-bold">
            <Clock className="w-4 h-4" />
            <span>Mẫu 2: Nhắc Sắp Hết Hạn (30/15 Ngày)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Cronjob tự động quét hàng ngày và gửi nhắc nhở bảo dưỡng âm thanh định kỳ.
          </p>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 font-mono text-[10px] text-slate-300">
            [THANHAUDIO] Thiết bị {'{product_name}'} của bạn còn {'{days}'} ngày là hết hạn bảo hành. Liên hệ Showroom {'{branch_name}'} để bảo dưỡng.
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md space-y-2.5">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Mẫu 3: Cập Nhật Tiến Trình RMA</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Gửi tức thì mỗi khi kỹ thuật viên chuyển trạng thái phiếu RMA (Đang sửa ➔ Hoàn tất ➔ Trả máy).
          </p>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 font-mono text-[10px] text-slate-300">
            [THANHAUDIO] Phiếu tiếp nhận #{'{rma_code}'} đã được xử lý xong. Mời Quý khách đến chi nhánh nhận máy.
          </div>
        </div>
      </div>

      {/* Dispatched Logs Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md overflow-hidden text-xs">
        <div className="p-4 bg-slate-900/60 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-white">
            Nhật Ký Thông Báo Đã Gửi ({notifications.length} Tin)
          </h3>

          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveChannel('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeChannel === 'all' ? 'bg-[#F27D26] text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveChannel('zalo')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeChannel === 'zalo' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Zalo ZNS
            </button>
            <button
              onClick={() => setActiveChannel('sms')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeChannel === 'sms' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              SMS Brandname
            </button>
            <button
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeChannel === 'email' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Email
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Kênh</th>
                <th className="py-3 px-4">Người Nhận</th>
                <th className="py-3 px-4">Tiêu Đề / Nội Dung</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4">
                    {log.type === 'zalo_zns' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                        Zalo ZNS
                      </span>
                    ) : log.type === 'sms' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                        SMS Brand
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        Email
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {log.recipient}
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-white">{log.title}</div>
                    <div className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">
                      {log.content}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã gửi thành công
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Custom Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-[#F27D26]" />
                Gửi Tin Nhắn Thông Báo Thử Nghiệm
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSend} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Cổng Gửi (Gateway)
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-[#F27D26]"
                  >
                    <option value="zalo_zns">Zalo ZNS (Official Account)</option>
                    <option value="sms">SMS Brandname (THANHAUDIO)</option>
                    <option value="email">Email Quản Trị / SMTP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Người Nhận (SĐT / Email)
                  </label>
                  <input
                    type="text"
                    required
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white focus:ring-2 focus:ring-[#F27D26]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Tiêu Đề Tin Nhắn
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-[#F27D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Nội Dung Chi Tiết
                </label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-[#F27D26]"
                />
              </div>

              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white rounded-xl font-bold shadow transition"
                >
                  Phát Lệnh Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
