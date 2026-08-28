import React, { useState } from 'react';
import {
  Zap,
  Upload,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Printer,
  Sparkles,
  FileImage,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Branch, WarrantyItem } from '../types';

interface FrontendActivationProps {
  branches: Branch[];
  onActivateWarranty: (item: Omit<WarrantyItem, 'id' | 'created_at'>) => void;
  onViewCertificate: (item: WarrantyItem) => void;
  onOpenLookup: () => void;
}

export const FrontendActivation: React.FC<FrontendActivationProps> = ({
  branches,
  onActivateWarranty,
  onViewCertificate,
  onOpenLookup,
}) => {
  const [formData, setFormData] = useState({
    serial_number: '',
    sku: 'JBL-PASION-10',
    product_name: 'Loa Karaoke JBL Pasion 10',
    category: 'Loa Karaoke',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_months: 24,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    branch_id: branches[0]?.id || 1,
    invoice_number: '',
    invoice_image: '',
  });

  const [invoiceFileName, setInvoiceFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatedItem, setActivatedItem] = useState<WarrantyItem | null>(null);

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          invoice_image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serial_number.trim() || !formData.customer_phone.trim() || !formData.customer_name.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setIsSubmitting(true);

    const selectedBranch = branches.find((b) => b.id === Number(formData.branch_id)) || branches[0];
    const d = new Date(formData.purchase_date);
    d.setMonth(d.getMonth() + Number(formData.warranty_months));
    const expiryDate = d.toISOString().split('T')[0];

    const newItem: Omit<WarrantyItem, 'id' | 'created_at'> = {
      serial_number: formData.serial_number.trim().toUpperCase(),
      sku: formData.sku,
      product_name: formData.product_name,
      category: formData.category,
      purchase_date: formData.purchase_date,
      warranty_months: formData.warranty_months,
      expiry_date: expiryDate,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      customer_address: formData.customer_address,
      branch_id: selectedBranch.id,
      branch_name: selectedBranch.name,
      branch_phone: selectedBranch.phone,
      branch_address: selectedBranch.address,
      seller_name: 'Kích hoạt Online Khách hàng',
      seller_role: 'Sale Staff',
      status: 'active',
      invoice_number: formData.invoice_number || `E-ACT-${Date.now().toString().slice(-4)}`,
      invoice_image: formData.invoice_image,
      notes: 'Khách hàng tự đăng ký bảo hành điện tử qua trang web',
      rma_count: 0,
    };

    onActivateWarranty(newItem);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    const completeItem: WarrantyItem = {
      ...newItem,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };

    setActivatedItem(completeItem);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Shortcode Embed Notice */}
      <div className="flex items-center justify-between bg-[#1E293B] text-slate-300 px-4 py-2.5 rounded-2xl text-xs border border-slate-700/80 shadow-md">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[#F27D26] font-bold">SHORTCODE WORDPRESS:</span>
          <code className="bg-slate-900 text-[#F27D26] px-2 py-0.5 rounded font-bold border border-slate-800">
            [warranty_activation]
          </code>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Form Tự Đăng Ký Bảo Hành Điện Tử Khách Hàng
        </span>
      </div>

      {activatedItem ? (
        /* Success Card */
        <div className="bg-[#1E293B] rounded-2xl border-2 border-emerald-500/80 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              Kích Hoạt Bảo Hành Điện Tử Thành Công!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Chúc mừng Quý khách <strong className="text-white">{activatedItem.customer_name}</strong>. Thiết bị âm thanh của bạn đã được ghi nhận trên hệ thống bảo hành chính hãng của Thành Audio.
            </p>
          </div>

          {/* Details Pill Box */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 text-xs text-left max-w-md mx-auto space-y-2 font-sans text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã Serial / IMEI:</span>
              <span className="font-mono font-bold text-[#F27D26]">
                {activatedItem.serial_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sản phẩm:</span>
              <span className="font-bold text-white">{activatedItem.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hạn bảo hành đến:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {activatedItem.expiry_date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chi nhánh bảo hành:</span>
              <span className="font-semibold text-slate-200 text-right">
                {activatedItem.branch_name}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewCertificate(activatedItem)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Xem / In Thẻ Bảo Hành Điện Tử</span>
            </button>
            <button
              onClick={onOpenLookup}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition"
            >
              <span>Về Trang Tra Cứu</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Đăng Ký & Kích Hoạt Bảo Hành Điện Tử
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Điền thông tin và tải lên ảnh hóa đơn / phiếu mua hàng để nhận chứng nhận bảo hành chính hãng từ Thành Audio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Step 1: Device Information */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                1. Thông Tin Thiết Bị Mua Hàng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mã Serial / IMEI (In trên thân máy hoặc vỏ hộp){' '}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData({ ...formData, serial_number: e.target.value.toUpperCase() })
                    }
                    placeholder="VD: TA-JBL-2026-98214"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono uppercase font-bold text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mẫu Sản Phẩm (SKU) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.sku}
                    onChange={(e) => {
                      const sku = e.target.value;
                      let productName = 'Loa Karaoke JBL Pasion 10';
                      let months = 24;
                      if (sku === 'CROWN-XLI-2500') {
                        productName = 'Cục đẩy công suất Crown XLi 2500';
                        months = 12;
                      } else if (sku === 'SHURE-UGX23-PLUS') {
                        productName = 'Micro Không Dây Shure UGX23 Plus';
                        months = 12;
                      } else if (sku === 'VANG-SO-X6-PRO') {
                        productName = 'Vang số Tripath X6 Pro';
                        months = 24;
                      } else if (sku === 'BOSE-1200-SUB') {
                        productName = 'Loa Sub Điện Bose 1200';
                        months = 18;
                      }
                      setFormData({
                        ...formData,
                        sku,
                        product_name: productName,
                        warranty_months: months,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  >
                    <option value="JBL-PASION-10">Loa Karaoke JBL Pasion 10 (BH 24 Tháng)</option>
                    <option value="CROWN-XLI-2500">Cục đẩy công suất Crown XLi 2500 (BH 12 Tháng)</option>
                    <option value="SHURE-UGX23-PLUS">Micro Không Dây Shure UGX23 Plus (BH 12 Tháng)</option>
                    <option value="VANG-SO-X6-PRO">Vang số cao cấp Tripath X6 Pro (BH 24 Tháng)</option>
                    <option value="BOSE-1200-SUB">Loa Sub Điện Bose 1200 (BH 18 Tháng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Ngày Mua Hàng <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Chi Nhánh / Điểm Bán Hàng <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) =>
                      setFormData({ ...formData, branch_id: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Contact */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                2. Thông Tin Khách Hàng Đăng Ký
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Họ và Tên Khách Hàng <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Số Điện Thoại Nhận Thông Báo Zalo/SMS <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Email Nhận Giấy Chứng Nhận
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="khachhang@gmail.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Địa Chỉ Lắp Đặt / Sử Dụng
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="Số nhà, Quận/Huyện, Tỉnh/TP"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Invoice Upload */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-400" />
                3. Tải Lên Hóa Đơn / Phiếu Xuất Kho (Tùy chọn)
              </h3>

              <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-[#F27D26] transition bg-slate-900">
                <input
                  type="file"
                  id="invoice-upload"
                  accept="image/*,.pdf"
                  onChange={handleInvoiceUpload}
                  className="hidden"
                />
                <label
                  htmlFor="invoice-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                >
                  <FileImage className="w-8 h-8 text-slate-500" />
                  <span className="font-bold text-[#F27D26]">
                    {invoiceFileName ? `Đã chọn: ${invoiceFileName}` : 'Bấm để tải lên ảnh hóa đơn'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Hỗ trợ JPG, PNG, WEBP, PDF (Tối đa 5MB)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Hoàn Tất & Kích Hoạt Bảo Hành Điện Tử</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
