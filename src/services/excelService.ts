import * as XLSX from 'xlsx';
import { ExcelImportRow, WarrantyItem } from '../types';

export const REQUIRED_IMPORT_COLUMNS = [
  'Mã Serial/IMEI',
  'SKU',
  'Ngày Mua',
  'Khách Hàng',
  'SĐT Khách',
  'Chi Nhánh/Nơi Bán',
  'Địa Chỉ Chi Nhánh',
  'SĐT Nơi Bán',
  'Nhân Viên/Người Bán',
];

export interface ColumnMapping {
  serial: string;
  sku: string;
  purchase_date: string;
  customer_name: string;
  customer_phone: string;
  branch_name: string;
  branch_address: string;
  branch_phone: string;
  seller_name: string;
}

export function parseExcelFile(fileData: ArrayBuffer): {
  headers: string[];
  rawRows: Record<string, any>[];
} {
  const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    header: 1,
    defval: '',
  });

  if (!jsonData || jsonData.length === 0) {
    return { headers: [], rawRows: [] };
  }

  const rawHeaders = (jsonData[0] as string[]).map((h) => String(h || '').trim());
  const rows = jsonData.slice(1) as any[][];

  const rawRows: Record<string, any>[] = rows
    .filter((r) => r.some((cell) => cell !== '' && cell !== null && cell !== undefined))
    .map((r) => {
      const obj: Record<string, any> = {};
      rawHeaders.forEach((header, idx) => {
        let val = r[idx];
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }
        obj[header] = val !== undefined && val !== null ? String(val).trim() : '';
      });
      return obj;
    });

  return { headers: rawHeaders, rawRows };
}

