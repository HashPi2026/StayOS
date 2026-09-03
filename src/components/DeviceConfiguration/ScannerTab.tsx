import React, { useState } from 'react';
import { ScannerConfig, ScannerDevice } from '../../types';

interface ScannerTabProps {
  config: ScannerConfig;
  onChange: (updated: ScannerConfig) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SCANNER_MODELS = [
  'AssureID 3000',
  'Regula 7008',
  'DESKO Icon Scanner',
  '3M AT9000',
  'Honeywell Xenon 1900',
  'Plustek SecureScan',
];

export const ScannerTab: React.FC<ScannerTabProps> = ({
  config,
  onChange,
  onShowToast,
}) => {
  // Navigation & View Modes: 'table' or 'fullpage-form'
  const [viewMode, setViewMode] = useState<'table' | 'fullpage-form'>('table');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingScannerId, setEditingScannerId] = useState<string | null>(null);

  // Form State
  const [formModel, setFormModel] = useState<string>('AssureID 3000');
  const [formTerminalName, setFormTerminalName] = useState<string>('');
  const [formIpAddress, setFormIpAddress] = useState<string>('192.168.1.100');
  const [formPort, setFormPort] = useState<string>('8080');

  // Connection testing state inside form / drawer
  const [testConnectionStatus, setTestConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'failed'
  >('idle');
  const [latencyMs, setLatencyMs] = useState<number>(14);

  // Calibration & Driver test states
  const [isCalibrating, setIsCalibrating] = useState<string | null>(null);
  const [isTestingService, setIsTestingService] = useState(false);
  const [showSimulateScanModal, setShowSimulateScanModal] = useState(false);
  const [showOcrRulesModal, setShowOcrRulesModal] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanResultReady, setScanResultReady] = useState(false);

  // Dropdown menu state for table rows
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Open drawer for adding
  const handleOpenAddDrawer = () => {
    setEditingScannerId(null);
    setFormModel('AssureID 3000');
    setFormTerminalName('');
    setFormIpAddress('192.168.1.100');
    setFormPort('8080');
    setTestConnectionStatus('idle');
    setIsDrawerOpen(true);
    setOpenActionMenuId(null);
  };

  // Open fullpage form for adding
  const handleOpenAddFullPage = () => {
    setEditingScannerId(null);
    setFormModel('AssureID 3000');
    setFormTerminalName('');
    setFormIpAddress('192.168.1.100');
    setFormPort('8080');
    setTestConnectionStatus('idle');
    setViewMode('fullpage-form');
    setIsDrawerOpen(false);
    setOpenActionMenuId(null);
  };

  // Open drawer for editing
  const handleOpenEditDrawer = (scanner: ScannerDevice) => {
    setEditingScannerId(scanner.id);
    setFormModel(scanner.model || 'AssureID 3000');
    setFormTerminalName(scanner.station || scanner.name || '');
    setFormIpAddress(scanner.ipAddress || '192.168.1.100');
    setFormPort(scanner.port ? String(scanner.port) : '8080');
    setTestConnectionStatus('idle');
    setIsDrawerOpen(true);
    setOpenActionMenuId(null);
  };

  // Open full page for editing
  const handleOpenEditFullPage = (scanner: ScannerDevice) => {
    setEditingScannerId(scanner.id);
    setFormModel(scanner.model || 'AssureID 3000');
    setFormTerminalName(scanner.station || scanner.name || '');
    setFormIpAddress(scanner.ipAddress || '192.168.1.100');
    setFormPort(scanner.port ? String(scanner.port) : '8080');
    setTestConnectionStatus('idle');
    setViewMode('fullpage-form');
    setIsDrawerOpen(false);
    setOpenActionMenuId(null);
  };

  // Handle connection test
  const handleRunConnectionTest = () => {
    if (!formIpAddress.trim()) {
      onShowToast('Please enter an IP address before testing', 'error');
      setTestConnectionStatus('failed');
      return;
    }
    setTestConnectionStatus('testing');
    setTimeout(() => {
      // Simulate realistic network latency
      const randomLatency = Math.floor(Math.random() * 15) + 8;
      setLatencyMs(randomLatency);
      setTestConnectionStatus('success');
      onShowToast(`Connection verified to ${formIpAddress}:${formPort || '8080'} (${randomLatency}ms)`, 'success');
    }, 850);
  };

