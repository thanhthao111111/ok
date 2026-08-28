import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  QrCode,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { WarrantyItem } from '../types';

interface WarrantyCertificateModalProps {
  warranty: WarrantyItem | null;
  onClose: () => void;
}

export const WarrantyCertificateModal: React.FC<WarrantyCertificateModalProps> = ({
  warranty,
  onClose,
}) => {
  if (!warranty) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 print:border-none print:shadow-none print:bg-white animate-in zoom-in-95 duration-150 relative">
        {/* Header Action Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F27D26]" />
            <span className="font-bold text-white text-sm">
              Thẻ Bảo Hành Điện Tử Chính Hãng (E-Warranty Card)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Thẻ / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CARD CONTENT */}
        <div className="border-2 border-[#F27D26]/60 rounded-2xl p-6 sm:p-8 bg-slate-900/90 print:bg-white print:border-amber-400 print:text-slate-900 relative overflow-hidden space-y-6 shadow-inner">
          {/* Watermark Security Seal */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-[#F27D26]" />
          </div>

          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-700/80 print:border-amber-300 pb-4 gap-4">
            <div>
              <div className="text-xl font-black tracking-tight text-white print:text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F27D26] text-white print:bg-amber-500 print:text-slate-950 rounded-lg font-black text-sm">
                  THÀNH AUDIO
                </span>
                <span>WARRANTY PRO</span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-500 font-semibold mt-0.5">
                HỆ THỐNG ÂM THANH CHUYÊN NGHIỆP & BẢO HÀNH CHÍNH HÃNG
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-emerald-900 border border-emerald-500/40 text-emerald-300 print:bg-emerald-700 print:text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs">
                CHỨNG NHẬN CHÍNH HÃNG
              </div>
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-500 mt-1">
                Tra cứu: thanhaudio.vn
              </div>
            </div>
          </div>

          {/* Device & Serial Big Badge */}
          <div className="bg-[#1E293B] text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md border border-slate-700 print:bg-slate-900">
            <div className="space-y-1">
              <span className="text-[10px] text-[#F27D26] uppercase font-mono font-black tracking-wider">
                MÃ SERIAL / IMEI ĐỊNH DANH
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider">
                {warranty.serial_number}
              </div>
              <div className="text-xs text-slate-300 font-medium">{warranty.product_name}</div>
            </div>

            {/* QR Code Placeholder */}
            <div className="p-2 bg-white rounded-lg text-slate-900 text-center shrink-0 w-24">
              <QrCode className="w-20 h-20 mx-auto" />
              <span className="text-[8px] font-mono font-bold block mt-0.5">QUÉT XÁC THỰC</span>
            </div>
          </div>

          {/* Key Warranty Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#1E293B] print:bg-white p-3 rounded-xl border border-slate-700 print:border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Mã SKU</span>
              <span className="font-mono font-bold text-white print:text-slate-900 text-xs">{warranty.sku}</span>
            </div>

            <div className="bg-[#1E293B] print:bg-white p-3 rounded-xl border border-slate-700 print:border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Ngày Kích Hoạt</span>
              <span className="font-mono font-bold text-white print:text-slate-900 text-xs">{warranty.purchase_date}</span>
            </div>

            <div className="bg-[#1E293B] print:bg-white p-3 rounded-xl border border-slate-700 print:border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Thời Hạn</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700 text-xs">{warranty.warranty_months} Tháng</span>
            </div>

            <div className="bg-[#1E293B] print:bg-white p-3 rounded-xl border border-slate-700 print:border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Hạn Đến Ngày</span>
              <span className="font-mono font-black text-rose-400 print:text-red-600 text-xs">{warranty.expiry_date}</span>
            </div>
          </div>

          {/* Section II Branch & Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#1E293B] print:bg-amber-50 p-3.5 rounded-xl border border-slate-700 print:border-amber-300 space-y-1">
              <span className="text-[10px] font-black uppercase text-[#F27D26] print:text-amber-900 tracking-wide block font-mono">
                ĐIỂM BÁN HÀNG & BẢO HÀNH TRỰC TIẾP
              </span>
              <div className="font-bold text-white print:text-slate-900">{warranty.branch_name}</div>
              <div className="text-[11px] text-slate-300 print:text-slate-700">{warranty.branch_address}</div>
              <div className="text-[11px] font-bold text-[#F27D26] print:text-amber-900 pt-0.5">
                Hotline: {warranty.branch_phone}
              </div>
            </div>

            <div className="bg-[#1E293B] print:bg-slate-50 p-3.5 rounded-xl border border-slate-700 print:border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-500 tracking-wide block font-mono">
                THÔNG TIN KHÁCH HÀNG
              </span>
              <div className="font-bold text-white print:text-slate-900">{warranty.customer_name}</div>
              <div className="font-mono text-slate-300 print:text-slate-700">{warranty.customer_phone}</div>
              <div className="text-[11px] text-slate-400 print:text-slate-500">
                Nhân viên bán: {warranty.seller_name}
              </div>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="pt-2 border-t border-slate-700/80 print:border-slate-200 text-[10px] text-slate-400 print:text-slate-500 space-y-0.5 leading-relaxed">
            <p>• Bảo hành miễn phí các lỗi kỹ thuật phần cứng do nhà sản xuất trong thời hạn bảo hành.</p>
            <p>• Từ chối bảo hành đối với các trường hợp: Rơi vỡ, vô nước, thiên tai chập cháy, rách tem niêm phong hoặc tự ý sửa chữa tại nơi khác.</p>
            <p>• Quý khách vui lòng lưu giữ mã Serial hoặc xuất trình số điện thoại khi bảo hành tại hệ thống Thành Audio trên toàn quốc.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
