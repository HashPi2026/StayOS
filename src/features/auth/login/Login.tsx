import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { ForgotPasswordModal } from '../forgot-password/ForgotPasswordModal';
import { PropertySelectionScreen } from '../property-select/PropertySelectionScreen';

type AlertType = 'notice' | 'warning' | 'error' | 'success' | null;

interface AlertState {
  type: AlertType;
  message: string;
}

export const Login: React.FC = () => {
  const { login, properties, selectPropertyAndLogin } = useProperty();

  // Form State
  const [email, setEmail] = useState('marcus.vance@grandmetropole.com');
  const [password, setPassword] = useState('StayOS2026!Secure');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field Errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Dynamic Alert Notice
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals & Flows
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showPropertySelectScreen, setShowPropertySelectScreen] = useState(false);
  const [targetPropertyId, setTargetPropertyId] = useState<string>('');

  // Active state chip indicator
  const [activeStateChip, setActiveStateChip] = useState<string>('default');

  const handleClearErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setAlert(null);
  };

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid work email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setAlert(null);

    // Simulate enterprise auth handshake
    setTimeout(() => {
      const result = login(email, password, targetPropertyId || undefined);
      setIsLoading(false);

      if (!result.success) {
        setAlert({
          type: 'error',
          message: result.message || 'Authentication failed. Please check your credentials.',
        });
      } else if (result.requirePropertySelect) {
        // Multi-property user! Proceed to Property Selection Screen
        setShowPropertySelectScreen(true);
      }
    }, 850);
  };

  // Google SSO handler
  const handleGoogleSSO = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Log in with primary executive account
      login('marcus.vance@grandmetropole.com', 'StayOS2026!Secure');
      setShowPropertySelectScreen(true);
    }, 800);
  };

  // Test states from the toolbar in screen.png
  const applyTestState = (stateName: string) => {
    setActiveStateChip(stateName);
    handleClearErrors();

    switch (stateName) {
      case 'default':
        setEmail('marcus.vance@grandmetropole.com');
        setPassword('StayOS2026!Secure');
        setTargetPropertyId('');
        break;
      case 'invalid_email':
        setEmail('marcus.vance@invalid-domain');
        setPassword('StayOS2026!Secure');
        setEmailError('Please enter a valid work email address');
        break;
      case 'required_password':
        setEmail('marcus.vance@grandmetropole.com');
        setPassword('');
        setPasswordError('Password is required');
        break;
      case 'incorrect':
        setEmail('marcus.vance@grandmetropole.com');
        setPassword('WrongPassword999');
        setAlert({
          type: 'error',
          message: 'The email address or password entered does not match our records.',
        });
        break;
      case 'loading':
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
        break;
      case 'inactive':
        setEmail('ellen.ripley@grandmetropole.com');
        setPassword('StayOS2026!Secure');
        setAlert({
          type: 'warning',
          message: 'This account is currently inactive. Please contact your property administrator or General Manager.',
        });
        break;
      case 'forgot_modal':
        setIsForgotModalOpen(true);
        break;
      default:
        break;
    }
  };

  // If user signed in and needs to choose property
  if (showPropertySelectScreen) {
    return (
      <PropertySelectionScreen
        onBackToLogin={() => {
          setShowPropertySelectScreen(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0a0f1d] text-slate-100 font-sans selection:bg-[#0058be]/30 selection:text-white">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Atmospheric Luxury Hotel Hero (Matching uploaded images)      */}
      {/* ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-slate-800/80">
        {/* Luxury Hotel Lobby High-Res Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida/AEtjO1VNNjQsnIFWjJyqROoTbfHRcdXuvnhYhqJldql7e1H3oZLC4xSYLv9Gs6VuxeKONUTnCgAtVL0HCbbkDdzEXKYT2Lrp5tXhS7DSPRllPSvtzbFLD8IFvNgMAdZkrIBkHMl4_DNLXOpWiTpTz1bHZFct5LfN3ybzxNz7jLp6SgTqOBUVIcGzGnkx74lolLX2-m8E0w02cz_qHkFw7toBOB2Lrn_AWY1Zp-Xep1p8m_Ki8CvsAn9E9FRFlA')`,
          }}
        />

        {/* Sophisticated Multi-stop Atmospheric Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060b17]/95 via-[#0b152d]/90 to-[#020612]/92 backdrop-blur-[1px]" />
        
        {/* Subtle Ambient Radial Lighting Accents */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0058be]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Logo Monogram */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0058be] to-[#2684ff] flex items-center justify-center text-white shadow-xl shadow-[#0058be]/30 border border-white/20">
              <span className="material-symbols-outlined text-[24px]">apartment</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-extrabold tracking-tight text-white">StayOS</span>
                <span className="text-[22px] font-light text-[#5ea4ff]">PMS</span>
                <div className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-[#7bb4ff] border border-blue-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Enterprise Edition
                </div>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">
                Hospitality Operating System
              </p>
            </div>
          </div>
        </div>

        {/* Center Content / Hero Messaging */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[12px] font-medium text-slate-200 mb-6 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-amber-400">auto_awesome</span>
            <span>Next-Gen Hospitality Core</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.18]">
            Manage Your Property.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#69a9ff] via-[#a8c7fa] to-[#d8e6ff]">
              Simplify Your Operations.
            </span>
          </h1>

          <p className="mt-5 text-[15px] text-slate-300 leading-relaxed font-normal max-w-lg">
            A powerful property management platform built to streamline front-desk operations, real-time reservations, room dispatch, payments, and VIP guest journeys across single & multi-property hotel portfolios.
          </p>

          {/* Key Trust Badges */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>99.99%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Guaranteed SLA Uptime</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-[#7bb4ff] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                <span>Multi-Property</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Global Cluster Sync</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-amber-300 text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>SOC 2 & PCI</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Level 1 Certified</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>© 2026 StayOS Inc. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Enterprise Hospitality Cloud
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Interactive Enterprise Login & Auth Panel                  */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between bg-[#f8fafc] text-[#191c1e] min-h-screen overflow-y-auto">
        {/* Top Utility Bar */}
        <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between">
          {/* Mobile Logo Fallback */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0058be] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">apartment</span>
            </div>
            <span className="text-[17px] font-bold text-[#191c1e]">StayOS</span>
            <span className="text-[17px] font-light text-[#0058be]">PMS</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[12px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#45464d] hover:text-[#0058be] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">help</span>
            <span>Help & Support</span>
          </button>
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-[460px] mx-auto px-6 sm:px-8 py-6 my-auto">
          {/* Form Header */}
          <div className="mb-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              Welcome back
            </h2>
            <p className="text-[14px] text-[#64748b] mt-1.5">
              Sign in to your StayOS account to access your property management dashboard.
            </p>
          </div>

          {/* Dynamic Alert Container */}
          {alert && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-[13px] flex items-start gap-2.5 border transition-all animate-in fade-in duration-150 ${
                alert.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : alert.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <span className="material-symbols-outlined text-[19px] shrink-0 mt-0.5">
                {alert.type === 'error'
                  ? 'error'
                  : alert.type === 'warning'
                  ? 'warning'
                  : alert.type === 'success'
                  ? 'check_circle'
                  : 'info'}
              </span>
              <div className="flex-1 leading-snug">
                <span className="font-semibold block mb-0.5">
                  {alert.type === 'error'
                    ? 'Authentication Failed'
                    : alert.type === 'warning'
                    ? 'Account Notice'
                    : alert.type === 'success'
                    ? 'Success'
                    : 'System Notice'}
                </span>
                {alert.message}
              </div>
              <button
                onClick={() => setAlert(null)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Address Field */}
            <div>
              <label className="block text-[13px] font-semibold text-[#0f172a] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
                  alternate_email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@grandmetropole.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all ${
                    emailError
                      ? 'border-red-500 ring-2 ring-red-500/10'
                      : 'border-[#cbd5e1] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[12px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#0f172a]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[12px] font-medium text-[#0058be] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all ${
                    passwordError
                      ? 'border-red-500 ring-2 ring-red-500/10'
                      : 'border-[#cbd5e1] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="text-[12px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {passwordError}
                </p>
              )}
            </div>

            {/* Multi-Property Option: Pre-select target hotel (Optional Shortcut) */}
            <div className="pt-0.5">
              <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                Target Property Workspace
              </label>
              <select
                value={targetPropertyId}
                onChange={(e) => setTargetPropertyId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-[12px] text-[#0f172a] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15"
              >
                <option value="">Prompt Property Selection after login (Default)</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.identity.name} ({p.location.city}, {p.location.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] text-[#475569] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0058be] border-[#cbd5e1] focus:ring-[#0058be] cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0058be] hover:bg-[#00479b] text-white text-[14px] font-semibold rounded-xl shadow-md shadow-[#0058be]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <span className="relative px-3 bg-[#f8fafc] text-[12px] font-medium text-[#94a3b8] uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Google Workspace SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSSO}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#f1f5f9] text-[#0f172a] text-[13px] font-semibold rounded-xl border border-[#cbd5e1] shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {/* Google SVG G Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.41l4.03-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
              />
            </svg>
            <span>Continue with Google Workspace</span>
          </button>

          {/* Quick Demo Credentials Dropdown */}
          <div className="mt-5 p-3 bg-white rounded-xl border border-[#e2e8f0] text-[11px] text-[#64748b]">
            <div className="flex items-center justify-between font-semibold text-[#0f172a] mb-1.5">
              <span>Quick Demo Accounts:</span>
              <span className="text-[10px] bg-blue-50 text-[#0058be] px-1.5 py-0.5 rounded font-mono">
                Click to switch
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('marcus.vance@grandmetropole.com');
                  setPassword('StayOS2026!Secure');
                  handleClearErrors();
                }}
                className="p-1.5 text-left rounded-lg bg-[#f8fafc] hover:bg-[#eef2f6] transition-colors border border-[#e2e8f0] cursor-pointer truncate"
              >
                <span className="font-semibold block text-[#0f172a] truncate">Marcus Vance</span>
                <span className="text-[10px] text-[#64748b] block truncate">5 Hotels • Director</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('sarah.j@grandplaza.com');
                  setPassword('StayOS2026!Secure');
                  handleClearErrors();
                }}
                className="p-1.5 text-left rounded-lg bg-[#f8fafc] hover:bg-[#eef2f6] transition-colors border border-[#e2e8f0] cursor-pointer truncate"
              >
                <span className="font-semibold block text-[#0f172a] truncate">Sarah Jenkins</span>
                <span className="text-[10px] text-[#64748b] block truncate">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('d.chen@grandplaza.com');
                  setPassword('StayOS2026!Secure');
                  handleClearErrors();
                }}
                className="p-1.5 text-left rounded-lg bg-[#f8fafc] hover:bg-[#eef2f6] transition-colors border border-[#e2e8f0] cursor-pointer truncate"
              >
                <span className="font-semibold block text-[#0f172a] truncate">David Chen</span>
                <span className="text-[10px] text-[#64748b] block truncate">General Manager</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('m.rodriguez@grandplaza.com');
                  setPassword('StayOS2026!Secure');
                  handleClearErrors();
                }}
                className="p-1.5 text-left rounded-lg bg-[#f8fafc] hover:bg-[#eef2f6] transition-colors border border-[#e2e8f0] cursor-pointer truncate"
              >
                <span className="font-semibold block text-[#0f172a] truncate">Maria Rodriguez</span>
                <span className="text-[10px] text-[#64748b] block truncate">Front Desk</span>
              </button>
            </div>
          </div>

          {/* Need Access Help */}
          <div className="mt-5 text-center">
            <p className="text-[12px] text-[#64748b]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="font-semibold text-[#0058be] hover:underline cursor-pointer"
              >
                Contact your hotel administrator
              </button>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM: Interactive Test States Toolbar (Faithfully reproducing screen.png) */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border-t border-[#e2e8f0] px-6 sm:px-10 py-3 mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#64748b]">tune</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Interactive Test States:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'default', label: 'Default' },
                { id: 'invalid_email', label: 'Invalid Email' },
                { id: 'required_password', label: 'Required Password' },
                { id: 'incorrect', label: 'Incorrect Credentials' },
                { id: 'loading', label: 'Loading' },
                { id: 'inactive', label: 'Account Inactive' },
                { id: 'forgot_modal', label: 'Forgot Modal' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => applyTestState(chip.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeStateChip === chip.id
                      ? 'bg-[#0058be] text-white shadow-xs'
                      : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] hover:text-[#0f172a]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />

      {/* Help & Support Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d14]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] p-6 text-[#0f172a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0058be]/10 text-[#0058be] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <h3 className="text-[15px] font-bold">StayOS PMS Support</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-[13px] text-[#475569]">
              <p>
                <strong>Need new hotel credentials?</strong> Your hotel's General Manager or IT System Administrator provisions new staff accounts via <em>Settings &gt; User Management</em>.
              </p>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">Global PMS Operations Desk:</span>
                  <span className="font-semibold text-[#0f172a]">+1 (800) 555-STAY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">Support Email:</span>
                  <span className="font-semibold text-[#0058be]">ops@stayos.internal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">Cluster Health:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    All 5 Nodes Active
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-[#64748b]">
                For instant access during demo evaluation, use any of the prefilled demo accounts or click "Quick Demo Accounts".
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 bg-[#0f172a] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1e293b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
