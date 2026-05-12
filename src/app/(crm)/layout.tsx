import GlobalHeader from '@/components/layout/GlobalHeader';
import NavigationBar from '@/components/layout/NavigationBar';

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] dark:bg-void text-gray-900 dark:text-gray-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <GlobalHeader />
      <NavigationBar />
      
      {/* Main Workspace Area */}
      <main className="flex-1 overflow-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-7xl h-full">
           {children}
        </div>
      </main>
    </div>
  );
}
