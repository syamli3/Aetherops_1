'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Star, AlertTriangle, MessageSquare, Send, Clock, Activity, Tag } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type Interaction = Database['public']['Tables']['interactions']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

interface CustomerProfileProps {
  customer: Customer | null;
  interactions?: Interaction[];
  transactions?: Transaction[];
}

// Dummy data for initial render
const DUMMY_CUSTOMER: Customer = {
  id: '1',
  first_name: 'Elena',
  last_name: 'Rostova',
  email: 'elena.r@example.com',
  phone: '+1 (555) 019-2834',
  address: '124 Azure Way, Neo SF, CA',
  lifetime_value: 12450.00,
  churn_risk_score: 12,
  vip_status: true,
  personality_summary: 'Direct, prefers concise communication. Highly values premium support tier.',
  custom_fields: { "Hair Type": "Curly", "Preferred Stylist": "Marco" },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DUMMY_INTERACTIONS: Interaction[] = [
  {
    id: '1',
    customer_id: '1',
    agent_id: null,
    type: 'email',
    direction: 'inbound',
    content: 'Hi, I need to reschedule my premium appointment for next Tuesday.',
    sentiment_score: 50,
    ai_summary: 'Customer requested appointment reschedule for next Tuesday.',
    interaction_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '2',
    customer_id: '1',
    agent_id: 'agent-1',
    type: 'call',
    direction: 'outbound',
    content: 'Called customer to confirm reschedule. She was happy with the new time.',
    sentiment_score: 90,
    ai_summary: 'Confirmed new appointment time smoothly over phone.',
    interaction_date: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    customer_id: '1',
    amount: 450.00,
    currency: 'USD',
    status: 'completed',
    transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

export default function CustomerProfile({ 
  customer = DUMMY_CUSTOMER, 
  interactions = DUMMY_INTERACTIONS,
  transactions = DUMMY_TRANSACTIONS
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'transactions'>('timeline');

  if (!customer) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Select a customer to view their profile.
      </div>
    );
  }

  // Combine and sort events
  const events = [
    ...interactions.map(i => ({ ...i, eventType: 'interaction' as const, date: new Date(i.interaction_date) })),
    ...transactions.map(t => ({ ...t, eventType: 'transaction' as const, date: new Date(t.transaction_date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      
      {/* LEFT COLUMN: Vitals & Details */}
      <div className="w-80 border-r border-zinc-800/60 bg-zinc-900/40 p-6 overflow-y-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-semibold border border-indigo-500/30">
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            {customer.vip_status && (
              <span className="px-2 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 rounded ring-1 ring-amber-500/30 flex items-center gap-1">
                <Star size={12} className="fill-amber-400" /> VIP
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-2">{customer.first_name} {customer.last_name}</h2>
          
          <div className="flex flex-col gap-3 mt-4 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail size={16} /> <span>{customer.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} /> <span>{customer.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} /> <span className="truncate">{customer.address || 'No address provided'}</span>
            </div>
          </div>
        </div>

        {/* AI & Vitals */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mt-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Lifetime Value</span>
            <span className="text-lg font-bold text-zinc-100">${customer.lifetime_value?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              Churn Risk <AlertTriangle size={12} className={customer.churn_risk_score && customer.churn_risk_score > 50 ? 'text-red-400' : 'text-zinc-500'}/>
            </span>
            <span className={`text-sm font-semibold ${customer.churn_risk_score && customer.churn_risk_score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
              {customer.churn_risk_score}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <Activity size={16}/> AI Personality Profile
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/30 p-3 rounded-lg border border-zinc-800">
            {customer.personality_summary || 'Not enough data to profile.'}
          </p>
        </div>

        {/* Dynamic Custom Fields */}
        {customer.custom_fields && Object.keys(customer.custom_fields).length > 0 && (
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/60">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Tag size={16}/> Custom Fields
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(customer.custom_fields).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">{key}</span>
                  <span className="text-sm text-zinc-200">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CENTER COLUMN: Infinite Timeline */}
      <div className="flex-1 flex flex-col bg-zinc-950 min-w-[500px]">
        {/* Timeline Header */}
        <div className="h-16 border-b border-zinc-800/80 p-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur top-0 z-10 sticky">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={18} className="text-indigo-400"/> Activity Timeline
          </h2>
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'timeline' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              All Activity
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'transactions' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Transactions
            </button>
          </div>
        </div>

        {/* Timeline Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">
          {events.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">No activities found.</div>
          ) : (
            <div className="absolute left-10 top-6 bottom-6 w-px bg-zinc-800/60" />
          )}

          {events.filter(e => activeTab === 'timeline' || e.eventType === 'transaction').map((event) => (
            <div key={event.eventType === 'interaction' ? `int-${event.id}` : `txn-${event.id}`} className="flex gap-4 relative z-10">
              {/* Timeline dot */}
              <div className="w-8 flex justify-center mt-1">
                <div className={`w-3 h-3 rounded-full ring-4 ring-zinc-950 ${event.eventType === 'interaction' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              </div>
              
              {/* Event Card */}
              <div className={`flex-1 rounded-xl border p-4 shadow-sm ${
                event.eventType === 'interaction' 
                  ? 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700' 
                  : 'border-emerald-500/20 bg-emerald-500/5'
                } transition-colors`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {event.eventType === 'interaction' 
                        ? (event as Interaction).type 
                        : 'Transaction'}
                    </span>
                    {event.eventType === 'interaction' && (event as Interaction).sentiment_score !== null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        (event as Interaction).sentiment_score! >= 70 ? 'bg-green-500/20 text-green-400' :
                        (event as Interaction).sentiment_score! <= 30 ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        Sentiment: {(event as Interaction).sentiment_score}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {event.date.toLocaleDateString()} {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {event.eventType === 'interaction' ? (
                  <>
                    <p className="text-sm text-zinc-300 mt-1">{(event as Interaction).content}</p>
                    {(event as Interaction).ai_summary && (
                      <div className="mt-3 p-2 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex gap-2 items-start">
                         <Activity size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                         <span className="text-xs text-indigo-200">{(event as Interaction).ai_summary}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-emerald-400">
                      ${(event as Transaction).amount.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md uppercase tracking-wider font-semibold ${
                      (event as Transaction).status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {(event as Transaction).status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: The Action Pad */}
      <div className="w-80 border-l border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
           Action Pad
        </h3>
        
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <MessageSquare size={18} />
            Write Email
          </button>
          
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors">
            <Phone size={18} className="text-emerald-400" />
            Log Call
          </button>
          
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors">
            <AlertTriangle size={18} className="text-amber-400" />
            Issue Support Ticket
          </button>
        </div>

        <div className="mt-4 flex-1 border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-300 mb-3">
             <Activity size={16} /> AI Smart Reply Draft
          </h4>
          <div className="flex-1 bg-zinc-900/50 rounded border border-zinc-800 p-3 text-sm text-zinc-300">
            &quot;Hi {customer.first_name}, I saw you rescheduled your appointment for next Tuesday. Your VIP perks including the premium lounge will be ready for you. Is there anything else you need?&quot;
          </div>
          <button className="mt-3 flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-zinc-800 hover:bg-indigo-600 hover:text-white transition-colors text-zinc-400 font-medium text-sm">
             <Send size={14} /> Send Draft
          </button>
        </div>
      </div>

    </div>
  );
}
