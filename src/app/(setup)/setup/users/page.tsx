import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { UserPlus, Search } from 'lucide-react';

export const revalidate = 0; // Disable static rendering for realtime data

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function UsersListPage() {
  const { data: users, error } = await supabaseAdmin
    .from('sf_users')
    .select(`
      id,
      first_name,
      last_name,
      alias,
      username,
      profile_id,
      sf_profiles ( name ),
      role_id,
      sf_roles ( name ),
      is_active
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <div className="bg-white dark:bg-void rounded-xl border border-gray-200 dark:border-void-lighter shadow-sm h-full flex flex-col overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-void-lighter bg-gray-50 dark:bg-void-light flex justify-between items-center transition-colors">
        <div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Setup &gt; Administration &gt; Users</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            All Users
          </h1>
        </div>
        <div className="flex gap-2">
           <Link 
             href="/setup/users/new"
             className="flex items-center gap-1.5 px-4 py-2 bg-aether-blue text-white text-sm font-bold rounded-lg hover:bg-[#014486] shadow-sm transform active:scale-95 transition-all"
           >
             <UserPlus size={16} /> New User
           </Link>
        </div>
      </div>

      {/* List Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-void-lighter flex items-center gap-4 bg-white dark:bg-void transition-colors">
         <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-aether-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Search Users..." 
              className="pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-void-light border border-transparent dark:border-void-lighter rounded-lg text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue w-64 transition-all" 
            />
         </div>
         <div className="text-sm text-aether-blue dark:text-blue-400 hover:underline cursor-pointer font-medium">Create New View</div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-void transition-colors scrollbar-thin">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-void z-10 border-b border-gray-200 dark:border-void-lighter shadow-sm">
               <tr>
                  <th className="p-4 pl-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-aether-blue transition-colors">Full Name</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-aether-blue transition-colors">Alias</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-aether-blue transition-colors">Username</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-aether-blue transition-colors">Role</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-aether-blue transition-colors">Profile</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-void-lighter">
               {(!users || users.length === 0) ? (
                 <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-gray-500 text-sm">
                       No users found. Click &quot;New User&quot; to create one.
                    </td>
                 </tr>
               ) : (
                 users.map((user: any) => (
                   <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-void-lighter/50 transition-colors group">
                      <td className="p-4 pl-6 text-sm text-aether-blue dark:text-blue-400">
                         <span className="hover:underline cursor-pointer font-medium">Edit</span> | <span className="hover:underline cursor-pointer font-medium">Login</span>
                      </td>
                      <td className="p-4 text-sm text-aether-blue dark:text-blue-400 font-bold hover:underline cursor-pointer">
                         {user.last_name}, {user.first_name}
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{user.alias}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{user.username}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{user.sf_roles?.name || ''}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{user.sf_profiles?.name || ''}</td>
                      <td className="p-4 text-sm">
                         {user.is_active ? (
                            <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-sm inline-block shadow-sm"></div>
                         ) : (
                            <div className="w-4 h-4 border border-gray-300 dark:border-void-lighter rounded-sm inline-block"></div>
                         )}
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-void-lighter text-[10px] font-bold text-gray-400 dark:text-gray-500 flex justify-between bg-gray-50 dark:bg-void-light uppercase tracking-widest transition-colors">
         <span>{users?.length || 0} items</span>
         <span>Sorted by Updated At</span>
      </div>
    </div>
  );
}
