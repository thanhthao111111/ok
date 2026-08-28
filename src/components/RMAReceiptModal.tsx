import React from 'react';
import { Printer, X, Wrench, ShieldCheck, QrCode } from 'lucide-react';
import { RMATicket } from '../types';

interface RMAReceiptModalProps {
  ticket: RMATicket | null;
  onClose: () => void;
}

export const RMAReceiptModal: React.FC<RMAReceiptModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 print:border-none print:shadow-none print:bg-white animate-in zoom-in-95 duration-150 relative">
        {/* Header Action Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#F27D26]" />
            <span className="font-bold text-white text-sm">
              Phiếu Tiếp Nhận Kỹ Thuật #{ticket.ticket_code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Biên Nhận Khách Hàng</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="border border-slate-700/80 print:border-slate-300 rounded-2xl p-6 sm:p-8 bg-slate-900/90 print:bg-white space-y-6 text-xs text-slate-300 print:text-slate-900 shadow-inner">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-700/80 print:border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-base font-black uppercase text-white print:text-slate-900">
                THÀNH AUDIO - TRUNG TÂM BẢO HÀNH & KỸ THUẬT
              </h2>
              <div className="text-[11px] text-slate-300 print:text-slate-600 mt-0.5">
                Chi nhánh tiếp nhận: <strong className="text-white print:text-slate-900">{ticket.branch_name}</strong>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-500">
                Hotline hỗ trợ kỹ thuật: 0901.234.567 | Website: thanhaudio.vn
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm font-black text-[#F27D26] bg-[#F27D26]/10 px-2.5 py-1 rounded-lg border border-[#F27D26]/30 inline-block">
                {ticket.ticket_code}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Ngày nhận: {new Date(ticket.intake_date).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          <div className="text-center py-1">
            <h1 className="text-lg font-black uppercase tracking-wider text-white print:text-slate-900">
              PHIẾU TIẾP NHẬN SỬA CHỮA & BẢO HÀNH
            </h1>
            <p className="text-[11px] text-slate-400 print:text-slate-500 italic">
              (Liên 1: Giao khách hàng khi nhận máy)
            </p>
          </div>

          {/* Customer & Device Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1E293B] print:bg-slate-50 p-3.5 rounded-xl border border-slate-700 print:border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-500 block font-mono">
                THÔNG TIN KHÁCH HÀNG
              </span>
              <div>
                Họ tên: <strong className="text-white print:text-slate-900">{ticket.customer_name}</strong>
              </div>
              <div>
                Số điện thoại: <strong className="text-white print:text-slate-900">{ticket.customer_phone}</strong>
              </div>
            </div>

            <div className="bg-[#1E293B] print:bg-slate-50 p-3.5 rounded-xl border border-slate-700 print:border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-500 block font-mono">
                THÔNG TIN THIẾT BỊ
              </span>
              <div>
                Sản phẩm: <strong className="text-white print:text-slate-900">{ticket.product_name}</strong>
              </div>
              <div className="font-mono">
                Số Serial: <strong className="text-[#F27D26]">{ticket.serial_number}</strong>
              </div>
              <div>
                Phụ kiện kèm: <strong className="text-white print:text-slate-900">{ticket.accessories_included || 'Không'}</strong>
              </div>
            </div>
          </div>

          {/* Fault & Cost */}
          <div className="border border-slate-700 print:border-slate-200 rounded-xl p-3.5 space-y-2 bg-[#1E293B] print:bg-white">
            <div>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-bold font-mono">
                HIỆN TƯỢNG HỎNG HÓC DO KHÁCH MÔ TẢ:
              </span>
              <p className="font-medium text-white print:text-slate-900 mt-0.5">{ticket.fault_description}</p>
            </div>

            {ticket.repair_cost > 0 && (
              <div className="pt-2 border-t border-slate-700 print:border-slate-200 flex justify-between font-bold">
                <span>Dự kiến chi phí sửa chữa / thay thế linh kiện:</span>
                <span className="text-emerald-400 print:text-emerald-700 font-mono text-sm">
                  {ticket.repair_cost.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs">
            <div>
              <div className="font-bold text-white print:text-slate-900">NGƯỜI GỬI MÁY</div>
              <div className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
              <div className="h-16" />
              <div className="font-semibold text-slate-200 print:text-slate-900">{ticket.customer_name}</div>
            </div>

            <div>
              <div className="font-bold text-white print:text-slate-900">ĐẠI DIỆN THÀNH AUDIO</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, đóng dấu tiếp nhận)</div>
              <div className="h-16" />
              <div className="font-semibold text-slate-200 print:text-slate-900">{ticket.receiving_staff}</div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-slate-700/80 print:border-slate-200 text-[10px] text-slate-400 leading-normal">
            * Quý khách vui lòng mang theo phiếu này khi đến nhận lại thiết bị. Trung tâm không chịu trách nhiệm về dữ liệu hoặc phụ kiện không ghi trong phiếu tiếp nhận.
          </div>
        </div>
      </div>
    </div>
  );
};
