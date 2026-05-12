'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/actions/user';

export default function NewUserForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real profile IDs from the live database
  const dummyRoles: any[] = []; // Currently empty in db
  const dummyProfiles = [
    { id: 'a0802420-96c6-461f-ab63-18722951ccf2', name: 'System Administrator' }, 
    { id: 'de75a265-3981-43fc-a931-7fe8819f32d5', name: 'Standard User' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/setup/users');
    }
  };

  const handleSaveAndNew = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    
    setLoading(true);
    setError(null);
    const formData = new FormData(form);
    const result = await createUser(formData);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header Context */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold">U</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New User</h1>
            <p className="text-xs text-gray-500 uppercase font-semibold">Setup</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* SLDS Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="bg-gray-100 border-b border-gray-200 p-3 flex justify-center gap-2 sticky top-0 z-10">
          <button type="button" onClick={() => router.push('/setup/users')} className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-[#0176D3] bg-white hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSaveAndNew} disabled={loading} className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Save & New</button>
          <button type="submit" disabled={loading} className="px-4 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-[#0176D3] hover:bg-[#014486] disabled:opacity-50">Save</button>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">General Information</h2>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            
            {/* Left Column (General Info) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5">First Name</label>
                 <input type="text" name="first_name" className="flex-1 max-w-[240px] border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Last Name
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="text" name="last_name" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Alias
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="text" name="alias" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Email
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="email" name="email" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Username
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="text" name="username" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
                 </div>
              </div>

              <div className="flex items-start mt-4 border-t border-gray-100 pt-4">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Initial Password
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="password" name="password" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" placeholder="Required for Supabase Auth" />
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Nickname
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <input type="text" name="nickname" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5">Title</label>
                 <input type="text" name="title" className="flex-1 max-w-[240px] border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5">Company</label>
                 <input type="text" name="company" className="flex-1 max-w-[240px] border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5">Department</label>
                 <input type="text" name="department" className="flex-1 max-w-[240px] border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none" />
              </div>
            </div>

            {/* Right Column (Security & License) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5">Role</label>
                 <select name="role_id" className="flex-1 max-w-[240px] border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none bg-white">
                    <option value="">--None--</option>
                    {dummyRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   User License
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <select name="user_license" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none bg-white">
                      <option value="Salesforce">Salesforce</option>
                      <option value="Identity">Identity</option>
                   </select>
                 </div>
              </div>

              <div className="flex items-start">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-1.5 flex items-center justify-end">
                   Profile
                 </label>
                 <div className="flex-1 max-w-[240px] flex items-stretch">
                   <div className="w-1 bg-red-600 rounded-l-sm mr-1"></div>
                   <select name="profile_id" required className="flex-1 w-full border border-gray-300 rounded p-1.5 text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none bg-white">
                      <option value="">--None--</option>
                      {dummyProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                 </div>
              </div>

              <div className="flex items-start mt-4">
                 <label className="w-40 text-xs font-semibold text-gray-600 text-right pr-4 pt-0.5">Active</label>
                 <input type="checkbox" name="is_active" defaultChecked className="mt-0.5" />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-gray-100 border-t border-gray-200 p-3 flex justify-center gap-2">
          <button type="button" onClick={() => router.push('/setup/users')} className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-[#0176D3] bg-white hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSaveAndNew} disabled={loading} className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Save & New</button>
          <button type="submit" disabled={loading} className="px-4 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-[#0176D3] hover:bg-[#014486] disabled:opacity-50">Save</button>
        </div>

      </form>
    </div>
  );
}
