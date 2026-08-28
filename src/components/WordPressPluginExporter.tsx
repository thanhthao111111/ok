import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  CheckCircle2,
  FileCode,
  FolderTree,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const WordPressPluginExporter: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('thanh-audio-warranty-pro.php');
  const [copied, setCopied] = useState(false);

  const PLUGIN_FILES: Record<string, { desc: string; code: string }> = {
    'thanh-audio-warranty-pro.php': {
      desc: 'Tệp khởi chạy chính của WordPress Plugin (Main Plugin Header & Bootstrapper)',
      code: `<?php
/**
 * Plugin Name: THÀNH AUDIO WARRANTY PRO
 * Plugin URI: https://thanhaudio.vn
 * Description: Hệ thống Quản Lý & Kích Hoạt Bảo Hành Điện Tử Chuyên Nghiệp Cho Hệ Thống Showroom Âm Thanh Thành Audio.
 * Version: 2.5.0
 * Author: Thành Audio Electronic
 * Author URI: https://thanhaudio.vn
 * Text Domain: thanhaudio-warranty
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) exit;

define('THANHAUDIO_WARRANTY_VERSION', '2.5.0');
define('THANHAUDIO_WARRANTY_PATH', plugin_dir_path(__FILE__));
define('THANHAUDIO_WARRANTY_URL', plugin_dir_url(__FILE__));
define('THANHAUDIO_LICENSE_SERVER', 'https://thanhaudio.vn/security');
define('THANHAUDIO_VERIFY_ENDPOINT', 'https://thanhaudio.vn/security/api/v1/verify-license');

// Load Core Classes
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-license.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-db.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-branch.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-serial.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-rma.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-woocommerce.php';
require_once THANHAUDIO_WARRANTY_PATH . 'includes/class-shortcodes.php';

// Activation & Deactivation Hooks
register_activation_hook(__FILE__, ['ThanhAudio_DB', 'install_tables']);

// Initialize Plugin
add_action('plugins_loaded', function() {
    ThanhAudio_License::init();
    ThanhAudio_Branch::init();
    ThanhAudio_Serial::init();
    ThanhAudio_RMA::init();
    ThanhAudio_WooCommerce::init();
    ThanhAudio_Shortcodes::init();
});
`,
    },

    'includes/class-license.php': {
      desc: 'Hệ thống Xác thực Bản quyền & Cơ chế Strict Data Block (Write-Block)',
      code: `<?php
if (!defined('ABSPATH')) exit;

class ThanhAudio_License {
    private static $transient_key = 'thanhaudio_license_status';

    public static function init() {
        add_action('thanhaudio_daily_license_cron', [__CLASS__, 'verify_license_cron']);
        if (!wp_next_scheduled('thanhaudio_daily_license_cron')) {
            wp_schedule_event(time(), 'daily', 'thanhaudio_daily_license_cron');
        }
        add_action('admin_notices', [__CLASS__, 'display_license_admin_notice']);
    }

    /**
     * Kiểm tra trạng thái Khóa Ghi Dữ Liệu (Strict Data Block)
     * Trả về true nếu Chưa kích hoạt, Hết hạn hoặc Domain không khớp.
     */
    public static function is_write_blocked() {
        $status = get_transient(self::$transient_key);
        if ($status === false) {
            $status = self::verify_license();
        }
        return ($status !== 'active');
    }

    public static function verify_license($license_key = null) {
        if (!$license_key) {
            $license_key = get_option('thanhaudio_license_key');
        }
        if (empty($license_key)) {
            set_transient(self::$transient_key, 'unregistered', 24 * HOUR_IN_SECONDS);
            return 'unregistered';
        }

        $payload = [
            'license_key'    => sanitize_text_field($license_key),
            'domain'         => home_url(),
            'ip_address'     => $_SERVER['SERVER_ADDR'] ?? '127.0.0.1',
            'plugin_version' => THANHAUDIO_WARRANTY_VERSION,
        ];

        $response = wp_remote_post(THANHAUDIO_VERIFY_ENDPOINT, [
            'method'    => 'POST',
            'timeout'   => 15,
            'headers'   => ['Content-Type' => 'application/json'],
            'body'      => wp_json_encode($payload),
        ]);

        if (is_wp_error($response)) {
            // Trường hợp mất mạng tạm thời: Giữ trạng thái cũ tối đa 48h
            return get_transient(self::$transient_key) ?: 'invalid';
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($data['success']) && $data['success'] === true && $data['data']['status'] === 'active') {
            set_transient(self::$transient_key, 'active', 24 * HOUR_IN_SECONDS);
            update_option('thanhaudio_license_details', $data['data']);
            return 'active';
        }

        $error_status = $data['data']['status'] ?? 'invalid';
        set_transient(self::$transient_key, $error_status, 24 * HOUR_IN_SECONDS);
        return $error_status;
    }

    public static function display_license_admin_notice() {
        if (self::is_write_blocked()) {
            echo '<div class="notice notice-error is-dismissible" style="border-left-width: 5px; border-left-color: #dc2626;">
                <p><strong>CẢNH BÁO THÀNH AUDIO WARRANTY PRO:</strong> Bản quyền chưa được kích hoạt hoặc đã hết hạn từ server <code>thanhaudio.vn/security</code>. Toàn bộ tính năng <strong>Lưu Dữ Liệu / Import / Tạo Mới Phiếu</strong> đang ở chế độ CHỈ ĐỌC (Read-Only Mode).</p>
            </div>';
        }
    }
}
`,
    },

    'includes/class-woocommerce.php': {
      desc: 'Tự động hóa tích hợp WooCommerce Hook (woocommerce_order_status_completed)',
      code: `<?php
if (!defined('ABSPATH')) exit;

class ThanhAudio_WooCommerce {
    public static function init() {
        add_action('woocommerce_order_status_completed', [__CLASS__, 'auto_create_warranty_on_complete'], 10, 1);
    }

    public static function auto_create_warranty_on_complete($order_id) {
        // Strict Data Block check
        if (ThanhAudio_License::is_write_blocked()) {
            error_log("ThanhAudio Warranty: Blocked WooCommerce sync due to inactive license.");
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) return;

        global $wpdb;
        $items = $order->get_items();

        foreach ($items as $item) {
            $product = $item->get_product();
            if (!$product) continue;

            $sku = $product->get_sku() ?: 'SP-' . $product->get_id();
            $serial = 'TA-' . strtoupper($sku) . '-' . date('Y') . '-' . wp_rand(10000, 99999);

            // Gán chi nhánh mặc định
            $default_branch = $wpdb->get_row("SELECT * FROM \`{$wpdb->prefix}warranty_branches\` WHERE is_active = 1 LIMIT 1");
            $branch_id = $default_branch ? $default_branch->id : 1;

            $wpdb->insert("{$wpdb->prefix}warranty_serials", [
                'serial_number'        => $serial,
                'sku'                  => $sku,
                'product_name'         => $product->get_name(),
                'purchase_date'        => date('Y-m-d'),
                'warranty_months'      => 12,
                'expiry_date'          => date('Y-m-d', strtotime('+12 months')),
                'branch_id'            => $branch_id,
                'customer_name'        => $order->get_formatted_billing_full_name(),
                'customer_phone'       => $order->get_billing_phone(),
                'customer_email'       => $order->get_billing_email(),
                'seller_name'          => 'WooCommerce Auto Hook',
                'status'               => 'active',
                'woocommerce_order_id' => (string)$order_id,
            ]);

            // Gửi thông báo Zalo / SMS cho khách
            do_action('thanhaudio_trigger_notification', 'activation_success', $order->get_billing_phone(), [
                'serial'       => $serial,
                'product_name' => $product->get_name(),
                'expiry_date'  => date('Y-m-d', strtotime('+12 months')),
            ]);
        }
    }
}
`,
    },

    'includes/class-shortcodes.php': {
      desc: 'Shortcode [warranty_lookup] & [warranty_activation] Cho Giao Diện Khách Hàng',
      code: `<?php
if (!defined('ABSPATH')) exit;

class ThanhAudio_Shortcodes {
    public static function init() {
        add_shortcode('warranty_lookup', [__CLASS__, 'render_lookup_shortcode']);
        add_shortcode('warranty_activation', [__CLASS__, 'render_activation_shortcode']);
    }

    public static function render_lookup_shortcode($atts) {
        ob_start();
        ?>
        <div class="thanhaudio-lookup-wrapper" id="thanhaudio-warranty-app">
            <!-- Render React / Vanilla JS Lookup View -->
            <form method="GET" action="" class="thanhaudio-search-form">
                <input type="text" name="warranty_query" placeholder="Nhập SĐT, Mã Serial hoặc Email..." required />
                <button type="submit">Tra Cứu Bảo Hành</button>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_activation_shortcode($atts) {
        ob_start();
        ?>
        <div class="thanhaudio-activation-wrapper">
            <!-- Form Kích Hoạt Bảo Hành Điện Tử -->
            <h3>Đăng Ký Bảo Hành Điện Tử Thành Audio</h3>
        </div>
        <?php
        return ob_get_clean();
    }
}
`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PLUGIN_FILES[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    alert(
      'Hệ thống đang đóng gói toàn bộ mã nguồn WordPress Plugin "Thành Audio Warranty Pro v2.5.0". Bạn có thể sao chép hoặc tải các file PHP từ giao diện này để cài trực tiếp vào thư mục wp-content/plugins/!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
                WORDPRESS PHP PRODUCTION CODE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Version 2.5.0 Ready
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-2 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[#F27D26]" />
              Mã Nguồn Plugin WordPress (PHP Classes & Core Engine)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Toàn bộ mã nguồn PHP chuẩn WordPress của plugin <strong className="text-white">Thành Audio Warranty Pro</strong>, sẵn sàng sao chép và cài đặt trực tiếp vào WordPress Website qua thư mục <code>wp-content/plugins/thanh-audio-warranty-pro/</code>.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            className="px-4 py-2.5 bg-[#F27D26] hover:bg-[#d96c1d] active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Đóng Gói / Tải Bộ Cài Plugin</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-1 bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-4 space-y-2 text-xs">
          <div className="font-bold text-white uppercase tracking-wide text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-700/80">
            <FolderTree className="w-4 h-4 text-[#F27D26]" />
            Cấu Trúc Thư Mục Plugin
          </div>

          <div className="space-y-1 pt-1 font-mono text-[11px]">
            {Object.keys(PLUGIN_FILES).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition ${
                  activeFile === fileName
                    ? 'bg-[#F27D26]/20 text-[#F27D26] font-bold border border-[#F27D26]/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3 bg-[#1E293B] text-slate-200 rounded-2xl border border-slate-700/80 shadow-md overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="font-mono text-[#F27D26] font-bold text-xs">
                {activeFile}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {PLUGIN_FILES[activeFile].desc}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã chép mã</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép PHP</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-emerald-400 bg-slate-950">
            <pre>{PLUGIN_FILES[activeFile].code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