export function validateImportRows(
  rawRows: Record<string, any>[],
  mapping: ColumnMapping,
  existingSerials: string[]
): ExcelImportRow[] {
  const existingSet = new Set(existingSerials.map((s) => s.trim().toUpperCase()));
  const seenInFile = new Set<string>();

  return rawRows.map((row, index) => {
    const serial = String(row[mapping.serial] || '').trim();
    const sku = String(row[mapping.sku] || '').trim();
    const purchaseDateRaw = String(row[mapping.purchase_date] || '').trim();
    const customerName = String(row[mapping.customer_name] || '').trim();
    const customerPhone = String(row[mapping.customer_phone] || '').trim();
    const branchName = String(row[mapping.branch_name] || '').trim();
    const branchAddress = String(row[mapping.branch_address] || '').trim();
    const branchPhone = String(row[mapping.branch_phone] || '').trim();
    const sellerName = String(row[mapping.seller_name] || '').trim();

    const errors: string[] = [];

    // Serial validation
    if (!serial) {
      errors.push('Thiếu Mã Serial/IMEI bắt buộc');
    } else {
      const upperSerial = serial.toUpperCase();
      if (existingSet.has(upperSerial)) {
        errors.push(`Mã Serial [${serial}] đã tồn tại trong cơ sở dữ liệu`);
      }
      if (seenInFile.has(upperSerial)) {
        errors.push(`Mã Serial [${serial}] bị trùng lặp trong chính file tải lên`);
      }
      seenInFile.add(upperSerial);
    }

    // SKU validation
    if (!sku) {
      errors.push('Thiếu mã SKU sản phẩm');
    }

    // Phone validation
    const cleanPhone = customerPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 12) {
      errors.push(`Số điện thoại khách hàng [${customerPhone}] không hợp lệ`);
    }

    // Customer Name validation
    if (!customerName) {
      errors.push('Thiếu tên khách hàng');
    }

    // Branch validation
    if (!branchName) {
      errors.push('Thiếu thông tin Chi nhánh/Nơi bán');
    }

    // Purchase date validation
    let purchaseDateFormatted = purchaseDateRaw;
    if (purchaseDateRaw) {
      const parsedDate = new Date(purchaseDateRaw);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Ngày mua [${purchaseDateRaw}] không đúng định dạng (YYYY-MM-DD)`);
      } else {
        purchaseDateFormatted = parsedDate.toISOString().split('T')[0];
      }
    } else {
      purchaseDateFormatted = new Date().toISOString().split('T')[0];
    }

    return {
      row_index: index + 2, // Excel 1-based + 1 header
      serial_number: serial,
      sku: sku,
      purchase_date: purchaseDateFormatted,
      customer_name: customerName,
      customer_phone: customerPhone,
      branch_name: branchName,
      branch_address: branchAddress,
      branch_phone: branchPhone,
      seller_name: sellerName || 'Nhân viên bán hàng',
      product_name: sku,
      warranty_months: 12,
      validation_errors: errors,
      is_valid: errors.length === 0,
    };
  });
}

export function exportWarrantiesToExcel(
  items: WarrantyItem[],
  options?: {
    branchFilter?: string;
    statusFilter?: string;
    includeEdateFormula?: boolean;
  }
) {
  const dataToExport = items.map((item, index) => {
    const rowNumber = index + 2; // Excel 1-based header is row 1
    const months = item.warranty_months || 12;

    return {
      'STT': index + 1,
      'Mã Serial / IMEI': item.serial_number,
      'Mã SKU': item.sku,
      'Tên Sản Phẩm': item.product_name,
      'Ngày Mua (YYYY-MM-DD)': item.purchase_date,
      'Thời Hạn BH (Tháng)': months,
      'Ngày Hết Hạn': item.expiry_date,
      'Công Thức EDATE (=EDATE)': `=EDATE(E${rowNumber}, F${rowNumber})`,
      'Trạng Thái':
        item.status === 'active'
          ? 'Còn hạn'
          : item.status === 'expiring_soon'
          ? 'Sắp hết hạn'
          : item.status === 'expired'
          ? 'Hết hạn'
          : 'Đã hủy',
      'Họ Tên Khách Hàng': item.customer_name,
      'Số Điện Thoại Khách': item.customer_phone,
      'Email Khách Hàng': item.customer_email || '',
      'Địa Chỉ Khách Hàng': item.customer_address || '',
      'Nơi Bán / Chi Nhánh': item.branch_name,
      'Hotline Chi Nhánh': item.branch_phone,
      'Địa Chỉ Chi Nhánh': item.branch_address,
      'Nhân Viên / Người Bán': item.seller_name,
      'SĐT Người Bán': item.seller_phone || '',
      'Mã Đơn WooCommerce': item.woocommerce_order_id || '',
      'Ghi Chú': item.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // Column width formatting
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 22 }, // Serial
    { wch: 18 }, // SKU
    { wch: 32 }, // Product name
    { wch: 16 }, // Purchase date
    { wch: 14 }, // Months
    { wch: 16 }, // Expiry date
    { wch: 24 }, // Formula
    { wch: 14 }, // Status
    { wch: 22 }, // Customer name
    { wch: 16 }, // Phone
    { wch: 24 }, // Email
    { wch: 30 }, // Customer Address
    { wch: 35 }, // Branch
    { wch: 18 }, // Branch phone
    { wch: 45 }, // Branch address
    { wch: 20 }, // Seller
    { wch: 16 }, // Seller phone
    { wch: 16 }, // WC order
    { wch: 30 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_Bao_Hanh_ThanhAudio');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `ThanhAudio_Warranty_Export_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

export function generateSampleExcelFile() {
  const sampleData = [
    {
      'Mã Serial/IMEI': 'TA-JBL-2026-99011',
      'SKU': 'JBL-PASION-10',
      'Ngày Mua': '2026-02-15',
      'Khách Hàng': 'Nguyễn Hoàng Long',
      'SĐT Khách': '0912345678',
      'Chi Nhánh/Nơi Bán': 'Thành Audio - Showroom Cầu Giấy (Trụ sở chính)',
      'Địa Chỉ Chi Nhánh': 'Số 168 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
      'SĐT Nơi Bán': '0987.654.321',
      'Nhân Viên/Người Bán': 'Nguyễn Tuấn Anh',
    },
    {
      'Mã Serial/IMEI': 'TA-CRW-2026-88022',
      'SKU': 'CROWN-XLI-2500',
      'Ngày Mua': '2026-02-18',
      'Khách Hàng': 'Lê Thị Thu Thảo',
      'SĐT Khách': '0988112233',
      'Chi Nhánh/Nơi Bán': 'Thành Audio - Showroom Quận 10',
      'Địa Chỉ Chi Nhánh': 'Số 452 Đường 3/2, Phường 12, Quận 10, TP. Hồ Chí Minh',
      'SĐT Nơi Bán': '0912.333.888',
      'Nhân Viên/Người Bán': 'Đặng Quốc Huy',
    },
    {
      'Mã Serial/IMEI': 'TA-SHU-2026-77033',
      'SKU': 'SHURE-UGX23-PLUS',
      'Ngày Mua': '2026-02-20',
      'Khách Hàng': 'Trần Văn Hải',
      'SĐT Khách': '0905123987',
      'Chi Nhánh/Nơi Bán': 'Thành Audio - Chi nhánh Đà Nẵng',
      'Địa Chỉ Chi Nhánh': 'Số 88 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng',
      'SĐT Nơi Bán': '0935.777.999',
      'Nhân Viên/Người Bán': 'Phan Minh Đức',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 15 },
    { wch: 22 },
    { wch: 16 },
    { wch: 35 },
    { wch: 45 },
    { wch: 18 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Import_ThanhAudio');
  XLSX.writeFile(workbook, 'Mau_Import_BaoHanh_ThanhAudio.xlsx');
}
