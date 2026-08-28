import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Printer,
  QrCode,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Store,
  FileText,
  User,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Branch, RMATicket, WarrantyItem } from '../types';

interface FrontendLookupProps {
  warranties: WarrantyItem[];
  rmaTickets: RMATicket[];
  branches: Branch[];
  onViewCertificate: (warranty: WarrantyItem) => void;
  onOpenActivation: () => void;
}

export const FrontendLookup: React.FC<FrontendLookupProps> = ({
  warranties,
  rmaTickets,
  branches,
  onViewCertificate,
  onOpenActivation,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedResults, setMatchedResults] = useState<WarrantyItem[]>([]);

  // Mask PII function: 0901234567 -> 0901***567, name -> N*** V*** H***
  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 8) return phone;
    return `${clean.slice(0, 4)}***${clean.slice(-3)}`;
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [user, domain] = email.split('@');
    if (user.length <= 3) return `***@${domain}`;
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
  };

  const maskName = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts
      .map((p) => (p.length > 1 ? `${p[0]}***` : p))
      .join(' ');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return;

    setHasSearched(true);
    const results = warranties.filter((w) => {
      const serialMatch = w.serial_number.toLowerCase().includes(cleanQ);
      const phoneMatch = w.customer_phone.replace(/[^0-9]/g, '').includes(cleanQ.replace(/[^0-9]/g, ''));
      const emailMatch = w.customer_email && w.customer_email.toLowerCase().includes(cleanQ);
      const wcMatch = w.woocommerce_order_id && w.woocommerce_order_id.toLowerCase().includes(cleanQ);
      const skuMatch = w.sku.toLowerCase().includes(cleanQ);
      return serialMatch || phoneMatch || emailMatch || wcMatch || skuMatch;
    });

    setMatchedResults(results);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Shortcode Embed Notice */}
      <div className="flex items-center justify-between bg-[#1E293B] text-slate-300 px-4 py-2.5 rounded-2xl text-xs border border-slate-700/80 shadow-md">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[#F27D26] font-bold">SHORTCODE WORDPRESS:</span>
          <code className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-bold border border-slate-800">
            [warranty_lookup]
          </code>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Giao diện Tra cứu Khách hàng (Bảo mật PII & Điểm bán)
        </span>
      </div>

      {/* Main Search Hero Card */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 bg-[#F27D26]/20 text-[#F27D26] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#F27D26]/30 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Tra Cứu Thông Tin Bảo Hành Điện Tử
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nhập <strong className="text-white">Số điện thoại mua hàng</strong>, <strong className="text-white">Mã Serial / IMEI</strong>, <strong className="text-white">Email</strong> hoặc <strong className="text-white">Mã đơn hàng</strong> để kiểm tra thời hạn và lịch sử sửa chữa.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-customer-lookup"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VD: 0901234567 hoặc TA-JBL-2025-98214..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-white placeholder-slate-500 shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              id="btn-customer-search"
              type="submit"
              className="px-6 py-3 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Ngay</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Thử mẫu nhanh:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('0901234567');
                setTimeout(() => handleSearch(), 50);
              }}
              className="font-mono text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
            >
              0901234567 (SĐT)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('TA-JBL-2025-98214');
                setTimeout(() => handleSearch(), 50);
              }}
              className="font-mono text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
            >
              TA-JBL-2025-98214 (Serial)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('WC-6430');
                setTimeout(() => handleSearch(), 50);
              }}
              className="font-mono text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
            >
              WC-6430 (Đơn Hàng)
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          {matchedResults.length === 0 ? (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 p-8 text-center space-y-3 shadow-md">
              <AlertCircle className="w-10 h-10 text-[#F27D26] mx-auto" />
              <h3 className="font-bold text-white text-base">
                Không Tìm Thấy Thông Tin Bảo Hành
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Không có thiết bị nào khớp với từ khóa "<strong className="text-white">{query}</strong>". Vui lòng kiểm tra lại số Serial/SĐT hoặc tự kích hoạt bảo hành điện tử.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenActivation}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <span>Kích Hoạt Bảo Hành Điện Tử Mới</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            matchedResults.map((warranty) => {
              const relatedRMA = rmaTickets.filter((r) => r.serial_number === warranty.serial_number);
              const isExpiring = warranty.status === 'expiring_soon';
              const isExpired = warranty.status === 'expired';

              return (
                <div
                  key={warranty.id}
                  className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-lg overflow-hidden space-y-0"
                >
                  {/* Status Banner */}
                  <div
                    className={`px-6 py-3 text-white flex items-center justify-between ${
                      warranty.status === 'active'
                        ? 'bg-emerald-900 border-b border-emerald-700/50'
                        : isExpiring
                        ? 'bg-amber-900 border-b border-amber-700/50'
                        : 'bg-slate-900 border-b border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wide">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>
                        {warranty.status === 'active'
                          ? 'Sản phẩm đang trong thời hạn bảo hành chính hãng'
                          : isExpiring
                          ? 'Cảnh báo: Sản phẩm sắp hết hạn bảo hành'
                          : 'Sản phẩm đã hết thời hạn bảo hành tiêu chuẩn'}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewCertificate(warranty)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition border border-white/20"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">In Thẻ Bảo Hành</span>
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    {/* SECTION II REQUIREMENT: PROMINENT BRANCH HIGHLIGHT BOX */}
                    <div className="bg-slate-900/80 border border-[#F27D26]/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-[#F27D26] text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                          <Store className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 flex-1 text-xs sm:text-sm">
                          <div className="text-[10px] font-black uppercase text-[#F27D26] tracking-wider font-mono">
                            ĐIỂM MUA HÀNG & HỖ TRỢ TRỰC TIẾP TẬN NƠI (SECTION II)
                          </div>
                          <div className="text-white font-bold leading-relaxed text-sm sm:text-base">
                            Mua tại:{' '}
                            <span className="text-[#F27D26] font-black">
                              {warranty.branch_name}
                            </span>
                          </div>
                          <div className="text-slate-300 flex items-start gap-1.5 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>ĐC: {warranty.branch_address}</span>
                          </div>
                          <div className="text-white font-bold flex items-center gap-2 pt-1">
                            <Phone className="w-3.5 h-3.5 text-[#F27D26]" />
                            <span>
                              Hotline Bảo Hành Chi Nhánh:{' '}
                              <a
                                href={`tel:${warranty.branch_phone}`}
                                className="text-[#F27D26] underline font-mono text-sm"
                              >
                                {warranty.branch_phone}
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product & Warranty Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Left: Product Information */}
                      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/80">
                        <h4 className="font-bold text-white uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                          Thông Tin Thiết Bị Âm Thanh
                        </h4>
                        <div className="space-y-2 text-slate-300">
                          <div>
                            <span className="text-slate-400">Tên sản phẩm:</span>
                            <div className="font-bold text-white text-sm">
                              {warranty.product_name}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã Serial / IMEI:</span>
                            <span className="font-mono font-bold text-[#F27D26] text-sm">
                              {warranty.serial_number}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã SKU:</span>
                            <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/40">
                              {warranty.sku}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Danh mục:</span>
                            <span className="font-semibold text-slate-200">
                              {warranty.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Số hóa đơn:</span>
                            <span className="font-mono text-slate-300">
                              {warranty.invoice_number || 'HD-ChínhHãng'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dates & Customer PII (Masked for privacy) */}
                      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/80">
                        <h4 className="font-bold text-white uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          Thời Hạn & Bảo Mật Khách Hàng (PII Masking)
                        </h4>
                        <div className="space-y-2 text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ngày mua kích hoạt:</span>
                            <span className="font-mono font-bold text-slate-200">
                              {warranty.purchase_date}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Thời hạn bảo hành:</span>
                            <span className="font-bold text-emerald-400">
                              {warranty.warranty_months} Tháng Chính Hãng
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ngày hết hạn bảo hành:</span>
                            <span className="font-mono font-black text-white text-sm">
                              {warranty.expiry_date}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-700/80 flex justify-between">
                            <span className="text-slate-400">Chủ sở hữu (Mã hóa):</span>
                            <span className="font-bold text-slate-200 font-mono">
                              {maskName(warranty.customer_name)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Số điện thoại (Bảo mật):</span>
                            <span className="font-mono font-bold text-white">
                              {maskPhone(warranty.customer_phone)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nhân viên phụ trách:</span>
                            <span className="font-semibold text-slate-300">
                              {warranty.seller_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RMA Repair History Section if available */}
                    {relatedRMA.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-[#F27D26]" />
                          Lịch Sử Bảo Hành & Sửa Chữa Tại Chi Nhánh ({relatedRMA.length} Phiếu RMA)
                        </h4>
                        <div className="space-y-2">
                          {relatedRMA.map((rma) => (
                            <div
                              key={rma.id}
                              className="bg-slate-900/80 border border-slate-700 rounded-xl p-3.5 text-xs space-y-1.5 text-slate-300"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-[#F27D26]">
                                  Phiếu #{rma.ticket_code} (Tiếp nhận: {new Date(rma.intake_date).toLocaleDateString('vi-VN')})
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 uppercase border border-slate-700">
                                  {rma.status}
                                </span>
                              </div>
                              <div className="text-slate-300">
                                <strong className="text-white">Hiện tượng lỗi:</strong> {rma.fault_description}
                              </div>
                              {rma.customer_notes && (
                                <div className="text-amber-300 bg-slate-950 p-2 rounded-lg border border-amber-600/30 font-medium">
                                  <strong className="text-white">Cập nhật từ Kỹ thuật viên:</strong> {rma.customer_notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
