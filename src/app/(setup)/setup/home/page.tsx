export default function SetupHomePage() {
  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold">
           S
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase">Setup</div>
          <h1 className="text-xl font-bold">Home</h1>
        </div>
      </div>
      <div className="p-8 flex-1 bg-gray-50/50 flex flex-col items-center justify-center text-gray-500 gap-4 text-center">
         <p className="max-w-md">Welcome to Setup. Use the Quick Find box to find Setup pages, or select an option from the menu.</p>
         <div className="px-4 py-2 bg-white border border-gray-200 rounded shadow-sm text-sm font-medium">
            [Setup Home Component Placeholder]
         </div>
      </div>
    </div>
  );
}
