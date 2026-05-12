'use client';

import React, { useState } from 'react';
import { logActivity } from '@/actions/activities';
import { sendExternalEmail } from '@/actions/email';
import { Phone, Mail, FileText, Calendar, Send } from 'lucide-react';

export default function ActivityPublisher({ recordId, resourceName }: { recordId: string, resourceName: string }) {
  const [activeTab, setActiveTab] = useState<'Call' | 'Note' | 'Email'>('Call');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!subject.trim()) {
      alert('Subject is required');
      return;
    }

    setIsSubmitting(true);

    if (activeTab === 'Email') {
      if (!emailTo.trim()) {
        alert('Recipient email is required');
        setIsSubmitting(false);
        return;
      }
      const result = await sendExternalEmail(emailTo, subject, description, recordId, resourceName);
      setIsSubmitting(false);

      if (result.success) {
        setSubject('');
        setDescription('');
        setEmailTo('');
        setActiveTab('Call'); // Reset tab or keep on Email? Reset for confirmation
      } else {
        alert(`Failed to send email: ${result.error}`);
      }
    } else {
      const result = await logActivity(recordId, resourceName, {
        type: activeTab,
        subject,
        description
      });
      setIsSubmitting(false);

      if (result.success) {
        setSubject('');
        setDescription('');
      } else {
        alert(`Failed to log activity: ${result.error}`);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-void-light rounded-xl border border-gray-200 dark:border-void-lighter shadow-sm flex flex-col mb-6 transition-all">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-void-lighter bg-gray-50 dark:bg-void-light/50 transition-colors">
        <button 
          onClick={() => setActiveTab('Call')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-r border-gray-100 dark:border-void-lighter transition-all ${activeTab === 'Call' ? 'text-aether-blue bg-white dark:bg-void border-b-2 border-b-aether-blue' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-void-lighter'}`}
        >
          <Phone size={14} /> Log a Call
        </button>
        <button 
          onClick={() => setActiveTab('Note')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-r border-gray-100 dark:border-void-lighter transition-all ${activeTab === 'Note' ? 'text-aether-blue bg-white dark:bg-void border-b-2 border-b-aether-blue' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-void-lighter'}`}
        >
          <FileText size={14} /> New Note
        </button>
        <button 
          onClick={() => setActiveTab('Email')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'Email' ? 'text-aether-blue bg-white dark:bg-void border-b-2 border-b-aether-blue' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-void-lighter'}`}
        >
          <Mail size={14} /> Email
        </button>
      </div>

      {/* Publisher Body */}
      <div className="p-4">
        {activeTab === 'Email' && (
          <div className="mb-4">
            <input 
              type="email" 
              placeholder="To (Recipient Email)" 
              className="w-full text-sm bg-gray-50 dark:bg-void border border-gray-200 dark:border-void-lighter rounded-lg p-2 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
            />
          </div>
        )}
        <div className="mb-4">
           <input 
             type="text" 
             placeholder="Subject" 
             className="w-full text-sm bg-gray-50 dark:bg-void border border-gray-200 dark:border-void-lighter rounded-lg p-2 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all"
             value={subject}
             onChange={(e) => setSubject(e.target.value)}
           />
        </div>
        <div className="mb-4">
           <textarea 
             placeholder={activeTab === 'Email' ? "Email Body..." : "Comments..."} 
             className="w-full text-sm bg-gray-50 dark:bg-void border border-gray-200 dark:border-void-lighter rounded-lg p-3 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none min-h-[140px] resize-none transition-all"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
           />
        </div>
        <div className="flex justify-end">
           <button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="px-6 py-2 bg-aether-blue text-white text-sm font-bold rounded-lg hover:bg-[#014486] transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg"
           >
             {activeTab === 'Email' ? (
               <>
                 <Send size={14} /> {isSubmitting ? 'Sending...' : 'Send Email'}
               </>
             ) : (
               isSubmitting ? 'Saving...' : 'Save'
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
