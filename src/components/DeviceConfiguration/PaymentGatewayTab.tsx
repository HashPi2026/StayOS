import React, { useState, useMemo } from 'react';
import { PaymentGatewayConfig, PaymentTerminalDevice } from '../../types';

interface PaymentGatewayTabProps {
  config: PaymentGatewayConfig;
  onChange: (updated: PaymentGatewayConfig) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PaymentGatewayTab: React.FC<PaymentGatewayTabProps> = ({
  config,
  onChange,
  onShowToast,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View state: 'table' or 'full-page-form'
  const [viewMode, setViewMode] = useState<'table' | 'full-page-form'>('table');

  // Drawer / Modal state for Add/Edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTerminalId, setEditingTerminalId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    gatewayProvider: string;
    name: string;
    terminalId: string;
    serialNumber: string;
    locationId: string;
    ipAddress: string;
    readerId: string;
    port: number | string;
    networkType: 'router' | 'wifi' | 'lan';
  }>({
    gatewayProvider: 'stripe',
    name: '',
    terminalId: '',
    serialNumber: '',
    locationId: '',
    ipAddress: '192.168.1.',
    readerId: '',
    port: 8080,
    networkType: 'router',
  });

  // Test connection state in form
  const [testConnectionStatus, setTestConnectionStatus] = useState<
    'not_tested' | 'testing' | 'success' | 'failed'
  >('not_tested');
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Quick ping testing per row
  const [testingPingId, setTestingPingId] = useState<string | null>(null);

  // Settings section toggle
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Metrics computation
  const activeCount = useMemo(
    () => config.terminals.filter((t) => t.status === 'Online').length,
    [config.terminals]
  );
  const issueCount = useMemo(
    () => config.terminals.filter((t) => t.status === 'Offline').length,
    [config.terminals]
  );
  const totalGatewaysCount = useMemo(() => {
    const providers = new Set(
      config.terminals.map((t) => (t.gatewayProvider || config.provider).toLowerCase())
    );
    return Math.max(providers.size, 3);
  }, [config.terminals, config.provider]);

  // Filtered terminals
  const filteredTerminals = useMemo(() => {
    let result = config.terminals;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.terminalId && t.terminalId.toLowerCase().includes(q)) ||
          t.serialNumber.toLowerCase().includes(q) ||
          t.ipAddress.toLowerCase().includes(q) ||
          (t.gatewayProvider && t.gatewayProvider.toLowerCase().includes(q)) ||
          (t.location && t.location.toLowerCase().includes(q))
      );
    }
    return result;
  }, [config.terminals, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTerminals.length / itemsPerPage));
  const paginatedTerminals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTerminals.slice(start, start + itemsPerPage);
  }, [filteredTerminals, currentPage, itemsPerPage]);

  // Check duplicate Terminal ID in form
  const isDuplicateTerminalId = useMemo(() => {
    if (!formData.terminalId.trim()) return false;
    return config.terminals.some(
      (t) =>
        t.terminalId?.toLowerCase() === formData.terminalId.trim().toLowerCase() &&
        t.id !== editingTerminalId
    );
  }, [formData.terminalId, config.terminals, editingTerminalId]);

  // Open Drawer or Full Form for Adding
  const handleOpenAdd = (asFullPage = false) => {
    setEditingTerminalId(null);
    setFormData({
      gatewayProvider: config.provider || 'stripe',
      name: '',
      terminalId: `tm_FD0${config.terminals.length + 1}_${Math.floor(100 + Math.random() * 900)}`,
      serialNumber: '',
      locationId: '',
      ipAddress: '192.168.1.100',
      readerId: '',
      port: 8080,
      networkType: 'router',
    });
    setTestConnectionStatus('not_tested');
    setTestLatency(null);

    if (asFullPage) {
      setViewMode('full-page-form');
    } else {
      setIsDrawerOpen(true);
    }
  };

  // Open Drawer or Full Form for Editing
  const handleOpenEdit = (terminal: PaymentTerminalDevice, asFullPage = false) => {
    setEditingTerminalId(terminal.id);
    setFormData({
      gatewayProvider: terminal.gatewayProvider || config.provider || 'stripe',
      name: terminal.name,
      terminalId: terminal.terminalId || terminal.id,
      serialNumber: terminal.serialNumber,
      locationId: terminal.locationId || '',
      ipAddress: terminal.ipAddress,
      readerId: terminal.readerId || '',
      port: terminal.port,
      networkType: terminal.networkType || (terminal.ipAddress.startsWith('10.') ? 'wifi' : 'router'),
    });
    setTestConnectionStatus(terminal.status === 'Online' ? 'success' : 'failed');
    setTestLatency(terminal.status === 'Online' ? 24 : null);

    if (asFullPage) {
      setViewMode('full-page-form');
    } else {
      setIsDrawerOpen(true);
    }
  };

  // Close Form
  const handleCloseForm = () => {
    setIsDrawerOpen(false);
    setViewMode('table');
    setEditingTerminalId(null);
  };

  // Test connection within form
  const handleTestConnectionInForm = () => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      // If IP is offline sample or ends in 150, simulate failure, else success
      if (formData.ipAddress.includes('.150') || formData.ipAddress.endsWith('.0')) {
        setTestConnectionStatus('failed');
        setTestLatency(null);
        onShowToast(`Failed to connect to ${formData.ipAddress}:${formData.port}. Host unreachable.`, 'error');
      } else {
        const latency = Math.floor(Math.random() * 30) + 12;
        setTestConnectionStatus('success');
        setTestLatency(latency);
        onShowToast(`Connected successfully! Ping latency: ${latency}ms`, 'success');
      }
    }, 700);
  };

  // Save Terminal
  const handleSaveTerminal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      onShowToast('Please provide a terminal name', 'error');
      return;
    }
    if (isDuplicateTerminalId) {
      onShowToast('Terminal ID already exists. Please choose a unique identifier.', 'error');
      return;
    }

    const portNum = Number(formData.port) || 8080;
    const isOffline = formData.ipAddress.includes('.150') || testConnectionStatus === 'failed';

    if (editingTerminalId) {
      // Update existing
      const updated = config.terminals.map((t) => {
        if (t.id === editingTerminalId) {
          return {
            ...t,
            name: formData.name.trim(),
            gatewayProvider: formData.gatewayProvider,
            terminalId: formData.terminalId.trim(),
            serialNumber: formData.serialNumber.trim() || t.serialNumber,
            locationId: formData.locationId.trim() || t.locationId,
            ipAddress: formData.ipAddress.trim(),
            port: portNum,
            readerId: formData.readerId.trim() || undefined,
            networkType: formData.networkType,
            status: isOffline ? ('Offline' as const) : ('Online' as const),
            lastPing: 'Just now',
          };
        }
        return t;
      });
      onChange({ ...config, terminals: updated });
      onShowToast(`Terminal "${formData.name}" updated successfully`, 'success');
    } else {
      // Create new
      const newTerm: PaymentTerminalDevice = {
        id: `term-${Date.now()}`,
        name: formData.name.trim(),
        gatewayProvider: formData.gatewayProvider,
        terminalId: formData.terminalId.trim() || `TID-${Math.floor(10000000 + Math.random() * 90000000)}`,
        serialNumber: formData.serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        locationId: formData.locationId.trim() || `loc_${Math.floor(100 + Math.random() * 900)}`,
        ipAddress: formData.ipAddress.trim() || '192.168.1.100',
        port: portNum,
        readerId: formData.readerId.trim() || undefined,
        networkType: formData.networkType,
        status: isOffline ? 'Offline' : 'Online',
        batteryLevel: 100,
        lastPing: 'Just now',
      };
      onChange({ ...config, terminals: [newTerm, ...config.terminals] });
      onShowToast(`Terminal "${newTerm.name}" registered successfully`, 'success');
    }

    handleCloseForm();
  };

  // Delete terminal
  const handleDeleteTerminal = (id: string, name: string) => {
    onChange({
      ...config,
      terminals: config.terminals.filter((t) => t.id !== id),
    });
    onShowToast(`Deleted terminal "${name}"`, 'info');
  };

  // Ping terminal in table
  const handlePingTableTerminal = (terminal: PaymentTerminalDevice) => {
    setTestingPingId(terminal.id);
    setTimeout(() => {
      setTestingPingId(null);
      if (terminal.status === 'Offline') {
        onShowToast(`Host ${terminal.ipAddress}:${terminal.port} is offline or unreachable`, 'error');
      } else {
        const latency = Math.floor(Math.random() * 25) + 12;
        onShowToast(`Ping response from ${terminal.name} (${terminal.ipAddress}): ${latency}ms`, 'success');
        const updated = config.terminals.map((t) =>
          t.id === terminal.id ? { ...t, lastPing: 'Just now', status: 'Online' as const } : t
        );
        onChange({ ...config, terminals: updated });
      }
    }, 600);
  };

  // Provider logo badge helper
  const getProviderBadge = (providerStr?: string) => {
    const p = (providerStr || config.provider || 'stripe').toLowerCase();
    if (p.includes('stripe')) {
      return { code: 'ST', label: 'Stripe Terminal', bg: 'bg-[#635BFF]/10', text: 'text-[#635BFF]' };
    }
    if (p.includes('adyen')) {
      return { code: 'AD', label: 'Adyen', bg: 'bg-[#0ABF53]/10', text: 'text-[#0ABF53]' };
    }
    if (p.includes('clover')) {
      return { code: 'CL', label: 'Clover', bg: 'bg-[#45464d]/10', text: 'text-[#191c1e]' };
    }
    if (p.includes('square')) {
      return { code: 'SQ', label: 'Square Terminal', bg: 'bg-black/10', text: 'text-black' };
    }
    if (p.includes('worldpay')) {
      return { code: 'WP', label: 'Worldpay', bg: 'bg-[#0058be]/10', text: 'text-[#0058be]' };
    }
    return { code: 'PG', label: 'Gateway POS', bg: 'bg-surface-variant', text: 'text-on-surface-variant' };
  };

  // Full Page Form View
  if (viewMode === 'full-page-form') {
    return (
      <div className="flex flex-col w-full relative -mt-4 -mx-2">
        {/* Sticky Header with breadcrumb */}
        <div className="px-6 py-4 w-full bg-surface/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-1 text-[13px] text-on-surface-variant font-medium">
              <span className="hover:text-primary transition-colors cursor-pointer" onClick={handleCloseForm}>
                Configuration
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="hover:text-primary transition-colors cursor-pointer" onClick={handleCloseForm}>
                Property
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="hover:text-primary transition-colors cursor-pointer" onClick={handleCloseForm}>
                Payment Gateway
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-semibold">
                {editingTerminalId ? 'Edit Terminal' : 'Add Terminal'}
              </span>
            </nav>
            <h1 className="text-[24px] font-bold text-on-surface tracking-tight">
              {editingTerminalId ? 'Edit Terminal' : 'Add New Terminal'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                setIsDrawerOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg border border-outline-variant text-[13px] font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">side_navigation</span>
              <span>Open in Side Drawer</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6 pb-32">
          {/* Card 1: Gateway Identity */}
          <div className="flex flex-col gap-4 bg-white shadow-sm border border-outline-variant/40 rounded-xl p-6 transition-shadow hover:shadow-md">
            <h2 className="text-[17px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              Gateway Identity
            </h2>
            <div className="w-full max-w-md">
              <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5" htmlFor="full_gateway_name">
                Payment Gateway Provider <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="full_gateway_name"
                  value={formData.gatewayProvider}
                  onChange={(e) => setFormData({ ...formData, gatewayProvider: e.target.value })}
                  className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-3.5 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all cursor-pointer pr-10"
                >
                  <option value="stripe">Stripe Terminal</option>
                  <option value="adyen">Adyen</option>
                  <option value="clover">Clover</option>
                  <option value="worldpay">Worldpay</option>
                  <option value="square">Square Terminal</option>
                  <option value="pax">Pax Payment</option>
                  <option value="verifone">Verifone Point</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Terminal Details */}
          <div className="flex flex-col gap-4 bg-white shadow-sm border border-outline-variant/40 rounded-xl p-6 transition-shadow hover:shadow-md">
            <h2 className="text-[17px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">point_of_sale</span>
              Terminal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_terminal_name">
                  Terminal Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="full_terminal_name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Front Desk Left"
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
                <span className="text-[12px] text-on-surface-variant/70">
                  A friendly name to identify this terminal in reports.
                </span>
              </div>

              {/* Terminal ID with validation */}
              <div className="flex flex-col gap-1 bg-surface p-3.5 rounded-lg border border-outline-variant/40 relative">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_terminal_id">
                  Terminal ID
                </label>
                <input
                  id="full_terminal_id"
                  type="text"
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  placeholder="TID-XXXXXXXX"
                  className={`w-full bg-transparent border-none rounded px-1 py-1 text-[14px] font-mono text-on-surface focus:outline-none focus:bg-surface-container transition-all ${
                    isDuplicateTerminalId ? 'text-[#ba1a1a]' : ''
                  }`}
                />
                {isDuplicateTerminalId && (
                  <div className="flex items-center gap-1 text-[#ba1a1a] text-[12px] mt-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>Duplicate Terminal ID detected</span>
                  </div>
                )}
              </div>

              {/* Hardware Serial Number */}
              <div className="flex flex-col gap-1 bg-surface p-3.5 rounded-lg border border-outline-variant/40">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_serial_number">
                  Hardware Serial Number
                </label>
                <input
                  id="full_serial_number"
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="S/N: 000000000"
                  className="w-full bg-transparent border-none rounded px-1 py-1 text-[14px] font-mono text-on-surface focus:outline-none focus:bg-surface-container transition-all"
                />
              </div>

              {/* Location ID */}
              <div className="flex flex-col gap-1 bg-surface p-3.5 rounded-lg border border-outline-variant/40 md:col-span-2">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_location_id">
                  Location ID
                </label>
                <input
                  id="full_location_id"
                  type="text"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  placeholder="loc_xxxxxxxxxxxxx"
                  className="w-full bg-transparent border-none rounded px-1 py-1 text-[14px] font-mono text-on-surface focus:outline-none focus:bg-surface-container transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Network Configuration */}
          <div className="flex flex-col gap-4 bg-white shadow-sm border border-outline-variant/40 rounded-xl p-6 transition-shadow hover:shadow-md relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-[17px] font-bold text-on-surface flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary text-[20px]">lan</span>
              Network Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <div className="flex flex-col gap-1">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_ip_address">
                  IP Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    lan
                  </span>
                  <input
                    id="full_ip_address"
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-[14px] font-mono text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_reader_id">
                  Reader ID (Network)
                </label>
                <input
                  id="full_reader_id"
                  type="text"
                  value={formData.readerId}
                  onChange={(e) => setFormData({ ...formData, readerId: e.target.value })}
                  placeholder="reader_xxxx"
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="block text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="full_port">
                  Port
                </label>
                <input
                  id="full_port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="7100"
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
            </div>

            {/* Live Connection Status Card */}
            <div className="mt-2 p-4 bg-surface-container rounded-lg border border-outline-variant/50 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    testConnectionStatus === 'success'
                      ? 'bg-[#e6f4ea] text-[#137333]'
                      : testConnectionStatus === 'failed'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : testConnectionStatus === 'testing'
                      ? 'bg-[#e0ecfc] text-[#0058be] animate-pulse'
                      : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {testConnectionStatus === 'success'
                      ? 'wifi'
                      : testConnectionStatus === 'failed'
                      ? 'wifi_off'
                      : testConnectionStatus === 'testing'
                      ? 'sensors'
                      : 'cell_tower'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-on-surface">Connection Status</span>
                  <span className="text-[12px] text-on-surface-variant">
                    {testConnectionStatus === 'success'
                      ? `Active (Connected - Latency: ${testLatency}ms)`
                      : testConnectionStatus === 'failed'
                      ? 'Connection Failed / Device Unreachable'
                      : testConnectionStatus === 'testing'
                      ? 'Pinging terminal over local network...'
                      : 'Not Tested'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnectionInForm}
                disabled={testConnectionStatus === 'testing'}
                className="px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-highest hover:border-outline transition-colors text-[13px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`}>
                  cell_tower
                </span>
                <span>{testConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 md:left-[240px] right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 flex justify-end gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40">
          <button
            type="button"
            onClick={handleCloseForm}
            className="px-6 py-2.5 rounded-lg text-on-surface hover:bg-surface-container-highest transition-colors font-semibold text-[14px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveTerminal()}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm font-semibold text-[14px] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Save Terminal</span>
          </button>
        </div>
      </div>
    );
  }

  // Primary Table View matching Screenshot 1
  return (
    <div className="flex flex-col w-full relative" id="payment-gateway-app">
      {/* Page Header matching mockup */}
      <div className="py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 sticky top-0 bg-[#f7f9fb]/90 backdrop-blur-md pb-4">
        <div>
          <div className="text-[12px] font-semibold text-on-surface-variant mb-1 flex items-center gap-1">
            <span>Configuration</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Property</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Payment Gateway</span>
          </div>
          <h1 className="text-[24px] font-bold text-on-background tracking-tight">
            Payment Gateway Configuration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search terminals..."
              className="pl-9 pr-3 py-2 bg-surface-container rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)] transition-all text-[13px] text-on-surface placeholder:text-on-surface-variant w-[230px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[14px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle credentials accordion */}
          <button
            type="button"
            onClick={() => setShowSettingsAccordion(!showSettingsAccordion)}
            className={`px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors flex items-center gap-1.5 ${
              showSettingsAccordion
                ? 'bg-[#e0ecfc] border-[#0058be] text-[#0058be]'
                : 'bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Gateway Credentials & Rules</span>
          </button>

          {/* Add Button */}
          <button
            type="button"
            onClick={() => handleOpenAdd(false)}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-[13px] font-semibold hover:bg-inverse-surface transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Terminal</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Table Grid */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Summary Cards matching mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Active Terminals */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-start justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary-fixed-dim/20 rounded-full blur-xl group-hover:bg-tertiary-fixed-dim/40 transition-all"></div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Active Terminals
              </div>
              <div className="text-[30px] font-bold text-on-surface leading-tight">
                {activeCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                point_of_sale
              </span>
            </div>
          </div>

          {/* Card 2: Connection Issues */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-start justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-error-container/20 rounded-full blur-xl group-hover:bg-error-container/40 transition-all"></div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Connection Issues
              </div>
              <div className="text-[30px] font-bold text-[#ba1a1a] leading-tight">
                {issueCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
          </div>

          {/* Card 3: Total Gateways */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-start justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-fixed-dim/20 rounded-full blur-xl group-hover:bg-primary-fixed-dim/40 transition-all"></div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Total Gateways
              </div>
              <div className="text-[30px] font-bold text-on-surface leading-tight">
                {totalGatewaysCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                hub
              </span>
            </div>
          </div>
        </div>

        {/* Optional Accordion: Gateway Credentials & Check-in Rules */}
        {showSettingsAccordion && (
          <div className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-6 flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eceef0]">
              <div>
                <h3 className="text-[17px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">credit_card</span>
                  Merchant Gateway Provider & Credentials
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-0.5">
                  Configure primary merchant processing credentials and card testing policies.
                </p>
              </div>

              <button
                type="button"
                disabled={isSimulatingPayment}
                onClick={() => {
                  setIsSimulatingPayment(true);
                  setTimeout(() => {
                    setIsSimulatingPayment(false);
                    onShowToast(
                      'Simulated authorization of $1.00 approved on Front Desk 1 (Auth Code: ST-77291)',
                      'success'
                    );
                  }, 1200);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-[13px] font-semibold transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  {isSimulatingPayment ? 'sync' : 'contactless'}
                </span>
                <span>{isSimulatingPayment ? 'Processing Auth...' : 'Test Card Terminal'}</span>
              </button>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="text-[13px] font-semibold text-on-surface block mb-2">Default Gateway Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { id: 'stripe', name: 'Stripe Terminal', icon: 'payments' },
                  { id: 'adyen', name: 'Adyen POS', icon: 'credit_card' },
                  { id: 'clover', name: 'Clover', icon: 'storefront' },
                  { id: 'worldpay', name: 'Worldpay', icon: 'language' },
                  { id: 'square', name: 'Square Terminal', icon: 'crop_square' },
                  { id: 'pax', name: 'Pax Payment', icon: 'point_of_sale' },
                ].map((p) => {
                  const selected = config.provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onChange({ ...config, provider: p.id as any });
                        onShowToast(`Default gateway set to ${p.name}`, 'info');
                      }}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                        selected
                          ? 'border-secondary bg-secondary-fixed/30 text-secondary font-semibold ring-1 ring-secondary'
                          : 'border-outline-variant/50 hover:bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
                      <span className="text-[12px] leading-tight">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Environment
                </label>
                <select
                  value={config.environment}
                  onChange={(e) => onChange({ ...config, environment: e.target.value as any })}
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="production">Production (Live Processing)</option>
                  <option value="sandbox">Sandbox / Test Mode</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Merchant Account ID
                </label>
                <input
                  type="text"
                  value={config.merchantId}
                  onChange={(e) => onChange({ ...config, merchantId: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
                  placeholder="acct_..."
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Terminal API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded-lg pl-3 pr-10 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showApiKey ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Check-in Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <label className="flex items-start justify-between p-3.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex flex-col gap-0.5 pr-4">
                  <span className="text-[13px] font-semibold text-on-surface">Auto Pre-Authorize at Check-in</span>
                  <span className="text-[12px] text-on-surface-variant">
                    Hold room rate + incidentals guarantee deposit upon card dip/tap during guest check-in.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoPreAuthAtCheckin}
                  onChange={(e) => onChange({ ...config, autoPreAuthAtCheckin: e.target.checked })}
                  className="w-4 h-4 rounded accent-black mt-0.5 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between p-3.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex flex-col gap-0.5 pr-4">
                  <span className="text-[13px] font-semibold text-on-surface">Auto Capture at Check-out</span>
                  <span className="text-[12px] text-on-surface-variant">
                    Automatically settle folio balance against the authorization hold upon guest check-out.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoCaptureAtCheckout}
                  onChange={(e) => onChange({ ...config, autoCaptureAtCheckout: e.target.checked })}
                  className="w-4 h-4 rounded accent-black mt-0.5 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* Table Container matching mockup */}
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-semibold tracking-wider uppercase sticky top-0 z-10 border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3">Gateway / Terminal</th>
                  <th className="px-5 py-3">Identifiers</th>
                  <th className="px-5 py-3">Network Details</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 bg-surface">
                {paginatedTerminals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 block mb-2">
                        point_of_sale
                      </span>
                      <p className="text-[14px] font-medium text-on-surface">No terminals found</p>
                      <p className="text-[12px] text-on-surface-variant mt-1">
                        Try adjusting your search query or click "Add Terminal" to register hardware.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedTerminals.map((terminal) => {
                    const badge = getProviderBadge(terminal.gatewayProvider);
                    const isOffline = terminal.status === 'Offline';

                    return (
                      <tr
                        key={terminal.id}
                        className={`hover:bg-surface-container-lowest transition-colors group cursor-pointer ${
                          isOffline
                            ? 'relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#ba1a1a] bg-surface-container-lowest/30'
                            : ''
                        }`}
                        onClick={() => handleOpenEdit(terminal, false)}
                      >
                        {/* Gateway / Terminal */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 ${badge.bg} ${badge.text}`}
                            >
                              {badge.code}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-on-surface font-semibold truncate text-[13px]">
                                {terminal.name}
                              </span>
                              <span className="text-on-surface-variant text-[11px] truncate">
                                {terminal.model || badge.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Identifiers */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-[12px]">
                              <span className="text-on-surface-variant w-7 inline-block text-[11px]">ID:</span>
                              <span className="font-mono text-on-surface font-medium">
                                {terminal.terminalId || terminal.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px]">
                              <span className="text-on-surface-variant w-7 inline-block text-[11px]">SN:</span>
                              <span className="font-mono text-on-surface">
                                {terminal.serialNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Network Details */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <div
                              className={`flex items-center gap-1.5 font-mono text-[12px] ${
                                isOffline ? 'text-[#ba1a1a]' : 'text-on-surface'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {isOffline
                                  ? 'wifi_off'
                                  : terminal.networkType === 'wifi'
                                  ? 'wifi'
                                  : 'router'}
                              </span>
                              <span>
                                {terminal.ipAddress}:{terminal.port}
                              </span>
                            </div>
                            {terminal.location && (
                              <span className="text-[11px] text-on-surface-variant truncate">
                                {terminal.location}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center">
                          {isOffline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container text-on-error-container font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                              Offline
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed/50 text-on-secondary-fixed-variant font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Test Network Ping"
                              disabled={testingPingId === terminal.id}
                              onClick={() => handlePingTableTerminal(terminal)}
                              className="text-secondary hover:text-secondary-container p-1 rounded hover:bg-secondary-fixed/50 transition-colors"
                            >
                              <span className={`material-symbols-outlined text-[18px] ${testingPingId === terminal.id ? 'animate-spin' : ''}`}>
                                {testingPingId === terminal.id ? 'sync' : 'sensors'}
                              </span>
                            </button>

                            <button
                              type="button"
                              title="Edit Terminal"
                              onClick={() => handleOpenEdit(terminal, false)}
                              className="text-secondary hover:text-secondary-container p-1 rounded hover:bg-secondary-fixed/50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>

                            <button
                              type="button"
                              title="Delete Terminal"
                              onClick={() => handleDeleteTerminal(terminal.id, terminal.name)}
                              className="text-[#ba1a1a] hover:text-on-error-container p-1 rounded hover:bg-error-container/50 transition-colors ml-0.5"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination matching mockup */}
          <div className="px-5 py-3 bg-white border-t border-outline-variant/20 flex items-center justify-between text-[13px] text-on-surface-variant">
            <div>
              Showing {filteredTerminals.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredTerminals.length)} of {filteredTerminals.length} terminals
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="text-[12px] font-medium text-on-surface">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-[2px] z-50 transition-opacity"
          id="drawer-overlay"
          onClick={handleCloseForm}
        />
      )}

      {/* Side Drawer: Add/Edit Terminal matching mockup */}
      <div
        id="add-terminal-drawer"
        className={`fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white z-10 sticky top-0 border-b border-outline-variant/20 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed-dim/20 rounded-full blur-2xl -z-10 pointer-events-none"></div>
          <div>
            <h2 className="text-[17px] font-bold text-on-surface">
              {editingTerminalId ? 'Edit Terminal' : 'Add New Terminal'}
            </h2>
            <p className="text-[11px] text-on-surface-variant">Configure payment gateway hardware & identifiers</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Expand to Full Page Form"
              onClick={() => {
                setIsDrawerOpen(false);
                setViewMode('full-page-form');
              }}
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Section 1: Gateway Identity */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 before:w-1 before:h-4 before:bg-secondary before:rounded-full">
              Gateway Identity
            </h3>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-on-surface font-medium">
                Payment Gateway <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.gatewayProvider}
                  onChange={(e) => setFormData({ ...formData, gatewayProvider: e.target.value })}
                  className="w-full appearance-none px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all text-[13px] text-on-surface pr-10 cursor-pointer"
                >
                  <option value="stripe">Stripe</option>
                  <option value="adyen">Adyen</option>
                  <option value="clover">Clover</option>
                  <option value="worldpay">Worldpay</option>
                  <option value="square">Square</option>
                  <option value="pax">Pax</option>
                  <option value="verifone">Verifone</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-on-surface font-medium">
                Terminal Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Front Desk 2"
                className="w-full px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
              />
              <p className="text-[11px] text-on-surface-variant">
                A friendly name to identify this terminal in StayOS.
              </p>
            </div>
          </section>

          {/* Section 2: Connection Details */}
          <section className="flex flex-col gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Connection Details
            </h3>

            {/* Terminal ID with simulated duplicate check error state */}
            <div className="flex flex-col gap-1 relative">
              <label className="text-[13px] text-on-surface font-medium">Terminal ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  placeholder="tm_FD01_123"
                  className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-all font-mono text-[13px] text-on-surface pr-9 ${
                    isDuplicateTerminalId
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/30'
                      : 'border-outline-variant/50 focus:border-secondary focus:ring-secondary/30'
                  }`}
                />
                {isDuplicateTerminalId && (
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ba1a1a] text-[18px]">
                    error
                  </span>
                )}
              </div>
              {isDuplicateTerminalId && (
                <p className="text-[11px] text-[#ba1a1a] flex items-center gap-1 mt-0.5 font-medium">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  Terminal ID already exists for this property.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-on-surface font-medium">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-on-surface font-medium">Location ID</label>
                <input
                  type="text"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Network Configuration */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 before:w-1 before:h-4 before:bg-primary-fixed-dim before:rounded-full">
                Network Config
              </h3>
              <button
                type="button"
                onClick={handleTestConnectionInForm}
                disabled={testConnectionStatus === 'testing'}
                className="text-secondary hover:text-secondary-container text-[13px] font-semibold flex items-center gap-1 transition-colors"
              >
                <span className={`material-symbols-outlined text-[16px] ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`}>
                  sensors
                </span>
                <span>{testConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[13px] text-on-surface font-medium">IP Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                    lan
                  </span>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.x"
                    className="w-full pl-8 pr-3 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-[13px] text-on-surface font-medium">Port</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="8080"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-on-surface font-medium">
                Reader ID{' '}
                <span className="text-on-surface-variant/60 font-normal text-[11px] ml-1">
                  (Stripe specific)
                </span>
              </label>
              <input
                type="text"
                value={formData.readerId}
                onChange={(e) => setFormData({ ...formData, readerId: e.target.value })}
                placeholder="tmreader_xxx"
                className="w-full px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Connection Test Result Badge */}
            {testConnectionStatus !== 'not_tested' && (
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-[12px] ${
                  testConnectionStatus === 'success'
                    ? 'bg-[#e6f4ea] border-[#34a853]/40 text-[#137333]'
                    : testConnectionStatus === 'failed'
                    ? 'bg-[#ffdad6] border-[#ba1a1a]/40 text-[#ba1a1a]'
                    : 'bg-[#e0ecfc] border-[#0058be]/40 text-[#0058be]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {testConnectionStatus === 'success'
                      ? 'check_circle'
                      : testConnectionStatus === 'failed'
                      ? 'error'
                      : 'sync'}
                  </span>
                  <span>
                    {testConnectionStatus === 'success'
                      ? `Connected successfully (${testLatency}ms latency)`
                      : testConnectionStatus === 'failed'
                      ? 'Connection failed. Verify IP and port.'
                      : 'Testing ping to device...'}
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Drawer Footer matching mockup */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-white border-t border-outline-variant/20">
          <button
            type="button"
            onClick={handleCloseForm}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveTerminal()}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-on-primary hover:bg-inverse-surface transition-colors shadow-sm flex items-center gap-1"
          >
            <span>Save Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
