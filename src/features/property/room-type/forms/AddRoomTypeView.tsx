import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoomCategory, RoomTypeStatus } from '@/src/types';

const PRESET_AMENITIES = [
  'High-speed Wi-Fi 6',
  '65" 4K Smart TV',
  '55" 4K Smart TV',
  'Nespresso Coffee Bar',
  'Deep Soaking Tub',
  'Rain Shower',
  'Executive Lounge Access',
  'Mini Bar',
  'Electronic In-Room Safe',
  'Luxury Bathrobes & Slippers',
  'Dyson Supersonic Hairdryer',
  'Ergonomic Workstation',
  'Evening Turn-down Service',
  'Japanese Tea Set',
  'Air Purifier & Humidifier',
  'Private Balcony / Terrace',
  'Hinoki Wood Onsen Tub',
  'Soundproof Triple-Glazed Windows',
  'Bang & Olufsen Audio',
  '24/7 Butler Service',
];

const PRESET_IMAGES = [
  { label: 'Executive Suite', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Deluxe City View', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern Queen', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
  { label: 'Skyline Penthouse', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cozy Boutique', url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80' },
];

export const AddRoomTypeView: React.FC = () => {
  const {
    navigate,
    addRoomType,
    isRoomTypeNameUnique,
    isRoomTypeCodeUnique,
    buildings,
  } = useProperty();

  // Basic Details
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<RoomCategory>('Deluxe');
  const [status, setStatus] = useState<RoomTypeStatus>('active');
  const [description, setDescription] = useState('');

  // Occupancy & Sizing
  const [capacity, setCapacity] = useState<number>(2);
  const [maxAdults, setMaxAdults] = useState<number>(2);
  const [maxChildren, setMaxChildren] = useState<number>(1);
  const [sizeSqm, setSizeSqm] = useState<number>(38);
  const [sizeSqft, setSizeSqft] = useState<number>(409);
  const [viewType, setViewType] = useState('City Skyline View');
  const [smokingPolicy, setSmokingPolicy] = useState<'non-smoking' | 'smoking' | 'designated'>('non-smoking');
  const [isAccessible, setIsAccessible] = useState(false);

  // Bed configuration
  const [bedType, setBedType] = useState('1 King Bed');
  const [bedCount, setBedCount] = useState<number>(1);
  const [extraBedAllowed, setExtraBedAllowed] = useState(false);
  const [maxExtraBeds, setMaxExtraBeds] = useState<number>(1);

  // Pricing
  const [baseRate, setBaseRate] = useState<number>(280);
  const [extraAdultRate, setExtraAdultRate] = useState<number>(50);
  const [extraChildRate, setExtraChildRate] = useState<number>(25);

  // Inventory & Amenities
  const [totalUnits, setTotalUnits] = useState<number>(20);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>(
    buildings.length > 0 ? [buildings[0].id] : []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-speed Wi-Fi 6',
    '55" 4K Smart TV',
    'Rain Shower',
    'Electronic In-Room Safe',
    'Mini Bar',
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  // Touched state for field validation
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Auto-generate code if user types name and code hasn't been manually touched
  useEffect(() => {
    if (!touched.code && name.trim()) {
      const generated = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(/\s+/)
        .map((w) => w.substring(0, 3))
        .join('-')
        .substring(0, 8);
      setCode(generated);
    }
  }, [name, touched.code]);

  // Sqm / Sqft synchronization
  const handleSqmChange = (sqm: number) => {
    setSizeSqm(sqm);
    setSizeSqft(Math.round(sqm * 10.7639));
  };

  const handleSqftChange = (sqft: number) => {
    setSizeSqft(sqft);
    setSizeSqm(Math.round(sqft / 10.7639));
  };

  // Validation
  const isNameEmpty = name.trim().length === 0;
  const isNameDuplicate = name.trim().length > 0 && !isRoomTypeNameUnique(name);
  const isCodeEmpty = code.trim().length === 0;
  const isCodeDuplicate = code.trim().length > 0 && !isRoomTypeCodeUnique(code);
  const isRateInvalid = baseRate <= 0;
  const isUnitsInvalid = totalUnits < 0;

  const hasFormErrors =
    isNameEmpty || isNameDuplicate || isCodeEmpty || isCodeDuplicate || isRateInvalid || isUnitsInvalid;

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const addCustomAmenity = () => {
    if (customAmenityInput.trim() && !selectedAmenities.includes(customAmenityInput.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenityInput.trim()]);
      setCustomAmenityInput('');
    }
  };

  const toggleBuilding = (bId: string) => {
    if (selectedBuildings.includes(bId)) {
      setSelectedBuildings(selectedBuildings.filter((id) => id !== bId));
    } else {
      setSelectedBuildings([...selectedBuildings, bId]);
    }
  };

  const handleSave = (createAnother: boolean = false) => {
    setTouched({
      name: true,
      code: true,
      baseRate: true,
      totalUnits: true,
    });

    if (hasFormErrors) return;

    const success = addRoomType({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      baseRate: Number(baseRate),
      extraAdultRate: Number(extraAdultRate) || 0,
      extraChildRate: Number(extraChildRate) || 0,
      capacity: Number(capacity),
      maxAdults: Number(maxAdults),
      maxChildren: Number(maxChildren),
      bedType,
      bedCount: Number(bedCount),
      extraBedAllowed,
      maxExtraBeds: extraBedAllowed ? Number(maxExtraBeds) : 0,
      sizeSqm: Number(sizeSqm),
      sizeSqft: Number(sizeSqft),
      viewType,
      smokingPolicy,
      isAccessible,
      description: description.trim(),
      amenities: selectedAmenities,
      totalUnits: Number(totalUnits),
      status,
      buildingIds: selectedBuildings,
      imageUrl,
    });

    if (success) {
      if (createAnother) {
        setName('');
        setCode('');
        setDescription('');
        setTouched({});
      } else {
        navigate('room-types');
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 min-h-screen bg-[#f7f9fb]">
      {/* Header Sticky */}
      <div className="sticky top-16 bg-[#f7f9fb]/95 backdrop-blur-md z-20 py-3 border-b border-[#c6c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span
              onClick={() => navigate('room-types')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Room Types
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">New Room Type</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('room-types')}
              className="w-9 h-9 rounded-full hover:bg-[#eceef0] flex items-center justify-center text-[#191c1e] transition-colors cursor-pointer border border-[#c6c6cd]/30"
              title="Return to Room Types"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-semibold text-headline-md text-[#191c1e] tracking-tight">
                Add Room Type
              </h1>
              <p className="font-body-md text-[#45464d] text-sm mt-0.5">
                Define room classification, bed configurations, amenity package, and standard base tariffs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('room-types')}
            className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-body-md font-medium text-[#45464d] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 border border-[#0058be] text-[#0058be] rounded-lg text-body-md font-medium hover:bg-[#0058be]/10 transition-colors cursor-pointer"
          >
            Save & Create Another
          </button>
          <button
            onClick={() => handleSave(false)}
            className="px-5 py-2 bg-[#0058be] hover:bg-[#004ca6] text-[#ffffff] rounded-lg text-body-md font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Save Room Type
          </button>
        </div>
      </div>

      {/* Main Grid: Form Sections + Live Booking Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Basic Identity */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#e0e3e5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">hotel</span>
                <h2 className="text-title-lg font-semibold text-[#191c1e]">General Information</h2>
              </div>
              <span className="text-body-sm text-[#75859d]">* Required fields</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Room Type Name */}
                <div className="sm:col-span-2">
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Room Type Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    placeholder="e.g. Executive King Suite"
                    className={`w-full px-3.5 py-2.5 bg-[#ffffff] border rounded-lg text-body-md text-[#191c1e] placeholder-[#75859d] outline-none transition-all ${
                      touched.name && (isNameEmpty || isNameDuplicate)
                        ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]'
                    }`}
                  />
                  {touched.name && isNameEmpty && (
                    <p className="text-body-sm text-[#ba1a1a] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Room type name is required.
                    </p>
                  )}
                  {touched.name && isNameDuplicate && (
                    <p className="text-body-sm text-[#ba1a1a] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      A room type with this name already exists in this property.
                    </p>
                  )}
                </div>

                {/* Room Code */}
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5 flex items-center justify-between">
                    <span>Room Code *</span>
                    <span className="text-[11px] text-[#75859d]">Max 8 chars</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      maxLength={8}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setTouched((p) => ({ ...p, code: true }));
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, code: true }))}
                      placeholder="EX-KNG"
                      className={`w-full px-3.5 py-2.5 uppercase font-data-mono bg-[#ffffff] border rounded-lg text-body-md text-[#191c1e] placeholder-[#75859d] outline-none transition-all ${
                        touched.code && (isCodeEmpty || isCodeDuplicate)
                          ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]'
                          : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]'
                      }`}
                    />
                  </div>
                  {touched.code && isCodeEmpty && (
                    <p className="text-body-sm text-[#ba1a1a] mt-1">Code is required.</p>
                  )}
                  {touched.code && isCodeDuplicate && (
                    <p className="text-body-sm text-[#ba1a1a] mt-1">Code must be unique.</p>
                  )}
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Category Tier
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RoomCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive</option>
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomTypeStatus)}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  >
                    <option value="active">Active (Available for booking)</option>
                    <option value="inactive">Inactive (Hidden from channels)</option>
                    <option value="renovation">Under Renovation</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Guest & Catalog Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the room atmosphere, premium features, view orientation, and special inclusions..."
                  className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] placeholder-[#75859d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Occupancy, Dimensions & View */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">group</span>
              <h2 className="text-title-lg font-semibold text-[#191c1e]">Occupancy & Spatial Specs</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Max Total Guests
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={capacity}
                      onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Max Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxAdults}
                    onChange={(e) => setMaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Max Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    value={maxChildren}
                    onChange={(e) => setMaxChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                </div>
              </div>

              {/* Room Size sq m / sq ft */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Room Area (m²)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={800}
                      value={sizeSqm}
                      onChange={(e) => handleSqmChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-body-sm text-[#75859d]">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Room Area (sq ft)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      max={9000}
                      value={sizeSqft}
                      onChange={(e) => handleSqftChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-body-sm text-[#75859d]">sq ft</span>
                  </div>
                </div>
              </div>

              {/* View Type & Smoking Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Orientation & View
                  </label>
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  >
                    <option value="City Skyline View">City Skyline View</option>
                    <option value="Tokyo Skytree & City View">Tokyo Skytree & City View</option>
                    <option value="Garden & Courtyard View">Garden & Courtyard View</option>
                    <option value="Oceanfront / Bay View">Oceanfront / Bay View</option>
                    <option value="Poolside View">Poolside View</option>
                    <option value="Quiet Inner Courtyard">Quiet Inner Courtyard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Smoking Policy
                  </label>
                  <select
                    value={smokingPolicy}
                    onChange={(e) => setSmokingPolicy(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  >
                    <option value="non-smoking">100% Non-Smoking</option>
                    <option value="smoking">Smoking Permitted</option>
                    <option value="designated">Designated Smoking Balcony Only</option>
                  </select>
                </div>
              </div>

              {/* Accessible Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAccessible}
                    onChange={(e) => setIsAccessible(e.target.checked)}
                    className="w-4 h-4 text-[#0058be] rounded border-[#c6c6cd] focus:ring-[#0058be]"
                  />
                  <div>
                    <span className="text-body-md font-medium text-[#191c1e]">
                      Wheelchair Accessible / Universal Design (ADA Compliant)
                    </span>
                    <p className="text-body-sm text-[#75859d]">
                      Features step-free entrance, wider doorways, grab rails, and roll-in shower.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Bed Configuration */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">bed</span>
              <h2 className="text-title-lg font-semibold text-[#191c1e]">Bed Setup & Extra Bedding</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Primary Bed Setup
                  </label>
                  <select
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  >
                    <option value="1 King Bed">1 King Bed (193 x 203 cm)</option>
                    <option value="2 Twin Beds">2 Twin Beds (97 x 191 cm)</option>
                    <option value="1 Queen Bed">1 Queen Bed (152 x 203 cm)</option>
                    <option value="2 Queen Beds">2 Queen Beds</option>
                    <option value="2 King + Living Suite">2 King Beds + Living Suite</option>
                    <option value="1 California King Bed">1 California King Bed</option>
                    <option value="Traditional Japanese Futon (4 Sets)">Traditional Japanese Futon (4 Sets)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                    Bed Count in Room
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={bedCount}
                    onChange={(e) => setBedCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                </div>
              </div>

              {/* Extra bed toggle */}
              <div className="p-4 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-body-md text-[#191c1e]">
                      Allow Rollaway / Extra Bed
                    </span>
                  </div>
                  <p className="text-body-sm text-[#45464d] mt-0.5">
                    Permits guests to request supplementary rollaway bed during reservation.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraBedAllowed}
                      onChange={(e) => setExtraBedAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>

                  {extraBedAllowed && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-body-sm text-[#191c1e]">Max:</span>
                      <input
                        type="number"
                        min={1}
                        max={3}
                        value={maxExtraBeds}
                        onChange={(e) => setMaxExtraBeds(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 px-2 py-1 bg-[#ffffff] border border-[#c6c6cd] rounded text-body-sm text-center font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Rates & Tariffs */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">payments</span>
              <h2 className="text-title-lg font-semibold text-[#191c1e]">Tariff & Rate Structure</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Base Rate */}
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Standard Nightly Base Rate *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-[#75859d]">$</span>
                  <input
                    type="number"
                    min={1}
                    value={baseRate}
                    onChange={(e) => setBaseRate(Math.max(1, parseFloat(e.target.value) || 0))}
                    onBlur={() => setTouched((p) => ({ ...p, baseRate: true }))}
                    className="w-full pl-8 pr-12 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md font-semibold text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-body-sm text-[#75859d]">/ night</span>
                </div>
              </div>

              {/* Extra Adult Surcharge */}
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Extra Adult Surcharge
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-[#75859d]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={extraAdultRate}
                    onChange={(e) => setExtraAdultRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-12 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-body-sm text-[#75859d]">/ night</span>
                </div>
              </div>

              {/* Extra Child Surcharge */}
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Extra Child Surcharge
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-[#75859d]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={extraChildRate}
                    onChange={(e) => setExtraChildRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-12 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-body-sm text-[#75859d]">/ night</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Amenities Package */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#e0e3e5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">auto_awesome</span>
                <h2 className="text-title-lg font-semibold text-[#191c1e]">In-Room Amenities & Features</h2>
              </div>
              <span className="text-body-sm text-[#0058be] font-medium">
                {selectedAmenities.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0058be] text-[#ffffff] shadow-xs'
                        : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e0e3e5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check' : 'add'}
                    </span>
                    {amenity}
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Input */}
            <div className="flex gap-2 pt-2 border-t border-[#e0e3e5]">
              <input
                type="text"
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                placeholder="Add custom feature (e.g. Wine Chiller, Private Plunge Pool)..."
                className="flex-1 px-3.5 py-2 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-sm text-[#191c1e] outline-none focus:border-[#0058be]"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-4 py-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg text-body-sm font-medium transition-colors"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* Section 6: Inventory & Building Assignment */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">domain</span>
              <h2 className="text-title-lg font-semibold text-[#191c1e]">Inventory & Building Allocations</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Total Configured Room Units *
                </label>
                <div className="max-w-xs">
                  <input
                    type="number"
                    min={0}
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Math.max(0, parseInt(e.target.value) || 0))}
                    onBlur={() => setTouched((p) => ({ ...p, totalUnits: true }))}
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md font-semibold text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                </div>
                <p className="text-body-sm text-[#75859d] mt-1">
                  Total physical keys available for this specification in PMS inventory.
                </p>
              </div>

              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-2">
                  Building Placement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {buildings.map((b) => {
                    const isChecked = selectedBuildings.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleBuilding(b.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'border-[#0058be] bg-[#f0f4fd]'
                            : 'border-[#c6c6cd]/50 bg-[#ffffff] hover:border-[#c6c6cd]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-body-md text-[#191c1e]">{b.name}</span>
                            <span className="text-[11px] font-data-mono text-[#75859d]">{b.code}</span>
                          </div>
                          <span className="text-body-sm text-[#45464d]">{b.totalFloors} floors</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-[#0058be]">
                          {isChecked ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Room Image Gallery */}
          <div className="bg-[#ffffff] rounded-xl p-6 border border-[#c6c6cd]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">photo_camera</span>
              <h2 className="text-title-lg font-semibold text-[#191c1e]">Representative Photography</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-2">
                  Choose from Curated Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_IMAGES.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => setImageUrl(img.url)}
                      className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        imageUrl === img.url ? 'border-[#0058be] ring-2 ring-[#0058be]/20' : 'border-transparent hover:opacity-90'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-20 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1 text-[11px] text-white font-medium text-center truncate">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-md font-medium text-[#191c1e] mb-1.5">
                  Or Custom Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: 4 cols - Live Booking Engine Preview */}
        <div className="lg:col-span-4 sticky top-36 space-y-4">
          <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-sm overflow-hidden">
            <div className="p-4 bg-[#f2f4f6] border-b border-[#e0e3e5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[18px]">visibility</span>
                <span className="font-semibold text-label-md text-[#191c1e]">Live Booking Card Preview</span>
              </div>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#e0e3e5] text-[#45464d]">
                Guest View
              </span>
            </div>

            {/* Room Card */}
            <div className="relative">
              <img
                src={imageUrl || PRESET_IMAGES[0].url}
                alt="Preview"
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#ffffff]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#191c1e] shadow-xs">
                <span className="material-symbols-outlined text-[14px] text-[#0058be]">local_offer</span>
                {category}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[18px] text-[#191c1e] tracking-tight">
                    {name.trim() || 'Untitled Room Type'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-body-sm text-[#75859d] mt-1 font-data-mono">
                  <span>Code: {code || '---'}</span>
                  <span>•</span>
                  <span>{viewType}</span>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-body-sm text-[#45464d]">
                <div className="flex items-center gap-1.5 bg-[#f7f9fb] p-2 rounded-lg border border-[#e0e3e5]/50">
                  <span className="material-symbols-outlined text-[16px] text-[#0058be]">group</span>
                  <span>{capacity} Guests ({maxAdults}A, {maxChildren}C)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#f7f9fb] p-2 rounded-lg border border-[#e0e3e5]/50">
                  <span className="material-symbols-outlined text-[16px] text-[#0058be]">square_foot</span>
                  <span>{sizeSqm} m² / {sizeSqft} sq ft</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#f7f9fb] p-2 rounded-lg border border-[#e0e3e5]/50 col-span-2">
                  <span className="material-symbols-outlined text-[16px] text-[#0058be]">bed</span>
                  <span className="truncate">{bedType}</span>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#75859d] tracking-wider block mb-2">
                  Key Amenities ({selectedAmenities.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAmenities.slice(0, 4).map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-[#f2f4f6] text-[#45464d] rounded text-[11px]">
                      {a}
                    </span>
                  ))}
                  {selectedAmenities.length > 4 && (
                    <span className="px-2 py-0.5 bg-[#e0e3e5] text-[#191c1e] rounded text-[11px] font-medium">
                      +{selectedAmenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Price Row */}
              <div className="pt-4 border-t border-[#e0e3e5] flex items-baseline justify-between">
                <div>
                  <span className="text-[12px] text-[#75859d] block">Starting from</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[24px] font-bold text-[#0058be]">${baseRate}</span>
                    <span className="text-body-sm text-[#75859d]">/ night</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                  {totalUnits} Units in PMS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
