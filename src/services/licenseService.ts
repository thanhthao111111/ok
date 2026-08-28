import { LicenseInfo, LicenseStatus, LicenseType } from '../types';

export interface VerifyLicensePayload {
  license_key: string;
  domain: string;
  ip_address: string;
  plugin_version: string;
}

export interface VerifyLicenseResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    license_key: string;
    license_type: LicenseType;
    status: LicenseStatus;
    registered_to: string;
    registered_domain: string;
    activated_at: string;
    expires_at: string;
    features: string[];
    server_time: string;
    transient_ttl_seconds: number;
  };
}

export const VALID_TEST_LICENSES = [
  {
    key: 'THANHAUDIO-PRO-2026-X987K',
    type: 'Lifetime Pro' as LicenseType,
    domain: 'https://thanhaudio.vn',
    expires: '2030-12-31',
    owner: 'Thành Audio Electronic JSC (thanhaudio.com.vn@gmail.com)',
    desc: 'Bản quyền Lifetime Pro vĩnh viễn (Đầy đủ tính năng)',
  },
  {
    key: 'THANHAUDIO-ENT-MULTI-8821',
    type: 'Agency Enterprise' as LicenseType,
    domain: 'https://thanhaudio.vn',
    expires: '2028-12-31',
    owner: 'Tập đoàn Âm thanh Thành Audio (VIP Agency)',
    desc: 'Bản quyền Doanh nghiệp (Quản lý đa chi nhánh không giới hạn)',
  },
  {
    key: 'THANHAUDIO-STD-2025-1YEAR',
    type: 'Standard 1 Year' as LicenseType,
    domain: 'https://thanhaudio.vn',
    expires: '2024-01-01', // Expired
    owner: 'Chi nhánh Thử nghiệm Demo',
    desc: 'Bản quyền ĐÃ HẾT HẠN (Dùng để kiểm tra cơ chế khóa dữ liệu)',
  },
];

export async function verifyLicenseApi(
  payload: VerifyLicensePayload
): Promise<VerifyLicenseResponse> {
  // Simulate network latency to https://thanhaudio.vn/security/api/v1/verify-license
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmedKey = payload.license_key.trim().toUpperCase();

  if (!trimmedKey) {
    return {
      success: false,
      code: 400,
      message: 'Lỗi 400: Thiếu tham số license_key.',
    };
  }

  // Check against known keys
  const match = VALID_TEST_LICENSES.find((l) => l.key.toUpperCase() === trimmedKey);

  if (match) {
    const isExpired = new Date(match.expires).getTime() < new Date().getTime();
    if (isExpired) {
      return {
        success: false,
        code: 403,
        message: 'Lỗi 403: Giấy phép bản quyền đã hết hạn vào ngày ' + match.expires + '. Vui lòng gia hạn tại thanhaudio.vn/security.',
        data: {
          license_key: match.key,
          license_type: match.type,
          status: 'expired',
          registered_to: match.owner,
          registered_domain: payload.domain,
          activated_at: '2023-01-01',
          expires_at: match.expires,
          features: ['read_only_mode'],
          server_time: new Date().toISOString(),
          transient_ttl_seconds: 86400,
        },
      };
    }

    return {
      success: true,
      code: 200,
      message: 'Xác thực thành công! Giấy phép ' + match.type + ' hợp lệ.',
      data: {
        license_key: match.key,
        license_type: match.type,
        status: 'active',
        registered_to: match.owner,
        registered_domain: payload.domain,
        activated_at: '2024-01-01',
        expires_at: match.expires,
        features: [
          'full_write_access',
          'excel_import_export',
          'branch_management',
          'rma_ticket_system',
          'woocommerce_sync',
          'zalo_sms_notifications',
        ],
        server_time: new Date().toISOString(),
        transient_ttl_seconds: 86400,
      },
    };
  }

  if (trimmedKey.startsWith('THANH-')) {
    // Custom dynamic active key
    return {
      success: true,
      code: 200,
      message: 'Kích hoạt thành công giấy phép từ Server Thanhaudio Security.',
      data: {
        license_key: trimmedKey,
        license_type: 'Standard 1 Year',
        status: 'active',
        registered_to: 'Thành Audio Khách hàng Doanh Nghiệp',
        registered_domain: payload.domain,
        activated_at: new Date().toISOString().split('T')[0],
        expires_at: '2028-12-31',
        features: ['full_write_access', 'excel_import_export', 'branch_management'],
        server_time: new Date().toISOString(),
        transient_ttl_seconds: 86400,
      },
    };
  }

  return {
    success: false,
    code: 404,
    message: 'Lỗi 404: License Key không tồn tại trên hệ thống bảo mật thanhaudio.vn hoặc đã bị thu hồi.',
  };
}

export function isStrictDataBlocked(license: LicenseInfo): boolean {
  return license.status !== 'active' || license.is_write_blocked;
}
