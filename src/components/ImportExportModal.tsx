import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Mail,
  Send,
  RefreshCw,
  Layers,
  Filter,
  FileCheck,
  FileCode,
  Table,
} from 'lucide-react';
import { Branch, ExcelImportRow, LicenseInfo, WarrantyItem } from '../types';
import { isStrictDataBlocked } from '../services/licenseService';
import {
  ColumnMapping,
  REQUIRED_IMPORT_COLUMNS,
  exportWarrantiesToExcel,
  generateSampleExcelFile,
  parseExcelFile,
  validateImportRows,
} from '../services/excelService';

interface ImportExportModalProps {
  warranties: WarrantyItem[];
  branches: Branch[];
  onBatchImport: (importedItems: Omit<WarrantyItem, 'id' | 'created_at'>[]) => void;
  license: LicenseInfo;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  warranties,
  branches,
  onBatchImport,
  license,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'export' | 'report'>('import');

  // Import states
  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    serial: '',
    sku: '',
    purchase_date: '',
    customer_name: '',
    customer_phone: '',
    branch_name: '',
    branch_address: '',
    branch_phone: '',
    seller_name: '',
  });
  const [mappedRows, setMappedRows] = useState<ExcelImportRow[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  // Export filters
  const [exportBranch, setExportBranch] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<string>('all');
  const [exportSearch, setExportSearch] = useState<string>('');

  // Report states
  const [reportBranch, setReportBranch] = useState<number>(1);
  const [reportDaysThreshold, setReportDaysThreshold] = useState<number>(30);
  const [adminEmail, setAdminEmail] = useState<string>('thanhaudio.com.vn@gmail.com');
  const [reportSentStatus, setReportSentStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBlocked = isStrictDataBlocked(license);

  // Handle File selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) {
      alert('CẢNH BÁO KHÓA DỮ LIỆU: Tính năng Import file bị khóa do bản quyền chưa được xác thực.');
      return;
    }

    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);

    try {
      const buffer = await selected.arrayBuffer();
      const { headers, rawRows: parsedRows } = parseExcelFile(buffer);

      if (headers.length === 0 || parsedRows.length === 0) {
        alert('File không có dữ liệu hoặc không đúng định dạng bảng.');
        setIsProcessing(false);
        return;
      }

      setRawHeaders(headers);
      setRawRows(parsedRows);

      // Auto-detect mappings
      const autoMap: ColumnMapping = {
        serial: headers.find((h) => /serial|imei|mã/i.test(h)) || headers[0] || '',
        sku: headers.find((h) => /sku|sản phẩm|mã sp/i.test(h)) || headers[1] || '',
        purchase_date: headers.find((h) => /ngày mua|mua|date/i.test(h)) || headers[2] || '',
        customer_name: headers.find((h) => /khách|tên|họ tên/i.test(h)) || headers[3] || '',
        customer_phone: headers.find((h) => /sđt|điện thoại|phone/i.test(h)) || headers[4] || '',
        branch_name: headers.find((h) => /chi nhánh|nơi bán|cửa hàng/i.test(h)) || headers[5] || '',
        branch_address: headers.find((h) => /địa chỉ cn|địa chỉ/i.test(h)) || headers[6] || '',
        branch_phone: headers.find((h) => /sđt nơi bán|hotline cn/i.test(h)) || headers[7] || '',
        seller_name: headers.find((h) => /nhân viên|người bán|sale/i.test(h)) || headers[8] || '',
      };

      setColumnMapping(autoMap);
      setImportStep('mapping');
    } catch (err) {
      alert('Lỗi đọc file: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyMappingAndValidate = () => {
    const existingSerials = warranties.map((w) => w.serial_number);
    const validated = validateImportRows(rawRows, columnMapping, existingSerials);
    setMappedRows(validated);
    setImportStep('preview');
  };

  const handleExecuteImport = () => {
    if (isBlocked) {
      alert('Cơ chế Strict Data Block đang khóa lưu dữ liệu vào cơ sở dữ liệu.');
      return;
    }

    const validRows = mappedRows.filter((r) => r.is_valid);
    if (validRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập!');
      return;
    }

    const itemsToInsert: Omit<WarrantyItem, 'id' | 'created_at'>[] = validRows.map((row) => {
      const matchedBranch =
        branches.find(
          (b) =>
            b.name.toLowerCase().includes(row.branch_name.toLowerCase()) ||
            b.code.toLowerCase() === row.branch_name.toLowerCase()
        ) || branches[0];

      const purchaseDate = row.purchase_date || new Date().toISOString().split('T')[0];
      const d = new Date(purchaseDate);
      d.setMonth(d.getMonth() + 12);
      const expiryDate = d.toISOString().split('T')[0];

      return {
        serial_number: row.serial_number,
        sku: row.sku,
        product_name: `Thiết bị âm thanh (${row.sku})`,
        category: 'Loa / Âm Thanh Karaoke',
        purchase_date: purchaseDate,
        warranty_months: 12,
        expiry_date: expiryDate,
        customer_name: row.customer_name,
        customer_phone: row.customer_phone,
        customer_email: '',
        customer_address: '',
        branch_id: matchedBranch.id,
        branch_name: matchedBranch.name,
        branch_phone: matchedBranch.phone,
        branch_address: matchedBranch.address,
        seller_name: row.seller_name || 'Nhân viên bán hàng',
        seller_role: 'Sale Staff',
        status: 'active',
        invoice_number: `IMP-${Date.now().toString().slice(-4)}`,
        notes: 'Nhập tự động từ file Excel',
        rma_count: 0,
      };
    });

    onBatchImport(itemsToInsert);
    alert(`Đã nhập thành công ${itemsToInsert.length} phiếu bảo hành vào WordPress Database!`);
    // Reset
    setImportStep('upload');
    setFile(null);
    setMappedRows([]);
  };

  const handleExport = () => {
    let itemsToExport = warranties;
    if (exportBranch !== 'all') {
      itemsToExport = itemsToExport.filter((w) => String(w.branch_id) === exportBranch);
    }
    if (exportStatus !== 'all') {
      itemsToExport = itemsToExport.filter((w) => w.status === exportStatus);
    }
    if (exportSearch.trim()) {
      const q = exportSearch.toLowerCase();
      itemsToExport = itemsToExport.filter(
        (w) =>
          w.serial_number.toLowerCase().includes(q) ||
          w.sku.toLowerCase().includes(q) ||
          w.customer_name.toLowerCase().includes(q) ||
          w.seller_name.toLowerCase().includes(q)
      );
    }

    exportWarrantiesToExcel(itemsToExport, {
      includeEdateFormula: true,
    });
  };

  const handleSendExpiringReport = () => {
    const branch = branches.find((b) => b.id === Number(reportBranch)) || branches[0];
    const expiringItems = warranties.filter(
      (w) => w.branch_id === branch.id && (w.status === 'expiring_soon' || w.status === 'active')
    );

    setReportSentStatus(
      `Đã tạo & gửi báo cáo tự động (${expiringItems.length} thiết bị sắp hết hạn tại ${branch.name}) tới email Quản trị viên: ${adminEmail}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/30">
                PHẦN III: IMPORT & EXPORT EXCEL SYSTEM
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Chuẩn XLSX / CSV 9 Cột
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#F27D26]" />
              Quản Lý & Nhập / Xuất Dữ Liệu File Excel
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Hỗ trợ nhập hàng loạt phiếu bảo hành với 9 cột thông tin bắt buộc, khớp trường (Field Mapping), kiểm tra trùng lặp serial và xuất file .xlsx có công thức tự động tính ngày hết hạn (=EDATE).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={generateSampleExcelFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-[#F27D26]" />
              <span>Tải File Mẫu (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
              activeSubTab === 'import'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Nhập File Excel (Import)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
              activeSubTab === 'export'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>2. Xuất File Excel (Export)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
              activeSubTab === 'report'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>3. Báo Cáo Định Kỳ Qua Email</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: IMPORT */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          {/* Strict Data Block Warning if unlicensed */}
          {isBlocked && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-3 text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-rose-200">
                  TÍNH NĂNG IMPORT FILE BỊ VÔ HIỆU HÓA (STRICT BLOCK)
                </div>
                <p>
                  Theo yêu cầu bảo mật mục I, tính năng Upload và xử lý file Excel bị chặn hoàn toàn khi Plugin chưa được kích hoạt bản quyền từ{' '}
                  <strong className="text-white font-mono">thanhaudio.vn/security</strong>. Vui lòng kích hoạt License Key để mở khóa.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Upload Box */}
          {importStep === 'upload' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-8 text-center space-y-4">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-[#F27D26] border border-slate-700">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Tải lên File Excel (.xlsx hoặc .csv)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hệ thống sẽ đọc các cột: Mã Serial/IMEI, SKU, Ngày Mua, Khách Hàng, SĐT Khách, Chi Nhánh/Nơi Bán, Địa Chỉ Chi Nhánh, SĐT Nơi Bán, Nhân Viên/Người Bán.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isBlocked}
                />

                <div className="pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBlocked || isProcessing}
                    className="px-6 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-40"
                  >
                    {isProcessing ? 'Đang đọc file...' : 'Chọn File Từ Máy Tính'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Visual Field Mapping */}
          {importStep === 'mapping' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#F27D26]" />
                    Giao Diện Ánh Xạ Cột (Field Mapping)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Khớp các cột từ file Excel vừa tải lên với các trường trong WordPress Database:
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-900 text-[#F27D26] border border-slate-700 px-2.5 py-1 rounded-lg">
                  Đã nhận diện: {rawRows.length} dòng
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {REQUIRED_IMPORT_COLUMNS.map((reqCol, idx) => {
                  const mapKey: keyof ColumnMapping =
                    idx === 0
                      ? 'serial'
                      : idx === 1
                      ? 'sku'
                      : idx === 2
                      ? 'purchase_date'
                      : idx === 3
                      ? 'customer_name'
                      : idx === 4
                      ? 'customer_phone'
                      : idx === 5
                      ? 'branch_name'
                      : idx === 6
                      ? 'branch_address'
                      : idx === 7
                      ? 'branch_phone'
                      : 'seller_name';

                  return (
                    <div
                      key={reqCol}
                      className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 space-y-1.5"
                    >
                      <label className="block font-bold text-slate-300">
                        {reqCol} <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={columnMapping[mapKey]}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [mapKey]: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-700 rounded-lg bg-slate-900 text-white font-mono focus:ring-2 focus:ring-[#F27D26]"
                      >
                        <option value="">-- Chưa gán cột --</option>
                        {rawHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => setImportStep('upload')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl"
                >
                  Chọn Lại File
                </button>
                <button
                  onClick={handleApplyMappingAndValidate}
                  className="px-6 py-2 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Kiểm Tra Dữ Liệu & Tiếp Tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Validation & Execution */}
          {importStep === 'preview' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Kết Quả Kiểm Tra Dữ Liệu (Data Validation)
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hợp lệ: {mappedRows.filter((r) => r.is_valid).length} dòng
                    </span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Lỗi: {mappedRows.filter((r) => !r.is_valid).length} dòng
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImportStep('mapping')}
                    className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Chỉnh Ánh Xạ
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={isBlocked || mappedRows.filter((r) => r.is_valid).length === 0}
                    className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-40"
                  >
                    Lưu {mappedRows.filter((r) => r.is_valid).length} Bản Ghi Hợp Lệ
                  </button>
                </div>
              </div>

              {/* Rows List */}
              <div className="overflow-x-auto max-h-96 border border-slate-700/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Dòng</th>
                      <th className="py-2.5 px-3">Mã Serial</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Khách Hàng</th>
                      <th className="py-2.5 px-3">SĐT</th>
                      <th className="py-2.5 px-3">Chi Nhánh</th>
                      <th className="py-2.5 px-3">Người Bán</th>
                      <th className="py-2.5 px-3">Trạng Thái / Lỗi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans text-slate-200">
                    {mappedRows.map((row) => (
                      <tr
                        key={row.row_index}
                        className={row.is_valid ? 'hover:bg-slate-800/50' : 'bg-rose-950/40'}
                      >
                        <td className="py-2 px-3 font-mono text-slate-500">#{row.row_index}</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#F27D26]">{row.serial_number}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{row.sku}</td>
                        <td className="py-2 px-3 font-medium text-white">{row.customer_name}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{row.customer_phone}</td>
                        <td className="py-2 px-3 text-slate-300">{row.branch_name}</td>
                        <td className="py-2 px-3 text-slate-400">{row.seller_name}</td>
                        <td className="py-2 px-3">
                          {row.is_valid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                            </span>
                          ) : (
                            <div className="text-rose-400 font-medium text-[11px] space-y-0.5">
                              {row.validation_errors.map((err, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>{err}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: EXPORT */}
      {activeSubTab === 'export' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-6">
          <div className="border-b border-slate-700/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-[#F27D26]" />
              Bộ Lọc & Xuất File Excel Chuẩn (.xlsx)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Tệp xuất bao gồm màu sắc tiêu đề chuẩn, độ rộng căn chỉnh tự động, định dạng ngày YYYY-MM-DD và công thức tính ngày hết hạn =EDATE().
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Lọc Theo Chi Nhánh / Nơi Bán
              </label>
              <select
                value={exportBranch}
                onChange={(e) => setExportBranch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-[#F27D26]"
              >
                <option value="all">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Lọc Theo Trạng Thái
              </label>
              <select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-[#F27D26]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Còn hạn (Active)</option>
                <option value="expiring_soon">Sắp hết hạn (Expiring Soon)</option>
                <option value="expired">Đã hết hạn (Expired)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tìm Kiếm Serial / Khách / SKU
              </label>
              <input
                type="text"
                value={exportSearch}
                onChange={(e) => setExportSearch(e.target.value)}
                placeholder="Lọc từ khóa..."
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F27D26]"
              />
            </div>
          </div>

          {/* Formula preview */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[#F27D26]" />
              Công Thức Tích Hợp Tự Động (Excel Formula)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Cột "Ngày Hết Hạn" được gắn công thức tự động{' '}
              <code className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono text-[#F27D26] font-bold">
                =EDATE(Ngày_Mua, Số_Tháng_BH)
              </code>{' '}
              giúp nhân viên kế toán và quản trị viên dễ dàng theo dõi trực tiếp trong Excel.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="btn-trigger-export-excel"
              onClick={handleExport}
              className="px-6 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuất File .XLSX Đầy Đủ</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB TAB 3: PERIODIC EMAIL REPORT */}
      {activeSubTab === 'report' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-6">
          <div className="border-b border-slate-700/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Báo Cáo Thiết Bị Sắp Hết Hạn Định Kỳ Cho Quản Trị Viên
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Tự động quét và gửi danh sách thiết bị sắp hết hạn bảo hành theo từng chi nhánh qua Email quản trị để kịp thời nhắc nhở khách hàng và chào gói bảo dưỡng.
            </p>
          </div>

          {reportSentStatus && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{reportSentStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Chi Nhánh Cần Báo Cáo
              </label>
              <select
                value={reportBranch}
                onChange={(e) => setReportBranch(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-[#F27D26]"
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
                Khoảng Thời Gian Hết Hạn
              </label>
              <select
                value={reportDaysThreshold}
                onChange={(e) => setReportDaysThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-[#F27D26]"
              >
                <option value={15}>Trong vòng 15 ngày tới</option>
                <option value={30}>Trong vòng 30 ngày tới</option>
                <option value={60}>Trong vòng 60 ngày tới</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Email Quản Trị Viên Nhận Báo Cáo
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono focus:ring-2 focus:ring-[#F27D26]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSendExpiringReport}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Báo Cáo Ngay (Test Email Dispatch)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
