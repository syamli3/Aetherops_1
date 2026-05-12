import React from 'react';
import Link from 'next/link';
import { Settings, Bell } from 'lucide-react';
import GlobalSearch from '@/components/crm/GlobalSearch';
import AppLauncherClient from './AppLauncherClient';
import { getApps, getActiveAppCookie } from '@/actions/apps';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import GlobalActionDropdown from './GlobalActionDropdown';

export default async function GlobalHeader() {
  const apps = await getApps();
  const activeAppId = await getActiveAppCookie();
  
  const activeApp = apps.find((a: any) => a.id === activeAppId);
  const appName = activeApp ? (activeApp as any).name : 'AetherOps CRM';

  // Securely fetch Role without violating RLS for UI logic
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole = 'Standard User'; // Default to lowest privilege UI
  
  if (user) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: userRecord } = await supabaseAdmin
      .from('sf_users')
      .select('*, sf_profiles(name)')
      .eq('id', user.id)
      .single();
      
    if ((userRecord as any)?.sf_profiles?.name) {
      userRole = (userRecord as any).sf_profiles.name;
    }
  }

  return (
    <>
      {/* Salesforce Global Header */}
      <header className="h-12 bg-white dark:bg-void border-b border-gray-200 dark:border-void-lighter flex items-center justify-between px-4 flex-shrink-0 z-50 relative transition-colors duration-300">
        
        {/* Left: App Launcher & Branding */}
        <div className="flex items-center gap-4">
          <AppLauncherClient apps={apps} userRole={userRole} />
          
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-void-lighter pl-4">
             <div className="w-8 h-8 bg-aether-blue rounded flex items-center justify-center text-white font-bold text-xs tracking-tighter">
               AO
             </div>
             <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg hidden sm:block">{appName}</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <GlobalSearch />

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1">
          <GlobalActionDropdown />
          
          <Link 
            href="/setup/home" 
            className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group" 
            title="Setup"
          >
            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
          </Link>
          
          <button className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Notifications">
            <Bell size={20} />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </header>
    </>
  );
}
