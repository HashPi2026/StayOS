import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { BusinessSourceItem, CommissionRule, ComplianceDocument } from '../types';
import { INITIAL_BUSINESS_SOURCES, INITIAL_CATEGORIES } from '../mockData';

interface BusinessSourceScreenProps {
  onNavigateToTab?: (tabKey: string, filterParam?: string) => void;
}

export const BusinessSourceScreen: React.FC<BusinessSourceScreenProps> = ({ onNavigateToTab }) => {
  const { navigate, addToast } = useProperty();
  const [sources, setSources] = useState<BusinessSourceItem[]>(INITIAL_BUSINESS_SOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [statusSegment, setStatusSegment] = useState<'all' | 'active' | 'credit'>('all');

  // Slide-Over Profile Drawer (Pattern B)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('edit');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('src-1');

  // Form State
  const [formCategory, setFormCategory] = useState('Online Travel Agencies (OTA)');
  const [formShortName, setFormShortName] = useState('BK-01');
  const [formName, setFormName] = useState('Booking.com Channel');
  const [formIata, setFormIata] = useState('IATA-9821045');
  const [formCrsEngine, setFormCrsEngine] = useState('SynXis ARI / TravelClick');
  const [formContactPerson, setFormContactPerson] = useState('Sarah Lindqvist — Channel Account Lead');
  const [formAddress, setFormAddress] = useState('Herengracht 597, 1017 CE Amsterdam, Netherlands');
  const [formPrepaidOnly, setFormPrepaidOnly] = useState(false);
  const [formRateApply, setFormRateApply] = useState(true);
  const [formTaxExempt, setFormTaxExempt] = useState(false);
  const [formSelfCheckInPayment, setFormSelfCheckInPayment] = useState(true);
  const [formCommissionApply, setFormCommissionApply] = useState(true);
  const [formCreditApply, setFormCreditApply] = useState(true);
  const [formDueDays, setFormDueDays] = useState(30);
  const [formCreditLimit, setFormCreditLimit] = useState(25000);
  const [formCommissionRules, setFormCommissionRules] = useState<CommissionRule[]>([]);
  const [formDocuments, setFormDocuments] = useState<ComplianceDocument[]>([]);

  // Inline Commission Row in Drawer
  const [showInlineCommissionRow, setShowInlineCommissionRow] = useState(false);
  const [newRuleCategory, setNewRuleCategory] = useState('Online Travel Agencies (OTA)');
  const [newRuleRateType, setNewRuleRateType] = useState('Weekend Special');
  const [newRuleRatePercent, setNewRuleRatePercent] = useState('12.50');

  // Active Source being viewed/edited
  const activeSource = useMemo(() => {
    return sources.find((s) => s.id === selectedSourceId);
  }, [sources, selectedSourceId]);

  // Filtered Sources
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        (s.iataNumber && s.iataNumber.toLowerCase().includes(q)) ||
        s.crsEngine.toLowerCase().includes(q) ||
        s.sourceCode.toLowerCase().includes(q);

      const matchesCat =
        selectedCategoryFilter === 'All Categories' ||
        s.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());

      const matchesStatus =
        statusSegment === 'all' ||
        (statusSegment === 'active' && s.isActive) ||
        (statusSegment === 'credit' && s.creditApply);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [sources, searchQuery, selectedCategoryFilter, statusSegment]);

  // KPI Calculations
  const totalCount = 24; // Representative full catalog
  const activeCount = 19;
  const totalExposure = sources.reduce((sum, s) => sum + s.dueBalance, 0) + 34230; // ~42,650
  const aggLimit = 150000;
  const availableExposure = aggLimit - totalExposure;
  const exposurePercent = ((totalExposure / aggLimit) * 100).toFixed(1);
  const commissionEligibleCount = 14;

  const openDrawer = (mode: 'add' | 'edit', source?: BusinessSourceItem) => {
    setDrawerMode(mode);
    setShowInlineCommissionRow(false);
    if (mode === 'add') {
      setSelectedSourceId('');
      setFormCategory('Online Travel Agencies (OTA)');
      setFormShortName('');
      setFormName('');
      setFormIata('');
      setFormCrsEngine('SynXis ARI / TravelClick');
      setFormContactPerson('');
      setFormAddress('');
      setFormPrepaidOnly(false);
      setFormRateApply(true);
      setFormTaxExempt(false);
      setFormSelfCheckInPayment(true);
      setFormCommissionApply(true);
      setFormCreditApply(true);
      setFormDueDays(30);
      setFormCreditLimit(15000);
      setFormCommissionRules([]);
      setFormDocuments([]);
    } else if (source) {
      setSelectedSourceId(source.id);
      setFormCategory(source.category);
      setFormShortName(source.shortName);
      setFormName(source.name);
      setFormIata(source.iataNumber || '');
      setFormCrsEngine(source.crsEngine);
      setFormContactPerson(source.contactPerson);
      setFormAddress(source.address);
      setFormPrepaidOnly(source.prepaidOnly);
      setFormRateApply(source.rateApply);
      setFormTaxExempt(source.taxExempt);
      setFormSelfCheckInPayment(source.selfCheckInPayment);
      setFormCommissionApply(source.commissionApply);
      setFormCreditApply(source.creditApply);
      setFormDueDays(source.termsDays);
      setFormCreditLimit(source.creditLimit);
      setFormCommissionRules(source.commissionRules || []);
      setFormDocuments(source.documents || []);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSaveSource = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Business Source Name is required.',
        type: 'error',
      });
      return;
    }

    if (drawerMode === 'add') {
      const newSource: BusinessSourceItem = {
        id: `src-${Date.now()}`,
        sourceCode: `BS-2026-${String(sources.length + 1).padStart(3, '0')}`,
        name: formName.trim(),
        shortName: formShortName.trim().toUpperCase() || 'SRC',
        category: formCategory,
        iataNumber: formIata.trim(),
        crsEngine: formCrsEngine,
        crsStatus: formCrsEngine.split(' ')[0],
        contactPerson: formContactPerson.trim(),
        address: formAddress.trim(),
        isActive: true,
        dueBalance: 0,
        creditLimit: formCreditLimit,
        termsDays: formDueDays,
        lastSyncTime: 'Just now',
        initials: formShortName.slice(0, 2).toUpperCase() || 'BS',
        badgeBgColor: '#4472C4',
        prepaidOnly: formPrepaidOnly,
        rateApply: formRateApply,
        taxExempt: formTaxExempt,
        selfCheckInPayment: formSelfCheckInPayment,
        commissionApply: formCommissionApply,
        creditApply: formCreditApply,
        commissionRules: formCommissionRules,
        documents: formDocuments,
      };
      setSources((prev) => [newSource, ...prev]);
      addToast({
        title: 'Business Source Created',
        message: `Account '${newSource.name}' added to distribution master.`,
        type: 'success',
      });
    } else {
      setSources((prev) =>
        prev.map((s) =>
          s.id === selectedSourceId
            ? {
                ...s,
                name: formName.trim(),
                shortName: formShortName.trim().toUpperCase(),
                category: formCategory,
                iataNumber: formIata.trim(),
                crsEngine: formCrsEngine,
                contactPerson: formContactPerson.trim(),
                address: formAddress.trim(),
                prepaidOnly: formPrepaidOnly,
                rateApply: formRateApply,
                taxExempt: formTaxExempt,
                selfCheckInPayment: formSelfCheckInPayment,
                commissionApply: formCommissionApply,
                creditApply: formCreditApply,
                termsDays: formDueDays,
                creditLimit: formCreditLimit,
                commissionRules: formCommissionRules,
                documents: formDocuments,
              }
            : s
        )
      );
      addToast({
        title: 'Business Source Updated',
        message: `Saved configuration for '${formName}'.`,
        type: 'success',
      });
    }

    closeDrawer();
  };

  const handleAddCommissionRule = () => {
    const rateNum = parseFloat(newRuleRatePercent);
    if (isNaN(rateNum) || rateNum <= 0) {
      addToast({
        title: 'Invalid Rate',
        message: 'Please enter a valid positive percentage.',
        type: 'warning',
      });
      return;
    }
    const newRule: CommissionRule = {
      id: `cr-${Date.now()}`,
      category: newRuleCategory,
      rateType: newRuleRateType,
      commissionRate: rateNum,
    };
    setFormCommissionRules((prev) => [...prev, newRule]);
    setShowInlineCommissionRow(false);
    setNewRuleRatePercent('12.50');
  };

  const handleRemoveCommissionRule = (ruleId: string) => {
    setFormCommissionRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleAddDocumentRow = () => {
    const newDoc: ComplianceDocument = {
      id: `doc-${Date.now()}`,
      documentType: 'Corporate Master Agreement',
      documentNumber: `DOC-REF-${Date.now().toString().slice(-5)}`,
      status: 'Pending Review',
    };
    setFormDocuments((prev) => [...prev, newDoc]);
  };

  const handleRemoveDocumentRow = (docId: string) => {
    setFormDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleExportAuditLedger = () => {
    const headers = ['Source ID', 'Business Source Name', 'Category', 'Due Balance', 'Credit Limit', 'CRS Engine', 'Status'];
    const rows = filteredSources.map((s) => [
      `"${s.sourceCode}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.dueBalance,
      s.creditLimit,
      `"${s.crsEngine}"`,
      s.isActive ? 'Active' : 'Inactive',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Business_Sources_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      title: 'Ledger Exported',
      message: 'Downloaded Business Sources Audit Ledger.',
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Page Content Container */}
      <div className="px-lg py-md flex flex-col gap-lg max-w-[1720px] mx-auto w-full">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-xs font-body-sm text-on-surface-variant">
          <span onClick={() => navigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">
            Configuration
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToTab?.('category')} className="hover:text-on-surface transition-colors cursor-pointer">
            Business Sources
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-[#4472C4]">Business Source Master</span>
        </div>

        {/* Page Header & Action Anchor */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Business Source Configuration
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Manage third-party distribution channels, corporate contracted accounts, OTAs, credit ceilings, and negotiated settlement schedules.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={handleExportAuditLedger}
              className="inline-flex items-center gap-xs px-md py-base bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer border border-outline-variant/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Audit Ledger
            </button>
            <button
              onClick={() => openDrawer('add')}
              className="inline-flex items-center gap-xs px-md py-base bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Add Business Source
            </button>
          </div>
        </div>

        {/* KPI Summary Metric Cards (Bento Layer) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between gap-md relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-xs">
                <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Business Sources</span>
                <div className="flex items-baseline gap-xs">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight">{totalCount}</span>
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant">Accounts</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
              </div>
            </div>
            <div className="flex items-center gap-md pt-xs border-t border-outline-variant/20">
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-[#4472C4]" />
                <span className="font-body-sm text-body-sm text-on-surface font-medium">{activeCount} Active</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-surface-container-highest" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">5 Inactive/Draft</span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between gap-md relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-xs">
                <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Ledger Exposure</span>
                <div className="flex items-baseline gap-xs">
                  <span className="font-data-mono text-headline-md font-bold text-on-surface">
                    ${totalExposure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold bg-[#4472C4]/10 px-xs py-0.5 rounded">
                    {exposurePercent}% Cap
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#4472C4]/15 flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-[#4472C4] h-full rounded-full transition-all duration-500" style={{ width: `${exposurePercent}%` }} />
              </div>
              <div className="flex items-center justify-between font-label-uppercase text-[11px] text-on-surface-variant">
                <span>Agg. Limit: ${aggLimit.toLocaleString('en-US')}.00</span>
                <span className="font-data-mono text-on-surface font-medium">
                  ${availableExposure.toLocaleString('en-US')}.00 Available
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between gap-md relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-xs">
                <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Commission Eligible Sources</span>
                <div className="flex items-baseline gap-xs">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight">{commissionEligibleCount}</span>
                  <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold bg-[#4472C4]/10 px-xs py-0.5 rounded">
                    Active Channels
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-xs text-body-sm text-on-surface-variant border-t border-outline-variant/20">
              <span>Settlement Cycle: Net-30</span>
              <span className="inline-flex items-center gap-xs font-data-mono text-[11px] text-[#4472C4] font-medium">
                Next Audit: 30-Jun
                <span className="material-symbols-outlined text-[14px]">event_repeat</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Operational Controls Bar */}
        <div className="bg-surface-container-lowest p-sm rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-sm border border-outline-variant/30">
          <div className="flex flex-1 items-center gap-sm">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container-low focus:bg-surface-container-lowest rounded text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant border border-transparent focus:border-[#4472C4]"
                placeholder="Filter by source name, IATA, CRS engine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-low px-md py-xs pr-xl rounded text-body-sm text-on-surface outline-none cursor-pointer border border-transparent focus:border-[#4472C4]"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="OTA">OTA (Online Travel Agencies)</option>
                <option value="Corporate Direct">Corporate Direct</option>
                <option value="TMC">TMC (Travel Mgmt)</option>
                <option value="Wholesale">Wholesale</option>
                <option value="GDS">GDS Network</option>
              </select>
              <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-xs bg-surface-container-low p-xs rounded-lg self-start lg:self-auto border border-outline-variant/30">
            <button
              onClick={() => setStatusSegment('all')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              All (24)
            </button>
            <button
              onClick={() => setStatusSegment('active')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'active'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Active (19)
            </button>
            <button
              onClick={() => setStatusSegment('credit')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'credit'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Credit Enabled (12)
            </button>
          </div>
        </div>

        {/* Master Data Table Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <th className="px-md py-sm">Business Source Name</th>
                  <th className="px-md py-sm">Category</th>
                  <th className="px-md py-sm min-w-[280px]">Due Balance / Credit Limit</th>
                  <th className="px-md py-sm">CRS Status</th>
                  <th className="px-md py-sm">Is Active</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60">
                {filteredSources.map((source) => {
                  const isSelected = isDrawerOpen && selectedSourceId === source.id;
                  const ratio = source.creditLimit > 0 ? (source.dueBalance / source.creditLimit) * 100 : 0;
                  const isNearLimit = ratio >= 85;

                  return (
                    <tr
                      key={source.id}
                      onClick={() => openDrawer('edit', source)}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#4472C4]/10' : ''
                      }`}
                    >
                      <td className="px-md py-md font-body-md text-on-surface">
                        <div className="flex items-center gap-md">
                          <div
                            className="w-9 h-9 rounded text-white font-headline-md font-bold text-title-sm flex items-center justify-center flex-shrink-0 shadow-xs"
                            style={{ backgroundColor: source.badgeBgColor || '#4472C4' }}
                          >
                            {source.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-on-surface truncate">{source.name}</span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">
                              {source.sourceCode} {source.iataNumber ? `• ${source.iataNumber}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded text-[11px] font-label-uppercase bg-[#4472C4]/10 text-[#4472C4] font-semibold">
                          {source.category.includes('OTA')
                            ? 'OTA'
                            : source.category.includes('Corporate')
                            ? 'Corporate Direct'
                            : source.category.includes('TMC')
                            ? 'TMC / GDS'
                            : source.category.includes('Direct')
                            ? 'Brand Direct'
                            : 'Wholesale'}
                        </span>
                      </td>
                      <td className="px-md py-md">
                        <div className="flex flex-col gap-xs max-w-xs">
                          <div className="flex items-center justify-between font-data-mono text-data-mono">
                            <span className="font-semibold text-on-surface">
                              ${source.dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-on-surface-variant">
                              / ${source.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {source.creditLimit > 0 ? (
                            <>
                              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isNearLimit ? 'bg-error' : 'bg-[#4472C4]'
                                  }`}
                                  style={{ width: `${Math.min(100, ratio)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-label-uppercase text-on-surface-variant">
                                  {ratio.toFixed(1)}% Net-{source.termsDays} Settlement
                                </span>
                                {isNearLimit && (
                                  <span className="inline-flex items-center px-xs py-0 rounded text-[10px] font-label-uppercase bg-error-container text-on-error-container font-semibold">
                                    Near Limit
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant italic font-body-sm">
                              Prepaid only • Zero credit liability
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <span className="inline-flex items-center gap-xs font-body-sm text-on-surface">
                          <span className="w-2 h-2 rounded-full bg-[#4472C4]" />
                          {source.crsStatus}
                        </span>
                      </td>
                      <td className="px-md py-md">
                        <span className="inline-flex items-center px-sm py-0.5 rounded text-[11px] font-label-uppercase bg-surface-container-high text-on-surface font-semibold">
                          {source.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-md py-md text-right">
                        <div
                          className="inline-flex items-center gap-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-xs text-on-surface-variant hover:text-[#4472C4] hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                            onClick={() => openDrawer('edit', source)}
                            title="Edit Business Source"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_square</span>
                          </button>
                          <button
                            className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                            onClick={() => onNavigateToTab?.('invoice', source.name)}
                            title="View Invoices & Folios"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                          </button>
                          <button
                            className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                            title="More Options"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-surface-container-low px-md py-sm flex flex-col sm:flex-row items-center justify-between gap-sm text-body-sm text-on-surface-variant border-t border-outline-variant/30">
            <span className="font-data-mono text-[12px]">
              Showing 1 to {filteredSources.length} of {totalCount} entries
            </span>
            <div className="flex items-center gap-xs">
              <button
                className="p-xs rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface disabled:opacity-50 cursor-pointer"
                disabled
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-sm py-xs bg-[#4472C4] text-white rounded font-label-uppercase text-[11px] font-bold">
                1
              </span>
              <span className="px-sm py-xs hover:bg-surface-container-highest rounded font-label-uppercase text-[11px] cursor-pointer">
                2
              </span>
              <span className="px-sm py-xs hover:bg-surface-container-highest rounded font-label-uppercase text-[11px] cursor-pointer">
                3
              </span>
              <button
                className="p-xs rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Profile Drawer (Pattern B - 760px) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[760px] bg-surface-container-lowest shadow-2xl flex flex-col justify-between z-10 h-full border-l border-outline-variant/40 animate-in slide-in-from-right duration-200">
            {/* Drawer Fixed Header */}
            <div className="px-lg py-md bg-surface-container-lowest flex items-center justify-between flex-shrink-0 border-b border-outline-variant/30">
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-sm">
                  <span className="font-title-sm text-title-sm text-on-surface font-semibold tracking-tight">
                    {drawerMode === 'add' ? 'Add Business Source' : 'Edit Business Source'}
                  </span>
                  <span className="inline-flex items-center px-xs py-0.5 rounded text-[11px] font-label-uppercase bg-[#4472C4]/10 text-[#4472C4] font-semibold">
                    {formCategory.includes('OTA')
                      ? 'OTA Channel'
                      : formCategory.includes('Corporate')
                      ? 'Corporate Direct'
                      : 'Commercial Channel'}
                  </span>
                </div>
                <span className="font-data-mono text-[12px] text-on-surface-variant">
                  {drawerMode === 'edit' && activeSource
                    ? `Source ID: ${activeSource.sourceCode} • Last Synced: ${activeSource.lastSyncTime}`
                    : 'System ID: Auto-Generated upon save'}
                </span>
              </div>
              <button
                className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                onClick={closeDrawer}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Live Credit Utilization Progress Banner */}
            {drawerMode === 'edit' && activeSource && (
              <div className="bg-surface-container-low px-lg py-md flex-shrink-0 border-b border-outline-variant/30">
                <div className="flex flex-col gap-sm bg-surface-container-lowest p-md rounded-lg shadow-sm border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="font-label-uppercase text-label-uppercase text-on-surface font-semibold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[#4472C4] text-[18px]">monetization_on</span>
                      Live Due Balance Against Credit Limit
                    </span>
                    <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold">
                      Terms: Net-{formDueDays} Settlement
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-sm py-xs">
                    <div className="flex flex-col">
                      <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Current Balance</span>
                      <span className="font-data-mono text-title-sm font-bold text-on-surface">
                        ${activeSource.dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Credit Limit</span>
                      <span className="font-data-mono text-title-sm font-bold text-on-surface-variant">
                        ${formCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Available Capacity</span>
                      <span className="font-data-mono text-title-sm font-bold text-[#4472C4]">
                        ${Math.max(0, formCreditLimit - activeSource.dueBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4472C4] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, formCreditLimit > 0 ? (activeSource.dueBalance / formCreditLimit) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-[11px] text-on-surface-variant">
                    <span>
                      {formCreditLimit > 0
                        ? ((activeSource.dueBalance / formCreditLimit) * 100).toFixed(1)
                        : 0}
                      % Exposure Utilized
                    </span>
                    <span>Settlement Due: {formDueDays} Days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer Scrollable Form Sections */}
            <div className="flex-1 overflow-y-auto px-lg py-md space-y-xl">
              {/* SECTION 1: Commercial Details & Operational Terms */}
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
                  <div className="flex flex-col">
                    <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">1. Details & Commercial Terms</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Define channel classification, CRS engine link, and city ledger terms.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#4472C4]">tune</span>
                </div>

                {/* 2-Column Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {/* Field: Category */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Category *</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-surface-container-low px-md py-xs pr-xl rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest border border-outline-variant/40 focus:border-[#4472C4]"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        {INITIAL_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Field: Short Name */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Short Name *</label>
                    <input
                      className="w-full bg-surface-container-low px-md py-xs rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest font-data-mono font-semibold border border-outline-variant/40 focus:border-[#4472C4]"
                      type="text"
                      value={formShortName}
                      onChange={(e) => setFormShortName(e.target.value)}
                      placeholder="e.g. BK-01"
                    />
                  </div>

                  {/* Field: Business Source Name */}
                  <div className="flex flex-col gap-xs sm:col-span-2">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Business Source Name *</label>
                    <input
                      className="w-full bg-surface-container-low px-md py-xs rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest font-medium border border-outline-variant/40 focus:border-[#4472C4]"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Booking.com Channel"
                    />
                  </div>

                  {/* Field: IATA Number */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">IATA Number</label>
                    <input
                      className="w-full bg-surface-container-low px-md py-xs rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest font-data-mono border border-outline-variant/40 focus:border-[#4472C4]"
                      type="text"
                      value={formIata}
                      onChange={(e) => setFormIata(e.target.value)}
                      placeholder="e.g. IATA-9821045"
                    />
                  </div>

                  {/* Field: CRS Engine */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">CRS Engine</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-surface-container-low px-md py-xs pr-xl rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest border border-outline-variant/40 focus:border-[#4472C4]"
                        value={formCrsEngine}
                        onChange={(e) => setFormCrsEngine(e.target.value)}
                      >
                        <option value="SynXis ARI / TravelClick">SynXis ARI / TravelClick</option>
                        <option value="Sabre Hospitality Solutions">Sabre Hospitality Solutions</option>
                        <option value="Amadeus GDS Connect">Amadeus GDS Connect</option>
                        <option value="SiteMinder Channel Manager">SiteMinder Channel Manager</option>
                        <option value="Expedia Connect API">Expedia Connect API</option>
                        <option value="Concur Direct Link">Concur Direct Link</option>
                        <option value="Native Web Engine">Native Web Engine</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Field: Contact Person */}
                  <div className="flex flex-col gap-xs sm:col-span-2">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Contact Person</label>
                    <input
                      className="w-full bg-surface-container-low px-md py-xs rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest border border-outline-variant/40 focus:border-[#4472C4]"
                      type="text"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      placeholder="e.g. Sarah Lindqvist — Channel Account Lead"
                    />
                  </div>

                  {/* Field: Address */}
                  <div className="flex flex-col gap-xs sm:col-span-2">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Address</label>
                    <input
                      className="w-full bg-surface-container-low px-md py-xs rounded text-body-md text-on-surface outline-none focus:bg-surface-container-lowest border border-outline-variant/40 focus:border-[#4472C4]"
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="e.g. Herengracht 597, 1017 CE Amsterdam, Netherlands"
                    />
                  </div>
                </div>

                {/* Operational Toggles & Ledger Rules */}
                <div className="bg-surface-container-low p-md rounded-xl space-y-md border border-outline-variant/30">
                  <span className="font-label-uppercase text-label-uppercase text-on-surface font-semibold block">
                    Operational Policies & Direct Billing
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    {/* Toggle: Prepaid */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Prepaid Only</span>
                        <span className="text-[11px] text-on-surface-variant">Requires advance payment</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formPrepaidOnly}
                        onChange={(e) => setFormPrepaidOnly(e.target.checked)}
                      />
                    </label>

                    {/* Toggle: Rate Apply */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Rate Apply</span>
                        <span className="text-[11px] text-on-surface-variant">Inject rates into CRS engine</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formRateApply}
                        onChange={(e) => setFormRateApply(e.target.checked)}
                      />
                    </label>

                    {/* Toggle: Tax Exempt */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Tax Exempt</span>
                        <span className="text-[11px] text-on-surface-variant">Suppress local hospitality VAT</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formTaxExempt}
                        onChange={(e) => setFormTaxExempt(e.target.checked)}
                      />
                    </label>

                    {/* Toggle: Self Checkin Payment */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Self Check-in Payment</span>
                        <span className="text-[11px] text-on-surface-variant">Allow pre-auth via guest portal</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formSelfCheckInPayment}
                        onChange={(e) => setFormSelfCheckInPayment(e.target.checked)}
                      />
                    </label>

                    {/* Toggle: Commission Apply */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Commission Apply</span>
                        <span className="text-[11px] text-on-surface-variant">Monthly statement reconciliation</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formCommissionApply}
                        onChange={(e) => setFormCommissionApply(e.target.checked)}
                      />
                    </label>

                    {/* Toggle: Credit Apply */}
                    <label className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">Credit Apply</span>
                        <span className="text-[11px] text-on-surface-variant">Direct bill to city ledger</span>
                      </div>
                      <input
                        className="w-4 h-4 rounded text-[#4472C4] cursor-pointer"
                        type="checkbox"
                        checked={formCreditApply}
                        onChange={(e) => setFormCreditApply(e.target.checked)}
                      />
                    </label>
                  </div>

                  {/* Dynamic inputs for Due Days and Limit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-xs">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                        Settlement Terms (Due Days)
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-lowest px-md py-xs rounded text-body-md font-data-mono text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                          type="number"
                          value={formDueDays}
                          onChange={(e) => setFormDueDays(parseInt(e.target.value, 10) || 0)}
                        />
                        <span className="absolute right-md top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">
                          Days
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                        Approved Credit Limit
                      </label>
                      <div className="relative">
                        <span className="absolute left-md top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">$</span>
                        <input
                          className="w-full bg-surface-container-lowest pl-xl pr-md py-xs rounded text-body-md font-data-mono font-semibold text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                          type="number"
                          value={formCreditLimit}
                          onChange={(e) => setFormCreditLimit(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Rate Category & Commission Rules */}
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
                  <div className="flex flex-col">
                    <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">2. Rate Category & Commission Rules</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Configure negotiated commission rates per individual rate schedule.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-[11px] rounded transition-colors cursor-pointer border border-outline-variant/30"
                    onClick={() => setShowInlineCommissionRow((prev) => !prev)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    + New Commission Rate
                  </button>
                </div>

                <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                        <th className="px-md py-xs">Category</th>
                        <th className="px-md py-xs">Rate Type</th>
                        <th className="px-md py-xs">Commission Rate</th>
                        <th className="px-md py-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container/60">
                      {formCommissionRules.length === 0 && !showInlineCommissionRow ? (
                        <tr>
                          <td colSpan={4} className="px-md py-md text-center text-on-surface-variant text-body-sm">
                            No special commission rates defined yet. Click "+ New Commission Rate" to configure.
                          </td>
                        </tr>
                      ) : (
                        formCommissionRules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="px-md py-base font-body-sm text-on-surface">{rule.category}</td>
                            <td className="px-md py-base font-body-sm text-on-surface font-medium">{rule.rateType}</td>
                            <td className="px-md py-base font-data-mono text-data-mono font-semibold text-[#4472C4]">
                              {rule.commissionRate.toFixed(2)} %
                            </td>
                            <td className="px-md py-base text-right">
                              <div className="inline-flex items-center gap-xs">
                                <button
                                  className="p-xs text-on-surface-variant hover:text-error cursor-pointer"
                                  onClick={() => handleRemoveCommissionRule(rule.id)}
                                  type="button"
                                  title="Delete rule"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}

                      {/* Inline Editable Form Row (Toggleable) */}
                      {showInlineCommissionRow && (
                        <tr className="bg-[#4472C4]/10">
                          <td className="px-md py-base">
                            <select
                              className="w-full bg-surface-container-lowest px-xs py-0.5 rounded text-body-sm text-on-surface outline-none border border-outline-variant/40"
                              value={newRuleCategory}
                              onChange={(e) => setNewRuleCategory(e.target.value)}
                            >
                              <option value="Online Travel Agencies (OTA)">Online Travel Agencies (OTA)</option>
                              <option value="Corporate Direct">Corporate Direct</option>
                              <option value="Travel Management Companies (TMC)">TMC</option>
                            </select>
                          </td>
                          <td className="px-md py-base">
                            <input
                              className="w-full bg-surface-container-lowest px-xs py-0.5 rounded text-body-sm text-on-surface outline-none border border-outline-variant/40"
                              value={newRuleRateType}
                              onChange={(e) => setNewRuleRateType(e.target.value)}
                              placeholder="e.g. Flash Sale Exclusive"
                            />
                          </td>
                          <td className="px-md py-base">
                            <div className="relative max-w-[120px]">
                              <input
                                className="w-full bg-surface-container-lowest px-xs py-0.5 rounded text-data-mono text-body-sm outline-none border border-outline-variant/40"
                                placeholder="12.50"
                                type="number"
                                step="0.5"
                                value={newRuleRatePercent}
                                onChange={(e) => setNewRuleRatePercent(e.target.value)}
                              />
                              <span className="absolute right-xs top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">%</span>
                            </div>
                          </td>
                          <td className="px-md py-base text-right">
                            <div className="inline-flex items-center gap-xs">
                              <button
                                className="px-xs py-0.5 bg-[#4472C4] text-white rounded font-label-uppercase text-[10px] cursor-pointer"
                                onClick={handleAddCommissionRule}
                                type="button"
                              >
                                Add
                              </button>
                              <button
                                className="px-xs py-0.5 bg-surface-container text-on-surface rounded font-label-uppercase text-[10px] cursor-pointer"
                                onClick={() => setShowInlineCommissionRow(false)}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: Documents & Compliance */}
              <div className="flex flex-col gap-md pb-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
                  <div className="flex flex-col">
                    <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">3. Documents & Compliance</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Attach verified corporate agreements, VAT licenses, and tax IDs.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-[11px] rounded transition-colors cursor-pointer border border-outline-variant/30"
                    onClick={handleAddDocumentRow}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">post_add</span>
                    + Add Document Row
                  </button>
                </div>

                {/* Strict Compliance Callout */}
                <div className="flex items-start gap-sm p-sm rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[#4472C4] text-[20px] flex-shrink-0 mt-0.5">policy</span>
                  <p className="text-body-sm text-[12px] leading-relaxed text-on-surface-variant">
                    <strong className="text-on-surface font-medium">Compliance Note:</strong> Per StayOS document retention protocol, upload of binary image files (.png, .jpg) is disabled. Enter official document registration numbers and verified filing references only.
                  </p>
                </div>

                {/* Compliance Documents Table */}
                <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                        <th className="px-md py-xs">Document Type</th>
                        <th className="px-md py-xs">Document Number / Registration</th>
                        <th className="px-md py-xs">Status</th>
                        <th className="px-md py-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container/60">
                      {formDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-md py-md text-center text-on-surface-variant text-body-sm">
                            No compliance records logged. Click "+ Add Document Row" to add tax or merchant contracts.
                          </td>
                        </tr>
                      ) : (
                        formDocuments.map((doc, idx) => (
                          <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="px-md py-base font-body-sm text-on-surface">
                              <input
                                type="text"
                                className="w-full bg-transparent px-1 py-0.5 rounded text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest border-b border-transparent focus:border-[#4472C4]"
                                value={doc.documentType}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormDocuments((prev) =>
                                    prev.map((d, i) => (i === idx ? { ...d, documentType: val } : d))
                                  );
                                }}
                              />
                            </td>
                            <td className="px-md py-base font-data-mono text-data-mono text-on-surface">
                              <input
                                type="text"
                                className="w-full bg-transparent px-1 py-0.5 rounded text-data-mono text-on-surface outline-none focus:bg-surface-container-lowest border-b border-transparent focus:border-[#4472C4]"
                                value={doc.documentNumber}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormDocuments((prev) =>
                                    prev.map((d, i) => (i === idx ? { ...d, documentNumber: val } : d))
                                  );
                                }}
                              />
                            </td>
                            <td className="px-md py-base font-body-sm">
                              <span
                                className={`inline-flex items-center gap-xs px-xs py-0.5 rounded text-[11px] font-label-uppercase font-semibold ${
                                  doc.status.includes('Active')
                                    ? 'bg-[#059669]/10 text-[#059669]'
                                    : doc.status.includes('Signed')
                                    ? 'bg-[#4472C4]/10 text-[#4472C4]'
                                    : 'bg-surface-container-high text-on-surface-variant'
                                }`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-md py-base text-right font-body-sm">
                              <button
                                className="p-xs text-on-surface-variant hover:text-error transition-colors rounded cursor-pointer"
                                onClick={() => handleRemoveDocumentRow(doc.id)}
                                type="button"
                                title="Delete document row"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Fixed Sticky Footer */}
            <div className="px-lg py-md bg-surface-container-lowest shadow-lg flex items-center justify-between flex-shrink-0 border-t border-outline-variant/30">
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="font-body-sm text-[12px] text-on-surface-variant">All validation checks passed</span>
              </div>
              <div className="flex items-center gap-sm">
                <button
                  className="px-md py-base bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer"
                  onClick={closeDrawer}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-xs px-lg py-base bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors shadow-md cursor-pointer active:scale-95"
                  onClick={handleSaveSource}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Business Source
                  <kbd className="hidden sm:inline-block ml-xs px-xs py-0 text-[10px] bg-white/20 rounded font-data-mono text-white">
                    ⌘S
                  </kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
