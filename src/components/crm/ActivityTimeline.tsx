import React from 'react';
import { Phone, Mail, FileText, Calendar, Activity } from 'lucide-react';
import { getActivitiesForRecord } from '@/actions/activities';

interface ActivityRecord {
  id: string;
  type: 'Call' | 'Email' | 'Note' | 'Meeting';
  subject: string;
  description: string | null;
  created_at: string;
  user_id: string | null; // Placeholder for relation
}

export default async function ActivityTimeline({ recordId }: { recordId: string }) {
  const activities = await getActivitiesForRecord(recordId);

  // Grouping or sorting could be done here. The query already does ORDER BY created_at DESC.
  
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center flex flex-col items-center justify-center text-gray-500">
         <Activity className="text-gray-300 mb-2" size={32} />
         <p className="text-sm font-medium text-gray-700">No past activity.</p>
         <p className="text-xs">Log a call or create a note to get started.</p>
      </div>
    );
  }

  const getIconForType = (type: string) => {
     switch(type) {
       case 'Call': return <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Phone size={14} /></div>;
       case 'Email': return <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center"><Mail size={14} /></div>;
       case 'Note': return <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center"><FileText size={14} /></div>;
       case 'Meeting': return <div className="w-8 h-8 rounded-full bg-[#0176D3] text-white flex items-center justify-center"><Calendar size={14} /></div>;
       default: return <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center"><Activity size={14} /></div>;
     }
  };

  const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  };

  return (
    <div className="relative mt-2">
      {/* Vertical Track line */}
      <div className="absolute left-[15px] top-4 bottom-0 w-0.5 bg-gray-200 z-0"></div>

      <div className="space-y-6 relative z-10">
        {activities.map((activity: ActivityRecord) => (
          <div key={activity.id} className="flex gap-4">
             {/* Icon */}
             <div className="shrink-0 mt-1 ring-4 ring-white">
                {getIconForType(activity.type)}
             </div>

             {/* Content Card */}
             <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm hover:shadow relative">
                {/* Arrow */}
                <div className="absolute left-[-6px] top-4 w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45"></div>
                
                <div className="p-3">
                   <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-[#0176D3] truncate">{activity.subject}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formatDate(activity.created_at)}</span>
                   </div>
                   <div className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                      <span className="font-semibold">{activity.type}</span>
                      <span>•</span>
                      <span>Logged by User</span>
                   </div>
                   {activity.description && (
                     <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {activity.description}
                     </div>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
