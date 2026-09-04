import React from 'react';

export const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-[#e0e2ec]">
        <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Sign in to StayOS</h1>
        <p className="text-sm text-[#44474e] mb-6">Enter your credentials to access your PMS dashboard</p>
      </div>
    </div>
  );
};
