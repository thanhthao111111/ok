import React, { useState } from 'react';
import {
  Database,
  Table,
  Code,
  ShieldCheck,
  Building2,
  Cpu,
  Wrench,
  KeyRound,
  Layers,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Branch, LicenseInfo, RMATicket, WarrantyItem } from '../types';

interface DatabaseInspectorProps {
  license: LicenseInfo;
  branches: Branch[];
  warranties: WarrantyItem[];
  rmaTickets: RMATicket[];
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  license,
  branches,
  warranties,
  rmaTickets,
}) => {
  const [selectedTable, setSelectedTable] = useState<
    'wp_warranty_licenses' | 'wp_warranty_branches' | 'wp_warranty_serials' | 'wp_warranty_rma'
  >('wp_warranty_serials');

  const [copiedSql, setCopiedSql] = useState(false);

  const DDL_SCHEMAS: Record<string, string> = {
    wp_warranty_licenses: `CREATE TABLE \`wp_warranty_licenses\` (
  \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`license_key\` varchar(191) NOT NULL,
  \`domain\` varchar(191) NOT NULL,
  \`status\` enum('active','invalid','expired','unregistered') NOT NULL DEFAULT 'unregistered',
  \`license_type\` varchar(50) DEFAULT 'Single Domain',
  \`valid_until\` datetime DEFAULT NULL,
  \`last_checked_at\` datetime DEFAULT NULL,
  \`signature_hash\` text DEFAULT NULL,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`license_key\` (\`license_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    wp_warranty_branches: `CREATE TABLE \`wp_warranty_branches\` (
  \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`branch_code\` varchar(50) NOT NULL,
  \`branch_name\` varchar(191) NOT NULL,
  \`address\` text NOT NULL,
  \`hotline\` varchar(50) NOT NULL,
  \`manager_user_id\` bigint(20) UNSIGNED DEFAULT NULL,
  \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`branch_code\` (\`branch_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    wp_warranty_serials: `CREATE TABLE \`wp_warranty_serials\` (
  \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`serial_number\` varchar(100) NOT NULL,
  \`sku\` varchar(100) NOT NULL,
  \`product_name\` varchar(255) NOT NULL,
  \`purchase_date\` date NOT NULL,
  \`warranty_months\` int(11) NOT NULL DEFAULT 12,
  \`expiry_date\` date NOT NULL,
  \`branch_id\` bigint(20) UNSIGNED NOT NULL,
  \`customer_name\` varchar(191) NOT NULL,
  \`customer_phone\` varchar(50) NOT NULL,
  \`customer_email\` varchar(191) DEFAULT NULL,
  \`seller_name\` varchar(191) NOT NULL,
  \`status\` enum('active','expiring_soon','expired','voided') NOT NULL DEFAULT 'active',
  \`invoice_number\` varchar(100) DEFAULT NULL,
  \`woocommerce_order_id\` varchar(50) DEFAULT NULL,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`serial_number\` (\`serial_number\`),
  KEY \`branch_id\` (\`branch_id\`),
  KEY \`customer_phone\` (\`customer_phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    wp_warranty_rma: `CREATE TABLE \`wp_warranty_rma\` (
  \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`ticket_code\` varchar(100) NOT NULL,
  \`serial_number\` varchar(100) NOT NULL,
  \`branch_id\` bigint(20) UNSIGNED NOT NULL,
  \`intake_date\` datetime NOT NULL,
  \`fault_description\` text NOT NULL,
  \`technician_name\` varchar(191) DEFAULT NULL,
  \`technician_notes\` text DEFAULT NULL,
  \`customer_notes\` text DEFAULT NULL,
  \`status\` enum('new','checking','repairing','completed','returned','rejected') NOT NULL DEFAULT 'new',
  \`repair_cost\` decimal(12,2) DEFAULT 0.00,
  \`replaced_parts\` text DEFAULT NULL,
  \`completed_date\` datetime DEFAULT NULL,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`ticket_code\` (\`ticket_code\`),
  KEY \`serial_number\` (\`serial_number\`),
  KEY \`branch_id\` (\`branch_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DDL_SCHEMAS[selectedTable]);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md p-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40">
            PHẦN VI: CẤU TRÚC CƠ SỞ DỮ LIỆU
          </span>
          <span className="text-xs text-slate-400 font-mono">
            WordPress MySQL Schema & Live Inspector
          </span>
        </div>
        <h1 className="text-xl font-black text-white mt-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#F27D26]" />
          Thanh Tra Cơ Sở Dữ Liệu WordPress (Database Tables)
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Xem 4 bảng cơ sở dữ liệu cốt lõi của plugin <strong className="text-white">Thành Audio Warranty Pro</strong>, bao gồm schema DDL tạo bảng chuẩn WordPress và dữ liệu đang lưu trong bộ nhớ.
        </p>

        {/* Table Selector */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTable('wp_warranty_serials')}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition ${
              selectedTable === 'wp_warranty_serials'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>wp_warranty_serials ({warranties.length})</span>
          </button>

          <button
            onClick={() => setSelectedTable('wp_warranty_branches')}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition ${
              selectedTable === 'wp_warranty_branches'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>wp_warranty_branches ({branches.length})</span>
          </button>

          <button
            onClick={() => setSelectedTable('wp_warranty_rma')}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition ${
              selectedTable === 'wp_warranty_rma'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>wp_warranty_rma ({rmaTickets.length})</span>
          </button>

          <button
            onClick={() => setSelectedTable('wp_warranty_licenses')}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition ${
              selectedTable === 'wp_warranty_licenses'
                ? 'bg-[#F27D26] text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>wp_warranty_licenses (1)</span>
          </button>
        </div>
      </div>

      {/* SQL DDL Schema */}
      <div className="bg-[#1E293B] text-slate-200 rounded-2xl border border-slate-700/80 shadow-md p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#F27D26] text-xs uppercase tracking-wide flex items-center gap-2">
            <Code className="w-4 h-4" />
            Cấu Trúc Bảng DDL MySQL: <span className="font-mono text-white">{selectedTable}</span>
          </h3>
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition"
          >
            {copiedSql ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Sao chép SQL</span>
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
          {DDL_SCHEMAS[selectedTable]}
        </pre>
      </div>

      {/* Live Data Preview Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-md overflow-hidden text-xs">
        <div className="p-4 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-white font-mono">
            SELECT * FROM `{selectedTable}`
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            InnoDB Engine - utf8mb4_unicode_ci
          </span>
        </div>

        <div className="overflow-x-auto">
          {selectedTable === 'wp_warranty_serials' && (
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">serial_number</th>
                  <th className="py-2.5 px-3">sku</th>
                  <th className="py-2.5 px-3">purchase_date</th>
                  <th className="py-2.5 px-3">expiry_date</th>
                  <th className="py-2.5 px-3">branch_id</th>
                  <th className="py-2.5 px-3">customer_phone</th>
                  <th className="py-2.5 px-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-2 px-3 text-slate-500">{w.id}</td>
                    <td className="py-2 px-3 font-bold text-[#F27D26]">{w.serial_number}</td>
                    <td className="py-2 px-3 text-slate-300">{w.sku}</td>
                    <td className="py-2 px-3">{w.purchase_date}</td>
                    <td className="py-2 px-3 font-bold text-white">{w.expiry_date}</td>
                    <td className="py-2 px-3 text-slate-400">{w.branch_id}</td>
                    <td className="py-2 px-3">{w.customer_phone}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'wp_warranty_branches' && (
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">branch_code</th>
                  <th className="py-2.5 px-3">branch_name</th>
                  <th className="py-2.5 px-3">address</th>
                  <th className="py-2.5 px-3">hotline</th>
                  <th className="py-2.5 px-3">is_active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-2 px-3 text-slate-500">{b.id}</td>
                    <td className="py-2 px-3 font-bold text-[#F27D26]">{b.code}</td>
                    <td className="py-2 px-3 text-white font-sans">{b.name}</td>
                    <td className="py-2 px-3 text-slate-400 max-w-xs truncate font-sans">
                      {b.address}
                    </td>
                    <td className="py-2 px-3">{b.phone}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'wp_warranty_rma' && (
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">ticket_code</th>
                  <th className="py-2.5 px-3">serial_number</th>
                  <th className="py-2.5 px-3">branch_id</th>
                  <th className="py-2.5 px-3">technician_name</th>
                  <th className="py-2.5 px-3">repair_cost</th>
                  <th className="py-2.5 px-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {rmaTickets.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-2 px-3 text-slate-500">{r.id}</td>
                    <td className="py-2 px-3 font-bold text-[#F27D26]">{r.ticket_code}</td>
                    <td className="py-2 px-3">{r.serial_number}</td>
                    <td className="py-2 px-3">{r.branch_id}</td>
                    <td className="py-2 px-3 font-sans text-slate-200">{r.technician_name}</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">
                      {r.repair_cost.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'wp_warranty_licenses' && (
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">license_key</th>
                  <th className="py-2.5 px-3">domain</th>
                  <th className="py-2.5 px-3">status</th>
                  <th className="py-2.5 px-3">valid_until</th>
                  <th className="py-2.5 px-3">last_checked_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                <tr className="hover:bg-slate-800/50 transition">
                  <td className="py-2 px-3 text-slate-500">1</td>
                  <td className="py-2 px-3 font-bold text-[#F27D26]">
                    {license.license_key || '(Trống)'}
                  </td>
                  <td className="py-2 px-3">{license.domain}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                      {license.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">{license.expiry_date}</td>
                  <td className="py-2 px-3">{license.last_checked_at}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
