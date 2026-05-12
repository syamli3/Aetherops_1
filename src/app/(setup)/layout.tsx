import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import SetupHeader from '@/components/layout/SetupHeader';
import SetupSidebar from '@/components/layout/SetupSidebar';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Create a strict backend client to bypass RLS and explicitly fetch the profile record
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // RBAC: Check if user is a 'Standard User'
  const { data: userRecord } = await supabaseAdmin
    .from('sf_users')
    .select('*, sf_profiles(name)')
    .eq('id', user.id)
    .single();

  // @ts-ignore - ignore DeepPartial type mapping inference for joined tables
  if (userRecord?.sf_profiles?.name === 'Standard User') {
    redirect('/dashboard/pipeline');
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] dark:bg-void text-gray-900 dark:text-gray-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <SetupHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <SetupSidebar />
        
        {/* Main Workspace Area */}
        <main className="flex-1 overflow-auto p-4 flex flex-col items-center">
          <div className="w-full max-w-6xl h-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