  // Save scanner handler (works for both Drawer and Full Page mode)
  const handleSaveScanner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formTerminalName.trim()) {
      onShowToast('Please specify a Terminal Name', 'error');
      return;
    }

    if (!formIpAddress.trim()) {
      onShowToast('Please provide an IP Address', 'error');
      return;
    }

    const portNumber = parseInt(formPort, 10) || 8080;

    if (editingScannerId) {
      // Edit existing scanner
      const updatedList = config.scanners.map((item) => {
        if (item.id === editingScannerId) {
          return {
            ...item,
            name: formTerminalName.trim(),
            station: formTerminalName.trim(),
            model: formModel,
            ipAddress: formIpAddress.trim(),
            port: portNumber,
            status: 'Online' as const,
            lastUsed: 'Just now',
          };
        }
        return item;
      });

      onChange({
        ...config,
        scanners: updatedList,
      });

      onShowToast(`Updated scanner "${formTerminalName.trim()}" successfully`, 'success');
    } else {
      // Add new scanner
      const newDevice: ScannerDevice = {
        id: `scan-${Date.now()}`,
        name: formTerminalName.trim(),
        station: formTerminalName.trim(),
        model: formModel,
        connectionType: 'Network',
        ipAddress: formIpAddress.trim(),
        port: portNumber,
        status: 'Online',
        lastUsed: 'Just added',
      };

      onChange({
        ...config,
        scanners: [...config.scanners, newDevice],
      });

      onShowToast(`Added new scanner "${formTerminalName.trim()}" successfully`, 'success');
    }

    // Close and reset
    setIsDrawerOpen(false);
    setViewMode('table');
  };

  // Remove scanner
  const handleRemoveScanner = (id: string, name: string) => {
    onChange({
      ...config,
      scanners: config.scanners.filter((s) => s.id !== id),
    });
    setOpenActionMenuId(null);
    onShowToast(`Removed scanner "${name}"`, 'info');
  };

  // Calibrate scanner sensor
  const handleCalibrate = (scanner: ScannerDevice) => {
    setIsCalibrating(scanner.id);
    setOpenActionMenuId(null);
    setTimeout(() => {
      setIsCalibrating(null);
      onShowToast(
        `Optical calibration complete for "${scanner.name}". Sensors aligned.`,
        'success'
      );
    }, 900);
  };

  // Start Passport scan simulation
  const handleStartSimulation = () => {
    setIsScanningActive(true);
    setScanResultReady(false);
    setTimeout(() => {
      setIsScanningActive(false);
      setScanResultReady(true);
      if (config.beepOnScan) {
        onShowToast('Scan successful! Passport MRZ parsed and guest photo cropped.', 'success');
      }
    }, 1200);
  };

  // Check duplicate warning
  const isDuplicateConflict = config.scanners.some(
    (s) =>
      s.id !== editingScannerId &&
      (s.station?.toLowerCase() === formTerminalName.trim().toLowerCase() ||
        s.ipAddress === formIpAddress.trim())
  );

  // =========================================================================
  // VIEW MODE: Full Page "Add New Scanner" / "Edit Scanner" (Screenshot 1)
  // =========================================================================
  if (viewMode === 'fullpage-form') {
    return (
      <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[13px] text-[#75859d]">
          <span>Configuration</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Property</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className="hover:text-[#191c1e] transition-colors"
          >
            ID Scanners
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">
            {editingScannerId ? 'Edit Scanner' : 'Add Scanner'}
          </span>
        </nav>

        {/* Page Title & Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="w-9 h-9 rounded-lg border border-[#c6c6cd]/50 hover:bg-[#f2f4f6] flex items-center justify-center text-[#45464d] transition-colors"
              title="Return to list"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h2 className="text-[26px] font-bold text-[#191c1e] tracking-tight">
              {editingScannerId ? 'Edit Scanner' : 'Add New Scanner'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setViewMode('table');
              setIsDrawerOpen(true);
            }}
            className="text-[13px] text-[#0058be] hover:underline flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
            <span>Switch to Drawer View</span>
          </button>
        </div>

        {/* Form Body - Constrained Width matching Screenshot 1 */}
        <div className="max-w-3xl space-y-6">
          {/* Card 1: Scanner Identity */}
          <div className="bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs p-6 flex flex-col gap-5">
            <h3 className="text-[16px] font-bold text-[#191c1e] pb-1 border-b border-[#eceef0]">
              Scanner Identity
            </h3>

            {/* Field: Model/Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#191c1e]">
                ID Scanner Model/Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full appearance-none bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 pr-10 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all font-medium"
                >
                  <option value="" disabled>Select a scanner model...</option>
                  {SCANNER_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Field: Terminal Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#191c1e]">
                Terminal Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formTerminalName}
                onChange={(e) => setFormTerminalName(e.target.value)}
                placeholder="e.g., Front Desk 1"
                className="w-full bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all"
              />
              <span className="text-[12px] text-[#75859d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Must be unique within the property.
              </span>
            </div>
          </div>

          {/* Card 2: Network Configuration */}
          <div className="bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs p-6 flex flex-col gap-5">
            <h3 className="text-[16px] font-bold text-[#191c1e] pb-1 border-b border-[#eceef0]">
              Network Configuration
            </h3>

            {/* IP Address & Port Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#191c1e]">
                  IP Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formIpAddress}
                  onChange={(e) => {
                    setFormIpAddress(e.target.value);
                    setTestConnectionStatus('idle');
                  }}
                  placeholder="192.168.1.100"
                  className="w-full bg-[#f2f4f6] text-[#191c1e] font-mono text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all tracking-wider"
                />
                <span className="text-[12px] text-[#75859d]">IPv4 format.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#191c1e]">Port</label>
                <input
                  type="text"
                  value={formPort}
                  onChange={(e) => {
                    setFormPort(e.target.value);
                    setTestConnectionStatus('idle');
                  }}
                  placeholder="8080"
                  className="w-full bg-[#f2f4f6] text-[#191c1e] font-mono text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all tracking-wider"
                />
              </div>
            </div>

            {/* Connection Utility Box */}
            <div className="bg-[#f7f9fb] rounded-lg p-4 border border-[#eceef0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[13px]">
                {testConnectionStatus === 'idle' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a0a5ab]"></span>
                    <span className="text-[#555a60] font-medium">Not Tested</span>
                  </>
                )}
                {testConnectionStatus === 'testing' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0058be] animate-ping"></span>
                    <span className="text-[#0058be] font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                      Attempting connection to {formIpAddress}...
                    </span>
                  </>
                )}
                {testConnectionStatus === 'success' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <span className="text-[#065f46] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Connection Successful ({latencyMs}ms latency)
                    </span>
                  </>
                )}
                {testConnectionStatus === 'failed' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                    <span className="text-[#ba1a1a] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      Connection Failed - Host Unreachable
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={testConnectionStatus === 'testing'}
                onClick={handleRunConnectionTest}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#c6c6cd] hover:bg-[#eceef0] text-[#191c1e] rounded-lg text-[13px] font-semibold transition-colors shadow-2xs self-start sm:self-auto"
              >
                <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`}>
                  wifi_tethering
                </span>
                <span>{testConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Validation Reminder Warning Box */}
            <div className="bg-[#fff4e5] rounded-lg p-3.5 flex items-start gap-2.5 border border-[#ffd8a8]">
              <span className="material-symbols-outlined text-[#d97706] text-[20px] shrink-0 mt-0.5">
                warning
              </span>
              <p className="text-[12px] text-[#78350f] leading-relaxed">
                Ensure the combination of <strong>Terminal Name</strong> and <strong>IP Address</strong> does not conflict with existing scanners.
              </p>
            </div>

            {isDuplicateConflict && (
              <div className="bg-[#ffebe9] rounded-lg p-3.5 flex items-start gap-2.5 border border-[#ffc1ba]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] shrink-0 mt-0.5">
                  error
                </span>
                <p className="text-[12px] text-[#93000a] leading-relaxed">
                  Notice: Another scanner is currently assigned to this Terminal Name or IP Address. Proceeding will overwrite its hardware routing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer with Cancel & Save */}
        <div className="fixed bottom-0 right-0 left-0 md:left-[240px] bg-white/95 backdrop-blur-md border-t border-[#eceef0] py-3.5 px-8 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className="px-5 py-2 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#eceef0] transition-colors text-[13px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveScanner()}
            className="px-6 py-2 rounded-lg bg-[#000000] text-white hover:bg-[#2d3133] shadow-sm transition-all text-[13px] font-semibold flex items-center gap-1.5 active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Scanner</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: Table List with Drawer (Screenshot 2)
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 relative">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[13px] text-[#75859d]">
        <span>Configuration</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span>Property</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-[#191c1e] font-semibold">ID Scanners</span>
      </nav>

      {/* Main Header with Title & Add Scanner Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold text-[#191c1e] tracking-tight">
            Scanner Configuration
          </h2>
          <p className="text-[13px] text-[#75859d] mt-0.5">
            Manage ID and passport scanners assigned to front desk workstations, kiosks, and back office terminals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSimulateScanModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#c6c6cd] hover:bg-[#eceef0] text-[#191c1e] rounded-lg text-[13px] font-semibold transition-colors shadow-2xs"
            title="Simulate Passport Reader scan with MRZ parsing"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0058be]">
              center_focus_strong
            </span>
            <span>Test Scan Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOcrRulesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#c6c6cd] hover:bg-[#eceef0] text-[#191c1e] rounded-lg text-[13px] font-semibold transition-colors shadow-2xs"
            title="Configure OCR auto-crop, MRZ fields, and UV verification"
          >
            <span className="material-symbols-outlined text-[18px] text-[#75859d]">
              tune
            </span>
            <span>OCR Rules</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddDrawer}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-[#2d3133] transition-colors shadow-xs active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Scanner</span>
          </button>
        </div>
      </div>

      {/* Scanners Table Card (matching Screenshot 2) */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9fb] border-b border-[#eceef0] text-[#75859d] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-5">ID Scanner Model/Type</th>
                <th className="py-3 px-5">Terminal Name</th>
                <th className="py-3 px-5">IP Address</th>
                <th className="py-3 px-5">Port</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] text-[13px]">
              {config.scanners.map((scanner) => {
                const isOnline = scanner.status === 'Online' || scanner.status === 'Ready';
                return (
                  <tr
                    key={scanner.id}
                    onClick={() => handleOpenEditDrawer(scanner)}
                    className="hover:bg-[#f7f9fb] transition-colors cursor-pointer group"
                  >
                    {/* Model / Type Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isOnline ? 'text-[#0058be]' : 'text-[#75859d]'
                          }`}
                        >
                          scanner
                        </span>
                        <span className="font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                          {scanner.model || 'AssureID 3000'}
                        </span>
                      </div>
                    </td>

                    {/* Terminal Name */}
                    <td className="py-4 px-5 text-[#45464d] font-medium">
                      {scanner.station || scanner.name}
                    </td>

                    {/* IP Address */}
                    <td className="py-4 px-5 font-mono text-[13px] text-[#191c1e] tracking-wide">
                      {scanner.ipAddress || '192.168.1.100'}
                    </td>

                    {/* Port */}
                    <td className="py-4 px-5 font-mono text-[13px] text-[#75859d]">
                      {scanner.port || 8080}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isOnline
                            ? 'bg-[#e6f4ea] text-[#065f46]'
                            : 'bg-[#f2f4f6] text-[#75859d]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-[#10b981]' : 'bg-[#a0a5ab]'
                          }`}
                        />
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td
                      className="py-4 px-5 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionMenuId(
                            openActionMenuId === scanner.id ? null : scanner.id
                          )
                        }
                        className="p-1.5 rounded-lg text-[#75859d] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
                        title="More options"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {openActionMenuId === scanner.id && (
                        <div className="absolute right-5 top-12 z-30 bg-white border border-[#c6c6cd]/60 rounded-xl shadow-lg py-1 w-44 text-left text-[13px] animate-in fade-in duration-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(scanner)}
                            className="w-full px-3 py-2 hover:bg-[#f2f4f6] text-[#191c1e] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[17px] text-[#75859d]">
                              edit
                            </span>
                            <span>Edit in Drawer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFullPage(scanner)}
                            className="w-full px-3 py-2 hover:bg-[#f2f4f6] text-[#191c1e] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[17px] text-[#75859d]">
                              open_in_full
                            </span>
                            <span>Edit Full Page</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCalibrate(scanner)}
                            disabled={isCalibrating === scanner.id}
                            className="w-full px-3 py-2 hover:bg-[#f2f4f6] text-[#0058be] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              tune
                            </span>
                            <span>{isCalibrating === scanner.id ? 'Calibrating...' : 'Calibrate'}</span>
                          </button>
                          <div className="h-px bg-[#eceef0] my-1" />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveScanner(
                                scanner.id,
                                scanner.station || scanner.name
                              )
                            }
                            className="w-full px-3 py-2 hover:bg-[#ffebe9] text-[#ba1a1a] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              delete
                            </span>
                            <span>Delete Scanner</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {config.scanners.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#75859d]">
                    <span className="material-symbols-outlined text-[36px] text-[#c6c6cd] block mb-2">
                      document_scanner
                    </span>
                    <p className="font-semibold text-[#191c1e]">No scanners registered</p>
                    <p className="text-[12px] mt-0.5">Click "+ Add Scanner" to pair an ID or passport reader.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Info Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#c6c6cd]/50 text-[13px] text-[#75859d]">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[#191c1e] font-bold">
              {config.scanners.filter((s) => s.status === 'Online' || s.status === 'Ready').length}
            </span>{' '}
            of <span className="text-[#191c1e] font-bold">{config.scanners.length}</span> scanners online
          </div>
          <div className="h-4 w-px bg-[#eceef0]" />
          <div>
            Active Driver Engine:{' '}
            <span className="text-[#191c1e] font-semibold capitalize">
              {config.provider.replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddFullPage}
          className="text-[#0058be] hover:underline font-semibold flex items-center gap-1"
        >
          <span>Open Full Page Form Mode</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* SLIDE-OVER DRAWER (matching Screenshot 2) */}
      {/* =================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-[480px] bg-white shadow-2xl flex flex-col justify-between border-l border-[#eceef0] animate-in slide-in-from-right duration-250">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#191c1e]">
                    {editingScannerId ? 'Edit Scanner' : 'Add New Scanner'}
                  </h3>
                  <p className="text-[12px] text-[#75859d] mt-0.5">
                    Configure hardware connection and station routing
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setViewMode('fullpage-form');
                    }}
                    className="p-1.5 rounded-lg text-[#75859d] hover:text-[#191c1e] hover:bg-[#f2f4f6]"
                    title="Expand to Full Page Form"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      open_in_full
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-[#75859d] hover:text-[#191c1e] hover:bg-[#f2f4f6]"
                    title="Close"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      close
                    </span>
                  </button>
                </div>
              </div>

              {/* Drawer Body Form */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5 flex-1 text-[13px]">
                {/* Field: Model/Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#191c1e]">
                    ID Scanner Model/Type <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full appearance-none bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 pr-10 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all font-medium"
                    >
                      {SCANNER_MODELS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Field: Terminal Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#191c1e]">
                    Terminal Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTerminalName}
                    onChange={(e) => setFormTerminalName(e.target.value)}
                    placeholder="e.g., Front Desk 1"
                    className="w-full bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all"
                  />
                  <span className="text-[12px] text-[#75859d]">
                    Must be unique within the property.
                  </span>
                </div>

                {/* IP Address & Port (2 cols) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[#191c1e]">
                      IP Address <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formIpAddress}
                      onChange={(e) => {
                        setFormIpAddress(e.target.value);
                        setTestConnectionStatus('idle');
                      }}
                      placeholder="192.168.1.100"
                      className="w-full bg-[#f2f4f6] text-[#191c1e] font-mono text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[#191c1e]">Port</label>
                    <input
                      type="text"
                      value={formPort}
                      onChange={(e) => {
                        setFormPort(e.target.value);
                        setTestConnectionStatus('idle');
                      }}
                      placeholder="8080"
                      className="w-full bg-[#f2f4f6] text-[#191c1e] font-mono text-[14px] rounded-lg py-2.5 px-3.5 border border-transparent focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Diagnostic Connection Box */}
                <div className="bg-[#f7f9fb] rounded-xl p-4 border border-[#eceef0] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">
                      Connection Diagnostic
                    </span>
                    <button
                      type="button"
                      disabled={testConnectionStatus === 'testing'}
                      onClick={handleRunConnectionTest}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#c6c6cd] hover:bg-[#eceef0] text-[#191c1e] rounded-lg text-[12px] font-semibold transition-colors shadow-2xs"
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] text-[#0058be] ${
                          testConnectionStatus === 'testing' ? 'animate-spin' : ''
                        }`}
                      >
                        wifi_tethering
                      </span>
                      <span>{testConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {testConnectionStatus === 'idle' && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a0a5ab]" />
                        <span className="text-[#75859d] text-[12px]">Status: Not Tested</span>
                      </>
                    )}
                    {testConnectionStatus === 'testing' && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0058be] animate-ping" />
                        <span className="text-[#0058be] text-[12px] font-medium">
                          Pinging {formIpAddress}:{formPort || '8080'}...
                        </span>
                      </>
                    )}
                    {testConnectionStatus === 'success' && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span className="text-[#065f46] text-[12px] font-semibold">
                          Connection Successful ({latencyMs}ms response)
                        </span>
                      </>
                    )}
                    {testConnectionStatus === 'failed' && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                        <span className="text-[#ba1a1a] text-[12px] font-semibold">
                          Connection Failed - Host Unreachable
                        </span>
                      </>
                    )}
                  </div>

                  {/* Diagnostic Graphic / Visual wave */}
                  <div className="h-8 w-full bg-[#e0ecfc]/30 rounded flex items-center justify-around px-2 overflow-hidden">
                    {[40, 65, 85, 30, 95, 70, 50, 80, 45, 90, 60, 75].map((h, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          testConnectionStatus === 'success'
                            ? 'bg-[#10b981]'
                            : testConnectionStatus === 'testing'
                            ? 'bg-[#0058be] animate-pulse'
                            : 'bg-[#c6c6cd]'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Validation Reminder */}
                <div className="bg-[#fff4e5] rounded-lg p-3 flex items-start gap-2 border border-[#ffd8a8]">
                  <span className="material-symbols-outlined text-[#d97706] text-[18px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <p className="text-[12px] text-[#78350f]">
                    Ensure Terminal Name and IP Address do not conflict with active workstations.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-[#eceef0] bg-[#f7f9fb] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#eceef0] text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveScanner()}
                  className="px-5 py-2 rounded-lg bg-[#000000] text-white hover:bg-[#2d3133] text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Scanner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: Interactive Document Scan Simulation */}
      {/* =================================================================== */}
      {showSimulateScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#c6c6cd]/50 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">
                  document_scanner
                </span>
                <h4 className="text-[16px] font-bold text-[#191c1e]">
                  Optical Passport Reader Simulation
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateScanModal(false)}
                className="text-[#75859d] hover:text-black"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Passport Reader Graphic */}
            <div className="relative bg-[#1a2332] rounded-xl p-5 text-white flex flex-col gap-4 overflow-hidden border border-[#2d3b52] shadow-inner">
              {isScanningActive && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent shadow-[0_0_12px_#00e5ff] animate-bounce" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
                  <span className="text-[12px] tracking-wider uppercase text-[#8899ac] font-semibold">
                    {isScanningActive
                      ? 'Scanning (UV / Infrared / White Light)'
                      : 'Flatbed Platen Ready'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8899ac]">ICAO 9303</span>
              </div>

              {/* Passport Representation */}
              <div className="bg-[#f7f9fa] text-[#191c1e] rounded-lg p-4 shadow-md flex flex-col gap-3 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 bg-[#e0ecfc] rounded border border-[#0058be]/30 flex flex-col items-center justify-center text-[#0058be]">
                      <span className="material-symbols-outlined text-[28px]">person</span>
                      <span className="text-[8px] font-semibold uppercase">Photo</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#75859d] block font-bold">
                        Passport / Passeport
                      </span>
                      <h5 className="text-[15px] font-bold leading-tight">
                        MORGAN, ALEXANDER JAMES
                      </h5>
                      <span className="text-[12px] text-[#45464d] font-medium">
                        United Kingdom (GBR)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#75859d] block font-bold">
                      Doc No.
                    </span>
                    <span className="font-mono text-[14px] font-bold text-[#0058be]">
                      928341092
                    </span>
                  </div>
                </div>

                {/* Machine Readable Zone (MRZ) */}
                <div className="bg-[#191c1e] text-[#00ff88] p-2.5 rounded font-mono text-[11px] leading-tight tracking-wider select-all overflow-x-auto">
                  <div>P&lt;GBRMORGAN&lt;&lt;ALEXANDER&lt;JAMES&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                  <div>9283410928GBR8804147M2909224&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
                </div>
              </div>
            </div>

            {/* Extracted Fields Preview */}
            {scanResultReady && (
              <div className="bg-[#e6f4ea] border border-[#34a853]/30 rounded-xl p-4 flex flex-col gap-2 text-[12px] animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-[#137333]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Passport Authenticity Verified & Data Extracted</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#191c1e] pt-1">
                  <div><span className="text-[#5f6368]">Given Name:</span> <strong>Alexander James</strong></div>
                  <div><span className="text-[#5f6368]">Surname:</span> <strong>Morgan</strong></div>
                  <div><span className="text-[#5f6368]">Birthdate:</span> <strong>14 Apr 1988</strong></div>
                  <div><span className="text-[#5f6368]">Expiry Date:</span> <strong>22 Sep 2029 (Valid)</strong></div>
                  <div><span className="text-[#5f6368]">Nationality:</span> <strong>British</strong></div>
                  <div><span className="text-[#5f6368]">Security Hologram:</span> <strong className="text-[#137333]">Passed (100%)</strong></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#eceef0]">
              <button
                type="button"
                onClick={() => setShowSimulateScanModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-[#45464d] hover:bg-[#eceef0]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isScanningActive}
                onClick={handleStartSimulation}
                className="px-4 py-2 rounded-lg font-semibold bg-[#0058be] text-white hover:bg-[#004ba3] flex items-center gap-2 shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">
                  document_scanner
                </span>
                <span>{isScanningActive ? 'Reading Document...' : 'Trigger Scan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: OCR Rules & Driver Preferences */}
      {/* =================================================================== */}
      {showOcrRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#c6c6cd]/50 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">
                  tune
                </span>
                <h4 className="text-[16px] font-bold text-[#191c1e]">
                  OCR Extraction & Driver Integration
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowOcrRulesModal(false)}
                className="text-[#75859d] hover:text-black"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Provider selector */}
            <div>
              <label className="text-[13px] font-semibold text-[#191c1e] block mb-2">
                Hardware Driver Engine
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'regula', name: 'Regula Forensics' },
                  { id: 'plustek', name: 'Plustek SecureScan' },
                  { id: 'honeywell', name: 'Honeywell Xenon' },
                  { id: 'zebra', name: 'Zebra Technologies' },
                  { id: 'camera_ocr', name: 'Camera AI OCR' },
                ].map((p) => {
                  const selected = config.provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChange({ ...config, provider: p.id as any })}
                      className={`p-2.5 rounded-lg border text-left text-[12px] font-medium transition-all ${
                        selected
                          ? 'border-[#0058be] bg-[#e0ecfc]/50 text-[#0058be] font-bold ring-1 ring-[#0058be]'
                          : 'border-[#c6c6cd]/50 hover:bg-[#f2f4f6] text-[#45464d]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes for OCR rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-[#eceef0] hover:bg-[#f7f9fb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoFillGuestProfile}
                  onChange={(e) =>
                    onChange({ ...config, autoFillGuestProfile: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-black mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-[#191c1e]">
                    Auto-Fill Profile from MRZ
                  </span>
                  <span className="text-[11px] text-[#75859d]">
                    Populate name, birthdate, and passport number automatically.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-[#eceef0] hover:bg-[#f7f9fb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCropGuestPhoto}
                  onChange={(e) =>
                    onChange({ ...config, autoCropGuestPhoto: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-black mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-[#191c1e]">
                    Auto-Crop Facial Photo
                  </span>
                  <span className="text-[11px] text-[#75859d]">
                    Crop passport portrait directly into guest avatar profile.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-[#eceef0] hover:bg-[#f7f9fb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.verifyAuthenticityUv}
                  onChange={(e) =>
                    onChange({ ...config, verifyAuthenticityUv: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-black mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-[#191c1e]">
                    UV & Hologram Inspection
                  </span>
                  <span className="text-[11px] text-[#75859d]">
                    Check document security against ICAO counterfeit rules.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-[#eceef0] hover:bg-[#f7f9fb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.beepOnScan}
                  onChange={(e) =>
                    onChange({ ...config, beepOnScan: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-black mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-[#191c1e]">
                    Audio Feedback Beep
                  </span>
                  <span className="text-[11px] text-[#75859d]">
                    Play positive chime upon valid document scan.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#eceef0]">
              <button
                type="button"
                onClick={() => setShowOcrRulesModal(false)}
                className="px-4 py-2 rounded-lg font-semibold bg-[#000000] text-white hover:bg-[#2d3133] text-[13px]"
              >
                Apply Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
