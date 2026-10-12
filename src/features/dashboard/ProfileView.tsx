import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

interface ProfileData {
  userId: number;
  clientId: number;
  fullName: string;
  contactEmail: string;
  userName: string;
  mobileNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  roleName: string;
  roleType: string;
  propertyName: string;
}

interface AccessData {
  property: {
    clientId: number;
    propertyName: string;
  };
  role: {
    roleId: number;
    roleName: string;
    roleType: string;
  };
  modules: Array<{
    module_key: string;
    display_name: string;
    icon_key: string;
    sort_order: number;
    is_built: boolean;
    is_allowed: boolean;
  }>;
}

const COUNTRIES = [
  'United States',
  'Canada',
  'India',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'Mexico',
  'Spain',
  'Italy',
  'Brazil',
];

export const ProfileView: React.FC = () => {
  const { currentProperty, currentUser, navigate } = useProperty();
  const [activeTab, setActiveTab] = useState<'personal' | 'access'>('personal');

  // Profile Form state
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Access Data state
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [accessLoading, setAccessLoading] = useState<boolean>(false);

  // Change Password Dialog state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/dashboard/me/profile', {
        headers: {
          'x-client-id': String(currentProperty?.identity?.clientId || '10001'),
          'x-user-id': String(currentUser?.id || '1'),
        },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setProfile(json.data);
        setInitialProfile(json.data);
      } else {
        // Fallback default
        const fallback: ProfileData = {
          userId: Number(currentUser?.id || 1),
          clientId: Number(currentProperty?.identity?.clientId || 10001),
          fullName: currentUser?.name || 'Administrator',
          contactEmail: currentUser?.email || 'admin@stayos.com',
          userName: currentUser?.email?.split('@')[0] || 'admin',
          mobileNo: '+1 (850) 555-0100',
          addressLine1: '713 Harbor Blvd',
          addressLine2: 'Suite 200',
          city: 'Destin',
          state: 'Florida',
          country: 'United States',
          zipCode: '32541',
          roleName: currentUser?.role || 'Administrator',
          roleType: 'ADMIN',
          propertyName: currentProperty?.identity?.name || 'Assigned Property',
        };
        setProfile(fallback);
        setInitialProfile(fallback);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  // Fetch Access
  const fetchAccess = async () => {
    try {
      setAccessLoading(true);
      const res = await fetch('/api/v1/dashboard/me/access', {
        headers: {
          'x-client-id': String(currentProperty?.identity?.clientId || '10001'),
          'x-user-id': String(currentUser?.id || '1'),
        },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setAccessData(json.data);
      }
    } catch {
      // Ignored
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAccess();
  }, [currentProperty?.identity?.clientId, currentUser?.id]);

  // Check if form changed
  const isFormChanged = React.useMemo(() => {
    if (!profile || !initialProfile) return false;
    return (
      profile.fullName !== initialProfile.fullName ||
      profile.contactEmail !== initialProfile.contactEmail ||
      profile.mobileNo !== initialProfile.mobileNo ||
      profile.addressLine1 !== initialProfile.addressLine1 ||
      profile.addressLine2 !== initialProfile.addressLine2 ||
      profile.city !== initialProfile.city ||
      profile.state !== initialProfile.state ||
      profile.country !== initialProfile.country ||
      profile.zipCode !== initialProfile.zipCode
    );
  }, [profile, initialProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isFormChanged) return;

    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/v1/dashboard/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': String(currentProperty?.identity?.clientId || '10001'),
          'x-user-id': String(currentUser?.id || '1'),
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          contactEmail: profile.contactEmail,
          mobileNo: profile.mobileNo,
          addressLine1: profile.addressLine1,
          addressLine2: profile.addressLine2,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          zipCode: profile.zipCode,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to update personal details.');
      }

      setInitialProfile(json.data || profile);
      setProfile(json.data || profile);
      setSaveSuccess('Personal details updated successfully.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await fetch('/api/v1/dashboard/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': String(currentProperty?.identity?.clientId || '10001'),
          'x-user-id': String(currentUser?.id || '1'),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to change password.');
      }

      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Password update failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-150">
      {/* Breadcrumb & Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span
              onClick={() => navigate('dashboard')}
              className="hover:text-[#4472C4] cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">User Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#4472C4] text-[28px]">
              account_circle
            </span>
            Profile Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal profile details, contact preferences, credentials, and role authorizations.
          </p>
        </div>

        {/* Action back to Dashboard */}
        <button
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'personal'
              ? 'border-[#4472C4] text-[#4472C4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Tab A — Personal Details</span>
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'access'
              ? 'border-[#4472C4] text-[#4472C4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Tab B — Role & Property Access</span>
        </button>
      </div>

      {/* TAB A: Personal Details */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 md:p-8 max-w-3xl mx-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[32px] text-[#4472C4]">
                progress_activity
              </span>
              <p className="mt-2 text-xs">Loading profile details...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {saveSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    check_circle
                  </span>
                  <span>{saveSuccess}</span>
                </div>
              )}
              {saveError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                  <span>{saveError}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile?.fullName || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, fullName: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* User Name (Read-Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>User Name</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={profile?.userName || ''}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-none"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profile?.contactEmail || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, contactEmail: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Contact email in app_user (independent of login credentials).
                  </span>
                </div>

                {/* Mobile No. */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile No.
                  </label>
                  <input
                    type="tel"
                    value={profile?.mobileNo || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, mobileNo: e.target.value } : prev))
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={profile?.addressLine1 || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, addressLine1: e.target.value } : prev))
                    }
                    placeholder="Street address, P.O. box, or hotel quarters"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={profile?.addressLine2 || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, addressLine2: e.target.value } : prev))
                    }
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={profile?.city || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, city: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={profile?.state || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, state: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>

                {/* Country dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Country
                  </label>
                  <select
                    value={profile?.country || 'United States'}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, country: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={profile?.zipCode || ''}
                    onChange={(e) =>
                      setProfile((prev) => (prev ? { ...prev, zipCode: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                  />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    lock_reset
                  </span>
                  <span>Change Password</span>
                </button>

                <button
                  type="submit"
                  disabled={!isFormChanged || saveLoading}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    !isFormChanged || saveLoading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#4472C4] hover:bg-[#365cb5] active:scale-[0.98]'
                  }`}
                >
                  {saveLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Update Personal Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB B: Role & Property Access */}
      {activeTab === 'access' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 md:p-8 max-w-4xl mx-auto space-y-8">
          {accessLoading ? (
            <div className="py-16 text-center text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[32px] text-[#4472C4]">
                progress_activity
              </span>
              <p className="mt-2 text-xs">Loading authorization matrices...</p>
            </div>
          ) : (
            <>
              {/* Assigned Property & Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#4472C4]/10 text-[#4472C4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">apartment</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Property
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {accessData?.property.propertyName || currentProperty?.identity?.name || 'Destin Inn & Suites'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Property ID: #{accessData?.property.clientId || currentProperty?.identity?.clientId || 10001} (Single Property Scope)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Role
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {accessData?.role.roleName || currentUser?.role || 'Administrator'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        Type: {accessData?.role.roleType || 'ADMIN'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Role ID #{accessData?.role.roleId || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Access Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4472C4] text-[18px]">
                      security
                    </span>
                    Module Access Permissions
                  </h3>
                  <span className="text-xs text-slate-500">
                    Strict Role-Based Authorization
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(accessData?.modules || []).map((m) => (
                    <div
                      key={m.module_key}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        m.is_allowed
                          ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-900'
                          : 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            m.is_allowed ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {m.is_allowed ? 'check_circle' : 'lock'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{m.display_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {m.module_key}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.is_allowed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {m.is_allowed ? 'Permitted' : 'Locked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#4472C4] mt-0.5">
                  info
                </span>
                <div>
                  <span className="font-semibold block mb-0.5">Single Assigned Property Architecture</span>
                  In StayOS PMS, user accounts strictly belong to their assigned property context.
                  Role and module permissions are enforced at both API gateway and application routes.
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4472C4]/10 text-[#4472C4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    check_circle
                  </span>
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="show-pass-check"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-300 text-[#4472C4] focus:ring-[#4472C4]"
                />
                <label htmlFor="show-pass-check" className="text-xs text-slate-600 select-none cursor-pointer">
                  Show passwords
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 rounded-lg bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {passwordLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
