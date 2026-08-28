import React from 'react';
import { AlertOctagon, ShieldAlert, Key, RefreshCw } from 'lucide-react';
import { LicenseInfo } from '../types';

interface LicenseNoticeBannerProps {
  license: LicenseInfo;
  onOpenLicenseSettings: () => void;
  onQuickFixLicense?: () => void;
}

export const LicenseNoticeBanner: React.FC<LicenseNoticeBannerProps> = ({
  license,
  onOpenLicenseSettings,
  onQuickFixLicense,
}) => {
  if (license.status === 'active' && !license.is_write_blocked) {
    return null;
  }

  const isExpired = license.status === 'expired';
  const isInvalid = license.status === 'invalid';
  const isUnlicensed = license.status === 'unlicensed';

  let statusText = 'CHƯA ĐƯỢC XÁC THỰC BẢN QUYỀN';
  if (isExpired) statusText = 'GIẤY PHÉP ĐÃ HẾT HẠN';
  if (isInvalid) statusText = 'LICENSE KEY KHÔNG HỢP LỆ';

  return (
    <div
      id="wp-admin-strict-license-notice"
      className="sticky top-0 z-50 bg-red-600 text-white shadow-lg border-b-2 border-red-800 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start md:items-center space-x-3">
            <div className="p-2 bg-red-700/80 rounded-lg shrink-0 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wide text-xs uppercase bg-red-900/90 px-2 py-0.5 rounded text-red-100 border border-red-700">
                  {statusText}
                </span>
                <span className="font-bold text-sm sm:text-base">
                  CẢNH BÁO KHÓA DỮ LIỆU (STRICT WRITE-BLOCK)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 mt-0.5 leading-relaxed font-medium">
                CẢNH BÁO: Plugin chưa được xác thực bản quyền từ server{' '}
                <strong className="text-white underline">thanhaudio.vn/security</strong>. Tính năng lưu (Insert), chỉnh sửa (Update), thêm mới phiếu bảo hành, RMA và Import file Excel đã bị khóa an toàn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {onQuickFixLicense && (
              <button
                id="btn-quick-activate-license"
                onClick={onQuickFixLicense}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Kích hoạt Bản quyền Chuẩn
              </button>
            )}
            <button
              id="btn-goto-license-settings"
              onClick={onOpenLicenseSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-md shadow transition"
            >
              <Key className="w-3.5 h-3.5" />
              Cài đặt Bản quyền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
