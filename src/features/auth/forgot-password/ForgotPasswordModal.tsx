import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your work email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d14]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#ffffff] rounded-2xl shadow-2xl border border-[#c6c6cd]/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#eceef0]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#191c1e]">Reset Password</h3>
                <p className="text-[12px] text-[#75859d]">StayOS PMS Account Recovery</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75859d] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <p className="text-[13px] text-[#45464d] leading-relaxed">
                Enter your work email address associated with your StayOS property account. We'll send an authentication recovery link to securely reset your credentials.
              </p>

              <div>
                <label className="block text-[12px] font-semibold text-[#191c1e] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@grandmetropole.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f7f9fb] border rounded-xl text-[13px] text-[#191c1e] placeholder:text-[#75859d] outline-none transition-all ${
                      error
                        ? 'border-red-500 ring-2 ring-red-500/10'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15'
                    }`}
                  />
                </div>
                {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-[13px] font-medium text-[#45464d] hover:text-[#191c1e] hover:bg-[#eceef0] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#0058be] hover:bg-[#00479b] text-white text-[13px] font-semibold rounded-xl transition-all shadow-md shadow-[#0058be]/20 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[16px] font-bold text-[#191c1e]">Recovery Link Sent</h4>
                <p className="text-[13px] text-[#45464d] max-w-xs mx-auto">
                  If an active StayOS account exists for <span className="font-semibold text-[#191c1e]">{email}</span>, a secure password reset token has been dispatched.
                </p>
              </div>
              <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#eceef0] text-[12px] text-[#75859d]">
                Link expires in 15 minutes. Check spam or junk folders if not received.
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 bg-[#0058be] text-white text-[13px] font-semibold rounded-xl hover:bg-[#00479b] transition-colors cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
