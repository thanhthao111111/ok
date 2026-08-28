import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Globe,
  Server,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code,
  Layers,
  FileSpreadsheet,
  Database,
  Send,
  Zap,
} from 'lucide-react';
import { LicenseInfo } from '../types';
import {
  VALID_TEST_LICENSES,
  verifyLicenseApi,
} from '../services/licenseService';

interface LicenseSettingsProps {
  license: LicenseInfo;
  onUpdateLicense: (updated: Partial<LicenseInfo>) => void;
  onTriggerCronCheck: () => void;
}

export const LicenseSettings: React.FC<LicenseSettingsProps> = ({
  license,
  onUpdateLicense,
  onTriggerCronCheck,
}) => {
  const [inputKey, setInputKey] = useState(license.license_key);
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiLogs, setApiLogs] = useState<
    Array<{
      timestamp: string;
      endpoint: string;
      payload: any;
      response: any;
    }>
  >([]);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleVerify = async (keyToVerify?: string) => {
    const key = keyToVerify || inputKey;
    if (!key.trim()) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng nhập License Key trước khi kích hoạt.',
      });
      return;
    }

    setIsVerifying(true);
    setFeedback(null);

    const payload = {
      license_key: key.trim(),
      domain: license.domain,
      ip_address: license.ip_address,
      plugin_version: license.plugin_version,
    };

    try {
      const response = await verifyLicenseApi(payload);

      // Log the payload interaction
      setApiLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          endpoint: license.api_endpoint,
          payload,
          response,
        },
        ...prev.slice(0, 4),
      ]);

      if (response.success && response.data) {
        onUpdateLicense({
          license_key: response.data.license_key,
          status: response.data.status,
          license_type: response.data.license_type,
          expiry_date: response.data.expires_at,
          registered_to: response.data.registered_to,
          last_verified_at: new Date().toISOString(),
          next_cron_check: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          is_write_blocked: false,
        });
        setFeedback({
          type: 'success',
          message: response.message,
        });
      } else {
        const isExp = response.data?.status === 'expired';
        onUpdateLicense({
          license_key: key.trim(),
          status: isExp ? 'expired' : 'invalid',
          is_write_blocked: true,
          last_verified_at: new Date().toISOString(),
        });
        setFeedback({
          type: 'error',
          message: response.message,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Lỗi kết nối tới server xác thực: ' + (err.message || 'Network error'),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const isBlocked = license.status !== 'active' || license.is_write_blocked;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                PHẦN I: LICENSE SECURITY
              </span>
              <span className="text-xs text-slate-400 font-mono">
                WordPress Transient API 24h Cron
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Key className="w-6 h-6 text-[#F27D26]" />
              Kiến Trúc & Hệ Thống Xác Thực Bản Quyền
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Xác thực bản quyền trực tiếp từ máy chủ bảo mật{' '}
              <span className="text-[#F27D26] font-mono font-semibold">
                https://thanhaudio.vn/security
              </span>
              . Cơ chế Strict Data Block sẽ tự động khóa toàn bộ hành động ghi (Insert / Update) và Import nếu giấy phép không hợp lệ hoặc hết hạn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div
              className={`w-full sm:w-auto px-4 py-3 rounded-xl border flex items-center gap-3 ${
                !isBlocked
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/80 border-red-500/50 text-red-300'
              }`}
            >
              {!isBlocked ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-400 shrink-0 animate-pulse" />
              )}
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold">
                  Trạng thái bảo mật
                </div>
                <div className="text-sm font-extrabold text-white">
                  {!isBlocked ? 'ĐÃ KÍCH HOẠT HỢP LỆ' : 'ĐANG KHÓA GHI DỮ LIỆU'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Status Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Key Activation & Security Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activation Form Card */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#F27D26]" />
                  Kích Hoạt Giấy Phép Bản Quyền (License Activation)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập mã License Key được cấp bởi Thành Audio Security Server
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700">
                Endpoint: /verify-license
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-lg text-xs font-medium flex items-start gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/70 border border-red-500/50 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>{feedback.message}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  License Key <span className="text-[#F27D26]">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-license-key"
                      type="text"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="THANHAUDIO-PRO-XXXX-XXXX"
                      className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F27D26] focus:border-[#F27D26] text-white uppercase placeholder-slate-500"
                    />
                    <Key className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                  <button
                    id="btn-submit-activate-license"
                    onClick={() => handleVerify()}
                    disabled={isVerifying}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Kích Hoạt Bản Quyền</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Preset Keys for One-Click Testing */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Mã kiểm thử mẫu từ server thanhaudio.vn (Bấm để thử nhanh):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VALID_TEST_LICENSES.map((lic) => (
                    <button
                      key={lic.key}
                      onClick={() => {
                        setInputKey(lic.key);
                        handleVerify(lic.key);
                      }}
                      className="text-left p-2.5 bg-[#1E293B] border border-slate-700 hover:border-[#F27D26]/60 rounded-lg transition text-xs group"
                    >
                      <div className="font-mono font-bold text-slate-200 text-[11px] truncate group-hover:text-[#F27D26]">
                        {lic.key}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {lic.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strict Data Block System Inspector */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                Cơ Chế Khóa Dữ Liệu An Toàn (Strict Data Block Policy)
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isBlocked
                    ? 'bg-red-950 text-red-300 border border-red-500/50'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                }`}
              >
                {isBlocked ? 'Đang Khóa (Write-Blocked)' : 'Mở Khóa (Full Access)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Khi ở trạng thái <strong className="text-white">Chưa kích hoạt / License không hợp lệ / Hết hạn</strong>, hệ thống tự động áp dụng 4 tầng bảo vệ dữ liệu:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isBlocked
                    ? 'bg-red-950/40 border-red-800/60 text-red-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded ${
                    isBlocked ? 'bg-red-900/60 text-red-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">1. Chặn lưu dữ liệu (Write-Block)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Chặn toàn bộ lệnh INSERT/UPDATE vào cơ sở dữ liệu (wp_insert_post, $wpdb-&gt;insert, $wpdb-&gt;update) cho Serials, RMA.
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isBlocked
                    ? 'bg-red-950/40 border-red-800/60 text-red-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded ${
                    isBlocked ? 'bg-red-900/60 text-red-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">2. Chặn Import File Excel/CSV</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Vô hiệu hóa tính năng Upload và xử lý file Excel, ngăn chặn chèn hàng loạt dữ liệu trái phép.
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isBlocked
                    ? 'bg-red-950/40 border-red-800/60 text-red-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded ${
                    isBlocked ? 'bg-red-900/60 text-red-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">3. Chế độ Chỉ Đọc (Read-Only)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Các nút "Thêm mới", "Lưu thay đổi", "Cập nhật tiến trình" sẽ tự động bị ẩn hoặc vô hiệu hóa (disabled).
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isBlocked
                    ? 'bg-red-950/40 border-red-800/60 text-red-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded ${
                    isBlocked ? 'bg-red-900/60 text-red-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">4. Cảnh báo Admin Notice cố định</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hiển thị banner đỏ toàn trang cảnh báo quản trị viên về tình trạng khóa giấy phép bản quyền.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Server Connection & Payload Inspection */}
        <div className="space-y-6">
          {/* Server Details Card */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/80 pb-3">
              <Server className="w-4 h-4 text-[#F27D26]" />
              Thông Tin Kết Nối Server
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">Server Xác Thực</div>
                <div className="font-mono font-semibold text-slate-200 break-all">
                  {license.server_url}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Tên miền đăng ký (Domain)</div>
                <div className="font-mono font-semibold text-slate-200">
                  {license.domain}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">IP Máy chủ Website</div>
                <div className="font-mono font-semibold text-slate-200">
                  {license.ip_address}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Loại Giấy Phép</div>
                <div className="inline-block font-bold text-[#F27D26] bg-[#F27D26]/10 px-2 py-0.5 rounded border border-[#F27D26]/30">
                  {license.license_type}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Đơn vị đăng ký</div>
                <div className="font-medium text-slate-200">
                  {license.registered_to}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Ngày Hết Hạn</div>
                <div className="font-mono font-bold text-slate-200">
                  {license.expiry_date}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80">
                <div className="text-slate-400 text-[11px]">Lần kiểm tra cuối (Transient)</div>
                <div className="font-mono text-slate-300 text-[11px]">
                  {new Date(license.last_verified_at).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-trigger-cron-verification"
                  onClick={onTriggerCronCheck}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Kích hoạt Cronjob 24h (Transient API)</span>
                </button>
              </div>
            </div>
          </div>

          {/* API Payload Inspector */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-4 space-y-3 text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
              <span className="text-xs font-bold text-[#F27D26] flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Live Payload Gửi Về Server
              </span>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                POST JSON
              </span>
            </div>

            <div className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
              <pre>
{JSON.stringify(
  {
    license_key: license.license_key,
    domain: license.domain,
    ip_address: license.ip_address,
    plugin_version: license.plugin_version,
  },
  null,
  2
)}
              </pre>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Mỗi 24 giờ, WordPress Cron tự động gửi payload trên về endpoint{' '}
              <code className="text-[#F27D26]">/verify-license</code> và lưu kết quả vào Transient cache để không làm chậm website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
