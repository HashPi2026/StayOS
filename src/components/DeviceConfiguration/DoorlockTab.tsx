import React, { useState, useMemo } from 'react';
import {
  DoorlockConfig,
  DoorlockSystemItem,
  DoorlockTerminalDevice,
  KeycardEncoderDevice,
} from '../../types';

interface DoorlockTabProps {
  config: DoorlockConfig;
  onChange: (updated: DoorlockConfig) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DoorlockTab: React.FC<DoorlockTabProps> = ({
  config,
  onChange,
  onShowToast,
}) => {
  // Navigation view modes:
  // 'list': The 2-column main view (Screenshot 1)
  // 'add-doorlock': Add/Edit Doorlock page (Screenshot 2)
  // 'add-terminal': Add/Edit Terminal page (Screenshot 3)
  const [viewMode, setViewMode] = useState<'list' | 'add-doorlock' | 'add-terminal'>('list');

  // Systems list fallback
  const doorlockSystems: DoorlockSystemItem[] = useMemo(() => {
    if (config.doorlockSystems && config.doorlockSystems.length > 0) {
      return config.doorlockSystems;
    }
    // Default initial systems matching screenshot
    return [
      {
        id: 'dl-1',
        doorlockId: 'DL-001',
        name: 'Main Entrance',
        keyCards: 45,
        status: 'Active',
        terminals: [
          {
            id: 'term-dl-1',
            name: 'Term-Alpha-01',
            doorlockId: 'dl-1',
            ipAddress: '192.168.1.104',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:5E',
            status: 'Online',
            lastPing: 'Just now',
          },
          {
            id: 'term-dl-2',
            name: 'Term-Beta-02',
            doorlockId: 'dl-1',
            ipAddress: '192.168.1.105',
            port: 8081,
            macAddress: '00:1A:2B:3C:4D:5F',
            status: 'Online',
            lastPing: 'Just now',
          },
          {
            id: 'term-dl-3',
            name: 'Term-Backup-01',
            doorlockId: 'dl-1',
            ipAddress: '192.168.1.199',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:60',
            status: 'Offline',
            lastPing: '2 hours ago',
          },
        ],
      },
      {
        id: 'dl-2',
        doorlockId: 'DL-002',
        name: 'Guest Wing A',
        keyCards: 120,
        status: 'Active',
        terminals: [
          {
            id: 'term-dl-4',
            name: 'Term-WingA-01',
            doorlockId: 'dl-2',
            ipAddress: '192.168.1.110',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:61',
            status: 'Online',
            lastPing: 'Just now',
          },
          {
            id: 'term-dl-5',
            name: 'Term-WingA-02',
            doorlockId: 'dl-2',
            ipAddress: '192.168.1.111',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:62',
            status: 'Online',
            lastPing: '1 min ago',
          },
        ],
      },
      {
        id: 'dl-3',
        doorlockId: 'DL-003',
        name: 'Guest Wing B',
        keyCards: 120,
        status: 'Inactive',
        terminals: [
          {
            id: 'term-dl-6',
            name: 'Term-WingB-01',
            doorlockId: 'dl-3',
            ipAddress: '192.168.1.115',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:63',
            status: 'Offline',
            lastPing: '3 days ago',
          },
        ],
      },
      {
        id: 'dl-4',
        doorlockId: 'DL-004',
        name: 'Spa & Pool',
        keyCards: 35,
        status: 'Fault',
        terminals: [
          {
            id: 'term-dl-7',
            name: 'Term-Spa-Reader',
            doorlockId: 'dl-4',
            ipAddress: '192.168.1.140',
            port: 8080,
            macAddress: '00:1A:2B:3C:4D:64',
            status: 'Offline',
            lastPing: 'Fault detected',
          },
        ],
      },
    ];
  }, [config.doorlockSystems]);

  // Selected doorlock for viewing terminals in right column
  const [selectedDoorlockId, setSelectedDoorlockId] = useState<string>(
    doorlockSystems[0]?.id || 'dl-1'
  );

  const selectedDoorlock = useMemo(() => {
    return doorlockSystems.find((d) => d.id === selectedDoorlockId) || doorlockSystems[0] || null;
  }, [doorlockSystems, selectedDoorlockId]);

  // State for Doorlock Form (Add / Edit)
  const [editingDoorlockId, setEditingDoorlockId] = useState<string | null>(null);
  const [doorlockFormData, setDoorlockFormData] = useState<{
    name: string;
    keyCards: number | string;
    status: 'Active' | 'Inactive' | 'Fault';
  }>({
    name: '',
    keyCards: 0,
    status: 'Active',
  });

  // State for Terminal Form (Add / Edit)
  const [editingTerminalId, setEditingTerminalId] = useState<string | null>(null);
  const [targetDoorlockForTerminal, setTargetDoorlockForTerminal] = useState<DoorlockSystemItem | null>(null);
  const [terminalFormData, setTerminalFormData] = useState<{
    name: string;
    ipAddress: string;
    port: number | string;
    macAddress: string;
  }>({
    name: '',
    ipAddress: '192.168.1.100',
    port: 8080,
    macAddress: '',
  });

  // Connection test simulation state for terminal
  const [isTestingTerminalConn, setIsTestingTerminalConn] = useState(false);
  const [terminalConnTested, setTerminalConnTested] = useState<boolean | null>(null);

  // Advanced Server Settings Toggle
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [isTestingServer, setIsTestingServer] = useState(false);

  // Keycard write simulation
  const [showEncodeModal, setShowEncodeModal] = useState(false);
  const [encodeData, setEncodeData] = useState({
    roomNumber: '204',
    guestName: 'Eleanor Vance',
    nights: 3,
    keysCount: 2,
    doorlockName: selectedDoorlock?.name || 'Main Entrance',
  });
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);

