import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { DocumentTypeItem, DocumentCategory } from '@/src/types';

export const DocumentTypesView: React.FC = () => {
  const {
    documentTypes,
    editingDocumentTypeId,
    setEditingDocumentTypeId,
    addDocumentType,
    updateDocumentType,
    deleteDocumentType,
    toggleDocumentTypeStatus,
    setDefaultDocumentType,
    isDocumentTypeDrawerOpen,
    drawerDocumentType,
    openAddDocumentTypeDrawer,
    openEditDocumentTypeDrawer,
    closeDocumentTypeDrawer,
    isDeleteDocumentTypeDialogOpen,
    deleteTargetDocumentType,
    openDeleteDocumentTypeDialog,
    closeDeleteDocumentTypeDialog,
    navigate,
    addToast,
  } = useProperty();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveMenuDocId(null);
      }
    };
    if (activeMenuDocId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuDocId]);

  // Drawer Form State
  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    category: DocumentCategory;
    description: string;
    isDefault: boolean;
    isActive: boolean;
  }>({
    shortName: '',
    name: '',
    category: 'Identity',
    description: '',
    isDefault: false,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Sync drawer state on open/edit
  useEffect(() => {
    if (isDocumentTypeDrawerOpen) {
      if (drawerDocumentType) {
        setFormData({
          shortName: drawerDocumentType.shortName,
          name: drawerDocumentType.name,
          category: drawerDocumentType.category,
          description: drawerDocumentType.description || '',
          isDefault: drawerDocumentType.isDefault,
          isActive: drawerDocumentType.isActive,
        });
      } else {
        setFormData({
          shortName: '',
          name: '',
          category: 'Identity',
          description: '',
          isDefault: false,
          isActive: true,
        });
      }
      setFormErrors({});
    }
  }, [isDocumentTypeDrawerOpen, drawerDocumentType]);

  // Filtered List
  const filteredDocTypes = useMemo(() => {
    return documentTypes.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' ? true : doc.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'active'
          ? doc.isActive
          : !doc.isActive;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documentTypes, searchQuery, selectedCategory, selectedStatus]);

  const handleSaveDocType = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.shortName.trim()) {
      errors.shortName = 'Short Name is required';
    } else if (formData.shortName.trim().length > 8) {
      errors.shortName = 'Short Name must be 8 characters or fewer';
    }

    if (!formData.name.trim()) {
      errors.name = 'Document Name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (drawerDocumentType) {
      updateDocumentType(drawerDocumentType.id, {
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      });
    } else {
      addDocumentType({
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      });
    }

    closeDocumentTypeDrawer();
  };

  const getCategoryBadgeClass = (category: DocumentCategory) => {
    switch (category) {
      case 'Identity':
        return 'bg-[#0b1c30] text-[#ffffff]';
      case 'Visa':
        return 'bg-[#2170e4] text-[#ffffff]';
      case 'Voucher':
        return 'bg-[#e0e3e5] text-[#191c1e]';
      case 'Health':
        return 'bg-[#d8e2ff] text-[#001a42]';
      case 'Business':
        return 'bg-[#dae2fd] text-[#131b2e]';
      case 'Other':
      default:
        return 'bg-[#eceef0] text-[#45464d]';
    }
  };

  const getShortNameBadgeClass = (category: DocumentCategory) => {
    switch (category) {
      case 'Identity':
        return 'bg-[#d8e2ff] text-[#001a42]';
      case 'Visa':
        return 'bg-[#2170e4] text-[#ffffff]';
      case 'Voucher':
        return 'bg-[#e0e3e5] text-[#191c1e]';
      case 'Health':
        return 'bg-[#d3e4fe] text-[#0b1c30]';
      case 'Business':
        return 'bg-[#dae2fd] text-[#131b2e]';
      case 'Other':
      default:
        return 'bg-[#e0e3e5] text-[#191c1e]';
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen relative font-sans text-[#191c1e] bg-[#f7f9fb]">
      {/* Header Sticky Section */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-start justify-between bg-white z-10 sticky top-0 shadow-xs border-b border-[#e0e3e5]">
        <div className="flex flex-col space-y-2">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[12px] text-[#75859d] font-semibold uppercase tracking-wider">
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] cursor-pointer transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] cursor-pointer transition-colors"
            >
              Property
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#000000] font-bold">Document Types</span>
          </nav>

          <h1 className="text-[30px] font-bold text-[#191c1e] m-0 tracking-tight leading-tight">
            Document Types
          </h1>
          <p className="text-[14px] text-[#45464d] m-0 max-w-2xl leading-relaxed">
            Manage property document classifications and default settings.
          </p>
        </div>

        <button
          id="btn-add-doc-type"
          onClick={() => {
            setEditingDocumentTypeId(null);
            navigate('add-document-type');
          }}
          className="mt-4 md:mt-0 bg-[#000000] text-white hover:bg-[#2d3133] active:scale-[0.98] transition-all px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center space-x-2 shadow-md cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
            add
          </span>
          <span>Add Document Type</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="px-8 py-6 flex-1 overflow-auto">
        <div className="bg-white rounded-xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e0e3e5]">
          {/* Filter & Search Bar */}
          <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#e0e3e5]">
            <div className="relative flex items-center w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search document types..."
                className="bg-[#f2f4f6] w-full pl-10 pr-4 py-2 rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] placeholder:text-[#75859d]/60 transition-all border border-transparent focus:border-[#0058be] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#75859d] hover:text-[#191c1e] text-[16px] material-symbols-outlined cursor-pointer"
                >
                  close
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-2.5 py-1.5 rounded-lg border border-[#e0e3e5]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">
                  Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-[12px] font-semibold text-[#191c1e] outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Identity">Identity</option>
                  <option value="Visa">Visa</option>
                  <option value="Voucher">Voucher</option>
                  <option value="Health">Health</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-2.5 py-1.5 rounded-lg border border-[#e0e3e5]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-[12px] font-semibold text-[#191c1e] outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] text-[12px] font-semibold uppercase tracking-wider text-[#45464d] border-b border-[#e0e3e5]">
                  <th className="px-4 py-3 whitespace-nowrap sticky left-0 bg-[#f2f4f6] z-10 w-28">
                    Short Name
                  </th>
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold text-center w-28">Default</th>
                  <th className="px-4 py-3 font-semibold text-center w-28">Status</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#191c1e] divide-y divide-[#eceef0]">
                {filteredDocTypes.length > 0 ? (
                  filteredDocTypes.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#f2f4f6] transition-colors group cursor-default"
                    >
                      {/* Short Name */}
                      <td className="px-4 py-3.5 sticky left-0 bg-white group-hover:bg-[#f2f4f6] transition-colors whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded font-mono text-[13px] font-bold tracking-widest ${getShortNameBadgeClass(
                            doc.category
                          )}`}
                        >
                          {doc.shortName}
                        </span>
                      </td>

                      {/* Document Name */}
                      <td className="px-4 py-3.5 font-semibold text-[#000000]">
                        <div className="flex flex-col">
                          <span>{doc.name}</span>
                          {doc.description && (
                            <span className="text-[12px] text-[#75859d] font-normal truncate max-w-md">
                              {doc.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(
                            doc.category
                          )}`}
                        >
                          {doc.category}
                        </span>
                      </td>

                      {/* Default */}
                      <td className="px-4 py-3.5 text-center">
                        {doc.isDefault ? (
                          <span
                            title="Default Document Type"
                            className="material-symbols-outlined text-[22px] text-[#0058be] font-bold"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        ) : (
                          <button
                            onClick={() => setDefaultDocumentType(doc.id)}
                            title="Click to make Default"
                            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#75859d] hover:text-[#0058be] transition-colors material-symbols-outlined text-[20px] cursor-pointer"
                          >
                            close
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={doc.isActive}
                            onChange={() => toggleDocumentTypeStatus(doc.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id)
                          }
                          className="p-1.5 text-[#75859d] hover:text-[#000000] transition-colors hover:bg-[#e6e8ea] rounded-full cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuDocId === doc.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-4 top-12 w-48 bg-white rounded-xl shadow-xl border border-[#e0e3e5] py-1.5 z-30 text-left animate-fadeIn"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuDocId(null);
                                setEditingDocumentTypeId(doc.id);
                                navigate('edit-document-type');
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px] text-[#0058be]">
                                edit
                              </span>
                              Edit Document Type
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuDocId(null);
                                openEditDocumentTypeDrawer(doc);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                side_navigation
                              </span>
                              Quick Edit (Drawer)
                            </button>

                            {!doc.isDefault && (
                              <button
                                onClick={() => {
                                  setActiveMenuDocId(null);
                                  setDefaultDocumentType(doc.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#0058be]">
                                  star
                                </span>
                                Set as Default
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setActiveMenuDocId(null);
                                toggleDocumentTypeStatus(doc.id);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                {doc.isActive ? 'toggle_off' : 'toggle_on'}
                              </span>
                              {doc.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <hr className="border-[#e0e3e5] my-1" />

                            <button
                              onClick={() => {
                                setActiveMenuDocId(null);
                                openDeleteDocumentTypeDialog(doc);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#75859d]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-[#75859d]/60">
                          badge
                        </span>
                        <p className="text-[14px] font-medium text-[#191c1e]">
                          No document types found
                        </p>
                        <p className="text-[12px] text-[#75859d]">
                          Try adjusting your search criteria or add a new document type.
                        </p>
                        <button
                          onClick={openAddDocumentTypeDrawer}
                          className="mt-2 px-3.5 py-1.5 bg-[#000000] text-white rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all cursor-pointer"
                        >
                          + Add Document Type
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-[#e0e3e5] text-[#75859d] text-[13px] z-20">
            <span>
              Showing 1 to {filteredDocTypes.length} of {documentTypes.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded hover:bg-[#f2f4f6] material-symbols-outlined text-[20px] opacity-40 cursor-not-allowed"
              >
                chevron_left
              </button>
              <button
                disabled
                className="p-1 rounded hover:bg-[#f2f4f6] material-symbols-outlined text-[20px] opacity-40 cursor-not-allowed"
              >
                chevron_right
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Overlay Backdrop */}
      {isDocumentTypeDrawerOpen && (
        <div
          id="drawerOverlay"
          onClick={closeDocumentTypeDrawer}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Side Drawer */}
      <div
        id="sideDrawer"
        className={`fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDocumentTypeDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#e0e3e5] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[22px] font-bold text-[#191c1e] m-0">
              {drawerDocumentType ? 'Edit Document Type' : 'Add Document Type'}
            </h2>
            <p className="text-[13px] text-[#75859d] mt-0.5">
              {drawerDocumentType
                ? `Update settings for ${drawerDocumentType.name}`
                : 'Define a new document classification'}
            </p>
          </div>
          <button
            onClick={closeDocumentTypeDrawer}
            className="p-1.5 text-[#75859d] hover:bg-[#f2f4f6] hover:text-[#191c1e] rounded-full transition-colors flex items-center justify-center cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:rotate-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#f7f9fb]">
          <form id="doc-type-form" onSubmit={handleSaveDocType} className="space-y-5">
            {/* Short Name */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="shortName"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Short Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="shortName"
                type="text"
                maxLength={8}
                value={formData.shortName}
                onChange={(e) =>
                  setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                }
                placeholder="e.g. DL"
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all font-mono font-semibold uppercase ${
                  formErrors.shortName ? 'border-[#ba1a1a]' : 'border-[#c6c6cd]'
                }`}
              />
              {formErrors.shortName && (
                <span className="text-[12px] text-[#ba1a1a] font-medium">
                  {formErrors.shortName}
                </span>
              )}
            </div>

            {/* Document Name */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="docName"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Document Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="docName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Driving License"
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all ${
                  formErrors.name ? 'border-[#ba1a1a]' : 'border-[#c6c6cd]'
                }`}
              />
              {formErrors.name && (
                <span className="text-[12px] text-[#ba1a1a] font-medium">{formErrors.name}</span>
              )}
            </div>

            {/* Document Category */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="category"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Document Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as DocumentCategory })
                  }
                  className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="Identity">Identity</option>
                  <option value="Visa">Visa</option>
                  <option value="Voucher">Voucher</option>
                  <option value="Health">Health</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="description"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any specific requirements..."
                className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none"
              />
            </div>

            {/* Default Document Type Card */}
            <div className="pt-3 border-t border-[#e0e3e5] bg-white p-4 rounded-xl border border-[#e0e3e5]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="defaultToggle"
                  className="text-[14px] font-semibold text-[#191c1e] cursor-pointer select-none"
                >
                  Default Document Type
                </label>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    id="defaultToggle"
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </label>
              </div>
              <p className="text-[12px] text-[#75859d] mt-1.5">
                Only one document type can be the default for this property.
              </p>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#e0e3e5] flex items-center justify-end space-x-3 bg-white sticky bottom-0 z-10 shadow-xs">
          <button
            type="button"
            onClick={closeDocumentTypeDrawer}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors border border-[#c6c6cd] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="doc-type-form"
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span>Save Document Type</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDocumentTypeDialogOpen && deleteTargetDocumentType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-[#191c1e]">Delete Document Type</h3>
                <p className="text-[12px] text-[#75859d]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[14px] text-[#45464d] mb-6">
              Are you sure you want to delete{' '}
              <strong className="text-[#191c1e]">{deleteTargetDocumentType.name}</strong> (
              {deleteTargetDocumentType.shortName})? Guest verification workflows referencing this
              document type will be updated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteDocumentTypeDialog}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#191c1e] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDocumentType(deleteTargetDocumentType.id);
                  closeDeleteDocumentTypeDialog();
                }}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors cursor-pointer shadow-sm"
              >
                Delete Document Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
