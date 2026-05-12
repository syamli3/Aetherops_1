'use client';

import React from 'react';
import { Shield, Key, Save, AlertCircle } from 'lucide-react';

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="text-[#0176D3]" />
          Security & Password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account password and security preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <AlertCircle className="text-[#0176D3] flex-shrink-0" size={20} />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Your password must be at least 12 characters long and include a mix of uppercase, lowercase, and numbers.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0176D3] focus:border-transparent focus:outline-none transition-all dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0176D3] focus:border-transparent focus:outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0176D3] focus:border-transparent focus:outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-2 bg-[#0176D3] hover:bg-[#014486] text-white font-semibold rounded-lg shadow-md shadow-blue-500/10 transition-all active:scale-[0.98]"
              >
                <Save size={18} />
                Save Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
        <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Advanced Security</h3>
        <p className="text-xs text-red-700 dark:text-red-400/80 mt-1 mb-4">
          Once you delete your session, you will be logged out of all devices.
        </p>
        <button className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 underline transition-colors">
          Log out from all devices
        </button>
      </div>
    </div>
  );
}
