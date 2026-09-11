import React, { useState } from 'react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-stone-100">Reset Password</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h4 className="text-base font-medium text-stone-200 mb-1">Password Reset Complete</h4>
            <p className="text-xs text-stone-400 mb-5">
              Your password has been securely updated. You can now log in with your new credentials.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-800 text-stone-300 hover:bg-stone-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