  // Handlers for Doorlock CRUD
  const handleOpenAddDoorlock = () => {
    setEditingDoorlockId(null);
    setDoorlockFormData({
      name: '',
      keyCards: 0,
      status: 'Active',
    });
    setViewMode('add-doorlock');
  };

  const handleOpenEditDoorlock = (doorlock: DoorlockSystemItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDoorlockId(doorlock.id);
    setDoorlockFormData({
      name: doorlock.name,
      keyCards: doorlock.keyCards,
      status: doorlock.status,
    });
    setSelectedDoorlockId(doorlock.id);
    setViewMode('add-doorlock');
  };

  const handleSaveDoorlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!doorlockFormData.name.trim()) {
      onShowToast('Please provide a Doorlock Name', 'error');
      return;
    }

    const keyCardsNum = Number(doorlockFormData.keyCards) || 0;

    if (editingDoorlockId) {
      // Edit
      const updated = doorlockSystems.map((d) => {
        if (d.id === editingDoorlockId) {
          return {
            ...d,
            name: doorlockFormData.name.trim(),
            keyCards: keyCardsNum,
            status: doorlockFormData.status,
          };
        }
        return d;
      });
      onChange({ ...config, doorlockSystems: updated });
      onShowToast(`Doorlock "${doorlockFormData.name}" updated successfully`, 'success');
    } else {
      // Create new
      const nextNum = doorlockSystems.length + 1;
      const newDoorlock: DoorlockSystemItem = {
        id: `dl-${Date.now()}`,
        doorlockId: `DL-00${nextNum}`,
        name: doorlockFormData.name.trim(),
        keyCards: keyCardsNum,
        status: doorlockFormData.status,
        terminals: [],
      };
      onChange({ ...config, doorlockSystems: [...doorlockSystems, newDoorlock] });
      setSelectedDoorlockId(newDoorlock.id);
      onShowToast(`Doorlock "${newDoorlock.name}" created successfully`, 'success');
    }

    setViewMode('list');
  };

  const handleDeleteDoorlock = (doorlockId: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = doorlockSystems.filter((d) => d.id !== doorlockId);
    onChange({ ...config, doorlockSystems: updated });
    if (selectedDoorlockId === doorlockId && updated.length > 0) {
      setSelectedDoorlockId(updated[0].id);
    }
    onShowToast(`Doorlock "${name}" removed`, 'info');
  };

  // Handlers for Terminal CRUD
  const handleOpenAddTerminal = (doorlock?: DoorlockSystemItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const parent = doorlock || selectedDoorlock || doorlockSystems[0];
    setTargetDoorlockForTerminal(parent);
    setEditingTerminalId(null);
    setTerminalFormData({
      name: '',
      ipAddress: '192.168.1.100',
      port: 8080,
      macAddress: '',
    });
    setTerminalConnTested(null);
    setViewMode('add-terminal');
  };

  const handleOpenEditTerminal = (
    terminal: DoorlockTerminalDevice,
    parentDoorlock: DoorlockSystemItem,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setTargetDoorlockForTerminal(parentDoorlock);
    setEditingTerminalId(terminal.id);
    setTerminalFormData({
      name: terminal.name,
      ipAddress: terminal.ipAddress,
      port: terminal.port,
      macAddress: terminal.macAddress || '',
    });
    setTerminalConnTested(terminal.status === 'Online');
    setViewMode('add-terminal');
  };

  const handleSaveTerminal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetDoorlockForTerminal) return;

    if (!terminalFormData.name.trim()) {
      onShowToast('Please provide a Terminal Name', 'error');
      return;
    }
    if (!terminalFormData.ipAddress.trim()) {
      onShowToast('Please provide an IP Address', 'error');
      return;
    }

    const portNum = Number(terminalFormData.port) || 8080;
    const isOffline =
      terminalFormData.ipAddress.includes('.199') ||
      terminalFormData.ipAddress.includes('.140') ||
      terminalConnTested === false;

    const updatedSystems = doorlockSystems.map((d) => {
      if (d.id === targetDoorlockForTerminal.id) {
        if (editingTerminalId) {
          // Update
          const updatedTerminals = d.terminals.map((t) => {
            if (t.id === editingTerminalId) {
              return {
                ...t,
                name: terminalFormData.name.trim(),
                ipAddress: terminalFormData.ipAddress.trim(),
                port: portNum,
                macAddress: terminalFormData.macAddress.trim() || undefined,
                status: isOffline ? ('Offline' as const) : ('Online' as const),
                lastPing: 'Just now',
              };
            }
            return t;
          });
          return { ...d, terminals: updatedTerminals };
        } else {
          // Add new
          const newTerminal: DoorlockTerminalDevice = {
            id: `term-dl-${Date.now()}`,
            name: terminalFormData.name.trim(),
            doorlockId: d.id,
            ipAddress: terminalFormData.ipAddress.trim(),
            port: portNum,
            macAddress: terminalFormData.macAddress.trim() || undefined,
            status: isOffline ? 'Offline' : 'Online',
            lastPing: 'Just now',
          };
          return { ...d, terminals: [...d.terminals, newTerminal] };
        }
      }
      return d;
    });

    onChange({ ...config, doorlockSystems: updatedSystems });
    onShowToast(`Terminal "${terminalFormData.name}" saved for ${targetDoorlockForTerminal.name}`, 'success');
    setSelectedDoorlockId(targetDoorlockForTerminal.id);
    setViewMode('list');
  };

  const handleDeleteTerminal = (terminalId: string, doorlockId: string, name: string) => {
    const updatedSystems = doorlockSystems.map((d) => {
      if (d.id === doorlockId) {
        return {
          ...d,
          terminals: d.terminals.filter((t) => t.id !== terminalId),
        };
      }
      return d;
    });
    onChange({ ...config, doorlockSystems: updatedSystems });
    onShowToast(`Removed terminal "${name}"`, 'info');
  };

  // Test connection for a terminal card in list
  const handleTestTerminalConnection = (terminal: DoorlockTerminalDevice) => {
    onShowToast(`Testing connection to ${terminal.ipAddress}:${terminal.port}...`, 'info');
    setTimeout(() => {
      if (terminal.status === 'Offline' || terminal.ipAddress.includes('.199')) {
        onShowToast(`Terminal ${terminal.name} at ${terminal.ipAddress}:${terminal.port} is unreachable.`, 'error');
      } else {
        const latency = Math.floor(Math.random() * 20) + 8;
        onShowToast(`Connected to ${terminal.name}! Ping response: ${latency}ms`, 'success');
      }
    }, 500);
  };

  // Test connection within the Add/Edit Terminal Form
  const handleTestFormTerminalConn = () => {
    setIsTestingTerminalConn(true);
    setTimeout(() => {
      setIsTestingTerminalConn(false);
      const isUnreachable =
        terminalFormData.ipAddress.includes('.199') || terminalFormData.ipAddress.endsWith('.0');
      if (isUnreachable) {
        setTerminalConnTested(false);
        onShowToast(`Host ${terminalFormData.ipAddress}:${terminalFormData.port} unreachable.`, 'error');
      } else {
        setTerminalConnTested(true);
        const latency = Math.floor(Math.random() * 18) + 10;
        onShowToast(`Ping verified! Connection to ${terminalFormData.ipAddress}:${terminalFormData.port} stable (${latency}ms).`, 'success');
      }
    }, 600);
  };

  // Test Lock PMS Server (Assa Abloy / Salto server)
  const handleTestServer = () => {
    setIsTestingServer(true);
    setTimeout(() => {
      setIsTestingServer(false);
      onShowToast(
        `Lock Server Connected! ${config.serverAddress}:${config.serverPort} responded in 14ms. Operator session verified.`,
        'success'
      );
    }, 800);
  };

  // Keycard simulator
  const handleStartEncoding = () => {
    setIsEncoding(true);
    setEncodeProgress(10);
    const interval = setInterval(() => {
      setEncodeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEncoding(false);
          onShowToast(
            `Keycard successfully written for Room ${encodeData.roomNumber} (${encodeData.guestName}). Access granted for ${encodeData.doorlockName}.`,
            'success'
          );
          setTimeout(() => {
            setShowEncodeModal(false);
            setEncodeProgress(0);
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  // -------------------------------------------------------------
  // SCREEN 2: Add / Edit Doorlock View
  // -------------------------------------------------------------
  if (viewMode === 'add-doorlock') {
    return (
      <div className="flex flex-col w-full h-full min-h-[calc(100vh-140px)] pb-24 -mt-2">
        {/* Top Breadcrumb & Title Bar matching Screen 2 */}
        <div className="w-full px-6 py-4 flex flex-col gap-1 border-b border-[#e6e8ea] bg-white sticky top-0 z-30">
          <div className="flex items-center gap-1 text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Configuration
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Property
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Doorlocks
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">
              {editingDoorlockId ? 'Edit Doorlock' : 'Add Doorlock'}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <h1 className="text-[28px] font-bold text-on-surface tracking-tight">
              {editingDoorlockId ? 'Edit Doorlock' : 'Add New Doorlock'}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-on-surface-variant bg-surface-container p-2 rounded-full cursor-help hover:bg-surface-container-high transition-colors text-[20px]"
                title="Configure doorlock access and encoder terminal mapping"
              >
                info
              </span>
            </div>
          </div>
        </div>

        {/* Content Container max-w-5xl */}
        <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
          {/* Card 1: Doorlock Details */}
          <div className="bg-white rounded-xl shadow-xs border border-[#e6e8ea] overflow-hidden flex flex-col transition-shadow hover:shadow-sm">
            <div className="px-6 py-4 border-b border-[#e6e8ea] bg-surface-container-low/50 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[22px]">vpn_key</span>
              <h2 className="text-[17px] font-bold text-on-surface">Doorlock Details</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
              {/* Doorlock Name */}
              <div className="flex flex-col gap-1 relative group">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1" htmlFor="doorlockName">
                  Doorlock Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] z-10 pointer-events-none">
                    tag
                  </span>
                  <input
                    id="doorlockName"
                    type="text"
                    required
                    value={doorlockFormData.name}
                    onChange={(e) => setDoorlockFormData({ ...doorlockFormData, name: e.target.value })}
                    placeholder="e.g., Main Lobby Entrance"
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg py-2.5 pl-10 pr-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:bg-white transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
                <span className="text-[12px] text-on-surface-variant/70 mt-0.5">
                  A descriptive name for easy identification.
                </span>
              </div>

              {/* Number of Key Cards */}
              <div className="flex flex-col gap-1 relative group">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="keyCards">
                  Number of Key Cards
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] z-10 pointer-events-none">
                    style
                  </span>
                  <input
                    id="keyCards"
                    type="number"
                    min="0"
                    value={doorlockFormData.keyCards}
                    onChange={(e) => setDoorlockFormData({ ...doorlockFormData, keyCards: e.target.value })}
                    placeholder="0"
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg py-2.5 pl-10 pr-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:bg-white transition-all placeholder:text-on-surface-variant/50 font-mono"
                  />
                </div>
                <span className="text-[12px] text-on-surface-variant/70 mt-0.5">
                  Maximum concurrent active cards permitted.
                </span>
              </div>

              {/* Operational Status */}
              <div className="flex flex-col gap-1 md:col-span-2 pt-2 border-t border-outline-variant/20">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Operational Status
                </label>
                <div className="flex items-center gap-3 mt-1">
                  {(['Active', 'Inactive', 'Fault'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDoorlockFormData({ ...doorlockFormData, status: st })}
                      className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all flex items-center gap-2 ${
                        doorlockFormData.status === st
                          ? st === 'Active'
                            ? 'bg-[#d8e2ff]/50 border-secondary text-secondary ring-1 ring-secondary'
                            : st === 'Fault'
                            ? 'bg-error-container border-[#ba1a1a] text-on-error-container ring-1 ring-[#ba1a1a]'
                            : 'bg-surface-container border-outline text-on-surface ring-1 ring-outline'
                          : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          st === 'Active' ? 'bg-secondary' : st === 'Fault' ? 'bg-[#ba1a1a]' : 'bg-outline'
                        }`}
                      ></span>
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Terminal Mapping */}
          <div className="bg-white rounded-xl shadow-xs border border-[#e6e8ea] overflow-hidden flex flex-col relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-bl-full pointer-events-none opacity-50"></div>
            <div className="px-6 py-4 border-b border-[#e6e8ea] bg-surface-container-low/50 flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">router</span>
                <h2 className="text-[17px] font-bold text-on-surface">Terminal Mapping</h2>
              </div>
              <p className="text-[13px] text-on-surface-variant">
                Map hardware terminals to this doorlock system to manage key card encoding.
              </p>
            </div>

            {/* If editing existing doorlock with mapped terminals, show them, else show empty illustration */}
            {editingDoorlockId &&
            doorlockSystems.find((d) => d.id === editingDoorlockId)?.terminals.length ? (
              <div className="p-6 flex flex-col gap-3 z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-on-surface">
                    Currently Mapped Terminals (
                    {doorlockSystems.find((d) => d.id === editingDoorlockId)?.terminals.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = doorlockSystems.find((d) => d.id === editingDoorlockId);
                      if (cur) handleOpenAddTerminal(cur);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-[12px] font-semibold text-on-surface hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Another Terminal</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doorlockSystems
                    .find((d) => d.id === editingDoorlockId)
                    ?.terminals.map((term) => (
                      <div
                        key={term.id}
                        className="p-3.5 rounded-lg border border-outline-variant/40 bg-surface flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px] text-on-surface">{term.name}</span>
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            {term.ipAddress}:{term.port}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            term.status === 'Online'
                              ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {term.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Empty state matching Screen 2 */
              <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center bg-white relative z-10">
                <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-surface-container rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-2 bg-surface-container-high rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant/40">
                    <span className="material-symbols-outlined text-outline text-[40px] opacity-70">
                      sensors_off
                    </span>
                  </div>
                  <div className="absolute -right-2 -bottom-2 bg-white rounded-full p-1 shadow-sm border border-surface-container-high">
                    <span className="material-symbols-outlined text-secondary text-[16px]">add_circle</span>
                  </div>
                </div>

                <h3 className="text-[17px] font-bold text-on-surface mb-1">No terminals mapped yet</h3>
                <p className="text-[13px] text-on-surface-variant max-w-md mb-6 leading-relaxed">
                  After saving the Doorlock, you will be prompted to add and configure your first terminal for encoding.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill target and open terminal form
                    if (doorlockFormData.name.trim()) {
                      const tempParent: DoorlockSystemItem = {
                        id: editingDoorlockId || `dl-${Date.now()}`,
                        doorlockId: 'DL-TEMP',
                        name: doorlockFormData.name,
                        keyCards: Number(doorlockFormData.keyCards) || 0,
                        status: doorlockFormData.status,
                        terminals: [],
                      };
                      handleOpenAddTerminal(tempParent);
                    } else {
                      onShowToast('Please fill in Doorlock Name first', 'info');
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container hover:text-primary transition-all text-[12px] font-semibold uppercase tracking-wider group/btn relative overflow-hidden bg-white shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover/btn:rotate-90 transition-transform duration-300">
                    add
                  </span>
                  <span>Add Terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Action Bar matching Screen 2 */}
        <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-white/95 backdrop-blur-md border-t border-[#e6e8ea] py-3.5 px-8 flex items-center justify-end gap-3 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-6 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveDoorlock()}
            className="px-8 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider bg-primary text-on-primary hover:bg-primary/90 hover:shadow-md transition-all flex items-center gap-2 group active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
              save
            </span>
            <span>Save Doorlock</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: Add / Edit Terminal View (Under Doorlock)
  // -------------------------------------------------------------
  if (viewMode === 'add-terminal') {
    const parentDoorlock = targetDoorlockForTerminal || selectedDoorlock || doorlockSystems[0];
    const previewName = terminalFormData.name.trim() || 'Terminal Name';
    const previewIp = terminalFormData.ipAddress.trim() || '0.0.0.0';
    const previewPort = terminalFormData.port ? String(terminalFormData.port) : '0000';
    const hasFullDetails = Boolean(terminalFormData.name.trim() && terminalFormData.ipAddress.trim() && terminalFormData.port);

    return (
      <div className="flex flex-col w-full h-full min-h-[calc(100vh-140px)] pb-24 -mt-2">
        {/* Top Breadcrumb & Title Bar matching Screen 3 */}
        <div className="px-6 py-4 flex flex-col gap-1 border-b border-[#e6e8ea] bg-white sticky top-0 z-30">
          <nav className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Configuration
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Property
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => setViewMode('list')}>
              Doorlocks
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span
              className="hover:text-primary transition-colors cursor-pointer"
              onClick={() => {
                if (parentDoorlock) setSelectedDoorlockId(parentDoorlock.id);
                setViewMode('list');
              }}
            >
              {parentDoorlock?.name || 'Main Entrance'}
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">
              {editingTerminalId ? 'Edit Terminal' : 'Add Terminal'}
            </span>
          </nav>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight mt-1">
            {editingTerminalId ? 'Edit Terminal' : 'Add New Terminal'}
          </h1>
        </div>

        {/* Content Container max-w-4xl */}
        <div className="px-6 py-6 max-w-4xl w-full mx-auto flex-1 flex flex-col gap-6">
          {/* Parent Doorlock Info Banner matching Screen 3 */}
          <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4 shadow-xs border border-outline-variant/30">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container shrink-0">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Parent Doorlock
              </div>
              <div className="text-[17px] font-bold text-on-surface">
                {parentDoorlock?.name || 'Main Entrance'}
              </div>
            </div>
            <div className="ml-auto bg-white px-3.5 py-1 rounded-full border border-outline-variant/60 flex items-center gap-2 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
              <span className="font-mono text-[12px] text-on-surface font-medium">
                ID: {parentDoorlock?.doorlockId || 'DL-4920'}
              </span>
            </div>
          </div>

          {/* Terminal Configuration Card matching Screen 3 */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-outline-variant/40 flex flex-col gap-6">
            <h2 className="text-[17px] font-bold text-on-surface">Terminal Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Terminal Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  Terminal Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="terminal-name"
                  type="text"
                  required
                  value={terminalFormData.name}
                  onChange={(e) => setTerminalFormData({ ...terminalFormData, name: e.target.value })}
                  placeholder="e.g., Front Desk Reader"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg py-2.5 px-3.5 text-[14px] text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                />
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Must be unique within this Doorlock.
                </p>
              </div>

              {/* IP Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  IP Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="ip-address"
                  type="text"
                  required
                  value={terminalFormData.ipAddress}
                  onChange={(e) => setTerminalFormData({ ...terminalFormData, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg py-2.5 px-3.5 font-mono text-[14px] text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                />
                <p className="text-[12px] text-on-surface-variant mt-0.5">IPv4 format.</p>
              </div>

              {/* Port */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Port
                </label>
                <input
                  id="port"
                  type="number"
                  value={terminalFormData.port}
                  onChange={(e) => setTerminalFormData({ ...terminalFormData, port: e.target.value })}
                  placeholder="8080"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg py-2.5 px-3.5 font-mono text-[14px] text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                />
              </div>

              {/* Mac Address (Optional) */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Mac Address (Optional)
                </label>
                <input
                  type="text"
                  value={terminalFormData.macAddress}
                  onChange={(e) => setTerminalFormData({ ...terminalFormData, macAddress: e.target.value })}
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg py-2.5 px-3.5 font-mono text-[14px] text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Connection Preview Dark Card matching Screen 3 */}
          <div className="bg-primary-container rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-white">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>

            <div className="flex flex-col gap-2 relative z-10 w-full md:w-auto">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-on-primary-container">
                Connection Preview
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    terminalConnTested === true
                      ? 'bg-[#107c41] ring-2 ring-[#107c41]/30'
                      : terminalConnTested === false
                      ? 'bg-[#ba1a1a] ring-2 ring-[#ba1a1a]/30'
                      : hasFullDetails
                      ? 'bg-secondary-container animate-pulse'
                      : 'bg-surface-tint'
                  }`}
                  id="status-indicator"
                ></div>

                <div className="font-mono text-[13px] text-on-primary-container bg-surface-container/20 px-3 py-1.5 rounded-md border border-white/10">
                  <span id="preview-name">{previewName}</span> — <span id="preview-ip">{previewIp}</span>:
                  <span id="preview-port">{previewPort}</span>
                </div>
              </div>

              <p className="text-[12px] text-on-primary-container/80 max-w-sm mt-0.5">
                {terminalConnTested === true
                  ? 'Connection tested successfully. Ready to deploy encoder.'
                  : terminalConnTested === false
                  ? 'Host connection failed. Verify IP, subnet and port binding.'
                  : 'Unique combination validation pending. Test connection before saving.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestFormTerminalConn}
              disabled={isTestingTerminalConn}
              className="relative z-10 bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-secondary-container transition-colors shadow-sm flex items-center gap-2 self-stretch md:self-center whitespace-nowrap active:scale-95"
            >
              <span className={`material-symbols-outlined text-[18px] ${isTestingTerminalConn ? 'animate-spin' : ''}`}>
                cell_tower
              </span>
              <span>{isTestingTerminalConn ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Fixed Bottom Action Bar matching Screen 3 */}
        <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-white/95 backdrop-blur-md border-t border-[#e6e8ea] py-3.5 px-8 flex justify-end gap-3 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-6 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveTerminal()}
            className="px-8 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider bg-primary text-on-primary hover:bg-on-surface transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Terminal</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 1: Two-Column Main View
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col w-full h-full relative font-body-md text-on-surface -mt-2">
      {/* Top Header & Breadcrumbs matching Screen 1 */}
      <div className="py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 sticky top-0 bg-[#f7f9fb]/90 backdrop-blur-md pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
            <span>Configuration</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Property</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Doorlocks</span>
          </nav>
          <h1 className="text-[24px] font-bold text-on-surface tracking-tight">
            Doorlock Configuration
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick write keycard modal trigger */}
          <button
            type="button"
            onClick={() => setShowEncodeModal(true)}
            className="px-3.5 py-2 rounded-lg text-[13px] font-semibold border border-outline-variant/60 bg-white hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">contactless</span>
            <span>Encode Keycard</span>
          </button>

          {/* Toggle Lock Server / PMS Integration Settings */}
          <button
            type="button"
            onClick={() => setShowServerSettings(!showServerSettings)}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold border transition-colors flex items-center gap-1.5 shadow-xs ${
              showServerSettings
                ? 'bg-[#e0ecfc] border-[#0058be] text-[#0058be]'
                : 'bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dns</span>
            <span>Lock PMS Server & Rules</span>
          </button>
        </div>
      </div>

      {/* Expandable Lock PMS Server Settings & Key Expiry Rules */}
      {showServerSettings && (
        <div className="mb-6 bg-white rounded-xl border border-outline-variant/50 shadow-sm p-6 flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eceef0]">
            <div>
              <h3 className="text-[17px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">door_sliding</span>
                Keycard Server Integration & Security Rules
              </h3>
              <p className="text-[13px] text-on-surface-variant mt-0.5">
                Configure PMS interface for Assa Abloy VingCard, Salto Space, Dormakaba Saflok, and Onity.
              </p>
            </div>

            <button
              type="button"
              disabled={isTestingServer}
              onClick={handleTestServer}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg text-[13px] font-semibold hover:bg-secondary-container transition-colors shrink-0 shadow-xs"
            >
              <span className={`material-symbols-outlined text-[18px] ${isTestingServer ? 'animate-spin' : ''}`}>
                cell_tower
              </span>
              <span>{isTestingServer ? 'Testing Server...' : 'Test Server Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { id: 'assa_abloy', name: 'Assa Abloy / VingCard', icon: 'lock' },
              { id: 'salto', name: 'Salto Space SVN', icon: 'key' },
              { id: 'dormakaba', name: 'Dormakaba Saflok', icon: 'pin' },
              { id: 'onity', name: 'Onity DirectKey', icon: 'nfc' },
              { id: 'hotek', name: 'Hotek SMART', icon: 'phonelink_lock' },
              { id: 'generic_tcp', name: 'Generic TCP/IP PMS', icon: 'router' },
            ].map((p) => {
              const selected = config.provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange({ ...config, provider: p.id as any });
                    onShowToast(`Doorlock integration set to ${p.name}`, 'info');
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Server IP / Host
              </label>
              <input
                type="text"
                value={config.serverAddress}
                onChange={(e) => onChange({ ...config, serverAddress: e.target.value })}
                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Port
              </label>
              <input
                type="number"
                value={config.serverPort}
                onChange={(e) => onChange({ ...config, serverPort: Number(e.target.value) || 5010 })}
                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                System Operator ID
              </label>
              <input
                type="text"
                value={config.systemOperatorId}
                onChange={(e) => onChange({ ...config, systemOperatorId: e.target.value })}
                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Site / Hotel Code
              </label>
              <input
                type="text"
                value={config.siteCode}
                onChange={(e) => onChange({ ...config, siteCode: e.target.value })}
                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono text-on-surface outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Main Layout matching Screen 1 */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px] pb-12">
        {/* Left Column: Doorlock Systems Table */}
        <div className="flex-1 flex flex-col bg-white shadow-xs border border-outline-variant/40 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-surface-container-low border-b border-outline-variant/30">
            <h2 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">vpn_key</span>
              Doorlock Systems
            </h2>
            <button
              type="button"
              onClick={handleOpenAddDoorlock}
              className="bg-primary text-on-primary px-3.5 py-2 rounded-lg text-[13px] font-semibold hover:bg-surface-tint transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Doorlock</span>
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low sticky top-0 z-10 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/20">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Doorlock Name</th>
                  <th className="py-3.5 px-5 font-semibold w-32">Key Cards</th>
                  <th className="py-3.5 px-5 font-semibold w-32">Status</th>
                  <th className="py-3.5 px-5 font-semibold w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-[13px] bg-white">
                {doorlockSystems.map((doorlock) => {
                  const isSelected = selectedDoorlockId === doorlock.id;
                  const isFault = doorlock.status === 'Fault';
                  const isActive = doorlock.status === 'Active';

                  return (
                    <tr
                      key={doorlock.id}
                      onClick={() => setSelectedDoorlockId(doorlock.id)}
                      className={`hover:bg-surface-container-high/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-secondary-container/10 ring-1 ring-inset ring-secondary/30' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-on-surface text-[14px]">{doorlock.name}</div>
                        <div className="text-[12px] text-on-surface-variant font-mono">
                          ID: {doorlock.doorlockId}
                        </div>
                      </td>

                      {/* Key Cards */}
                      <td className="py-3.5 px-5 font-mono text-[13px] font-medium text-on-surface">
                        {doorlock.keyCards}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        {isFault ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-error-container text-on-error-container text-[11px] font-semibold uppercase tracking-wider gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Fault
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-surface-container-high text-on-surface text-[11px] font-semibold uppercase tracking-wider gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-secondary"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-surface-container-high text-on-surface text-[11px] font-semibold uppercase tracking-wider gap-1.5 opacity-70">
                            <span className="w-2 h-2 rounded-full bg-outline"></span> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditDoorlock(doorlock, e)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-container"
                            title="Edit Doorlock"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDoorlock(doorlock.id, doorlock.name, e)}
                            className="p-1 text-error hover:bg-error-container transition-colors rounded"
                            title="Delete Doorlock"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Terminal Mapping Panel */}
        <div
          className="w-full lg:w-[46%] flex flex-col bg-white shadow-xs border border-outline-variant/40 rounded-xl overflow-hidden relative"
          id="terminal-panel"
        >
          {/* Header matching Screen 1 */}
          <div className="p-4 flex flex-col gap-1.5 bg-surface-container-low border-b border-outline-variant/30">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">router</span>
                Terminal Mapping
              </h2>
              <button
                type="button"
                onClick={(e) => handleOpenAddTerminal(selectedDoorlock || undefined, e)}
                className="bg-white border border-outline-variant text-on-surface px-3.5 py-1.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-surface-container-high transition-colors flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Terminal</span>
              </button>
            </div>

            <p className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              <span>Terminals for</span>
              <strong className="text-on-surface font-semibold ml-0.5" id="selected-doorlock-name">
                {selectedDoorlock?.name || 'Main Entrance'}
              </strong>
            </p>
          </div>

          {/* Terminals list or empty state */}
          <div className="flex-1 overflow-auto bg-surface p-4">
            {!selectedDoorlock ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-outline text-[40px]">router</span>
                </div>
                <h3 className="text-[16px] font-bold text-on-surface mb-1">No Doorlock Selected</h3>
                <p className="text-[13px] text-on-surface-variant max-w-sm">
                  Select a doorlock system from the main list to view and manage its associated network terminals.
                </p>
              </div>
            ) : selectedDoorlock.terminals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-outline text-[40px]">sensors_off</span>
                </div>
                <h3 className="text-[16px] font-bold text-on-surface mb-1">No Terminals Mapped</h3>
                <p className="text-[13px] text-on-surface-variant max-w-sm mb-4">
                  No encoding terminal mapped to {selectedDoorlock.name} yet.
                </p>
                <button
                  type="button"
                  onClick={(e) => handleOpenAddTerminal(selectedDoorlock, e)}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add First Terminal</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedDoorlock.terminals.map((terminal) => {
                  const isOnline = terminal.status === 'Online';

                  return (
                    <div
                      key={terminal.id}
                      className="bg-white border border-outline-variant/50 rounded-lg p-4 hover:shadow-xs transition-shadow group relative overflow-hidden"
                    >
                      {/* Left colored border strip matching screenshot */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isOnline ? 'bg-secondary' : 'bg-outline'
                        }`}
                      ></div>

                      <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                          <h4
                            className={`font-bold text-[14px] text-on-surface ${
                              !isOnline ? 'opacity-75' : ''
                            }`}
                          >
                            {terminal.name}
                          </h4>
                          <div
                            className={`text-[12px] text-on-surface-variant font-mono flex items-center gap-1 mt-1 ${
                              !isOnline ? 'opacity-70' : ''
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">lan</span>
                            <span>{terminal.ipAddress}</span>
                            <span className="text-outline-variant px-1">|</span>
                            <span>Port: {terminal.port}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider gap-1.5 border ${
                            isOnline
                              ? 'bg-surface-container-low text-on-surface-variant border-outline-variant/60'
                              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 opacity-70'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOnline ? 'bg-secondary' : 'bg-outline'
                            }`}
                          ></span>
                          {terminal.status}
                        </span>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-end gap-3 mt-3 pt-2.5 border-t border-[#f2f4f6]">
                        <button
                          type="button"
                          onClick={() => handleTestTerminalConnection(terminal)}
                          className={`text-[13px] font-semibold text-secondary hover:text-on-secondary-fixed-variant transition-colors ${
                            !isOnline ? 'opacity-75' : ''
                          }`}
                        >
                          Test Connection
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditTerminal(terminal, selectedDoorlock, e)}
                          className={`text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors ml-2 ${
                            !isOnline ? 'opacity-75' : ''
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTerminal(terminal.id, selectedDoorlock.id, terminal.name)
                          }
                          className="text-[13px] font-semibold text-error hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Encode Keycard Simulation Modal */}
      {showEncodeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#c6c6cd]/50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">contactless</span>
                <h3 className="font-bold text-[18px] text-[#191c1e]">Write Guest Keycard</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEncodeModal(false)}
                className="text-[#75859d] hover:text-[#191c1e] p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Doorlock System
                </label>
                <select
                  value={encodeData.doorlockName}
                  onChange={(e) => setEncodeData({ ...encodeData, doorlockName: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px]"
                >
                  {doorlockSystems.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.doorlockId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={encodeData.roomNumber}
                    onChange={(e) => setEncodeData({ ...encodeData, roomNumber: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Number of Keys
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={encodeData.keysCount}
                    onChange={(e) => setEncodeData({ ...encodeData, keysCount: Number(e.target.value) })}
                    className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Primary Guest Name
                </label>
                <input
                  type="text"
                  value={encodeData.guestName}
                  onChange={(e) => setEncodeData({ ...encodeData, guestName: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-[14px]"
                />
              </div>

              {isEncoding && (
                <div className="bg-[#e0ecfc] p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between text-[12px] font-semibold text-[#0058be]">
                    <span>Writing RFID IC chip...</span>
                    <span>{encodeProgress}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0058be] h-full transition-all duration-200"
                      style={{ width: `${encodeProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#eceef0]">
              <button
                type="button"
                onClick={() => setShowEncodeModal(false)}
                className="px-4 py-2 text-[13px] font-medium text-on-surface hover:bg-surface-container rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isEncoding}
                onClick={handleStartEncoding}
                className="px-5 py-2 text-[13px] font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">contactless</span>
                <span>{isEncoding ? 'Writing Card...' : 'Encode Card on Reader'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
