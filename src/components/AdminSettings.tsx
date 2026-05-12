'use client';

import React, { useState } from 'react';
import { Database, Settings, Users, Webhook, Plus, Trash2, Save } from 'lucide-react';

// Example structure for our dynamic custom fields configuration
interface CustomFieldDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  options?: string[]; // for 'select' type
  required: boolean;
}

const INITIAL_FIELDS: CustomFieldDef[] = [
  { id: '1', name: 'Hair Type', type: 'select', options: ['Straight', 'Wavy', 'Curly', 'Coily'], required: false },
  { id: '2', name: 'Preferred Stylist', type: 'text', required: false },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'objectmgr' | 'roles' | 'workflows'>('objectmgr');
  const [fields, setFields] = useState<CustomFieldDef[]>(INITIAL_FIELDS);

  const addField = () => {
    const newField: CustomFieldDef = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Field',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CustomFieldDef>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      
      {/* Sidebar Settings Menu */}
      <div className="w-64 border-r border-zinc-800/60 bg-zinc-900/40 p-4 flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">Setup Menu</h2>
        
        <button 
          onClick={() => setActiveTab('objectmgr')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'objectmgr' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <Database size={18} />
          Object Manager
        </button>
        
        <button 
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'roles' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <Users size={18} />
          Roles & Permissions
        </button>
        
        <button 
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'workflows' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <Webhook size={18} />
          Workflow Triggers
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-zinc-950">
        
        {activeTab === 'objectmgr' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Customer Object Manager</h2>
                <p className="text-sm text-zinc-400 mt-1">Define custom fields that will shape the customer profile for your specific industry.</p>
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                onClick={addField}
              >
                <Plus size={16} /> Add Custom Field
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                <div>Field Name</div>
                <div>Data Type</div>
                <div>Required</div>
                <div className="w-8"></div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col">
                {fields.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No custom fields defined. Click &quot;Add Custom Field&quot; to start customizing your CRM.
                  </div>
                ) : (
                  fields.map(field => (
                    <div key={field.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border-b border-zinc-800/50 items-center hover:bg-zinc-800/20 transition-colors group">
                      <div>
                        <input 
                          type="text" 
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <select 
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as CustomFieldDef['type'] })}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                          <option value="text">Text (String)</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean (Yes/No)</option>
                          <option value="date">Date</option>
                          <option value="select">Dropdown Select</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                          />
                          <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Required</span>
                        </label>
                      </div>
                      <div>
                        <button 
                          onClick={() => removeField(field.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          title="Delete field"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* Configuration for select type */}
                      {field.type === 'select' && (
                        <div className="col-span-4 mt-2 pl-4 border-l-2 border-indigo-500/30">
                           <div className="flex items-center gap-3">
                              <span className="text-xs text-zinc-500">Options (comma separated):</span>
                              <input 
                                type="text"
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. Small, Medium, Large"
                              />
                           </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
               <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-indigo-500/20">
                 <Save size={18} /> Save Schema Changes
               </button>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/80 text-sm">
               <Settings className="shrink-0 text-amber-400/80" size={20} />
               <p>
                 When saved, these fields map directly to the <code className="bg-amber-500/20 px-1 py-0.5 rounded text-amber-400">custom_fields</code> JSONB column in the PostgreSQL <code className="bg-amber-500/20 px-1 py-0.5 rounded text-amber-400">customers</code> table, instantly updating the frontend forms and AI extraction rules without requiring database migrations.
               </p>
            </div>
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab === 'roles' && (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            <Users size={32} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-300">Role Hierarchy Engine</h3>
            <p className="mt-2 text-sm max-w-md mx-auto">Configure granular viewing permissions based on organizational structure coming soon.</p>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
             <Webhook size={32} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-300">Workflow Automations</h3>
            <p className="mt-2 text-sm max-w-md mx-auto">Visual builder for &quot;If This Then That&quot; database triggers coming soon.</p>
          </div>
        )}

      </div>
    </div>
  );
}
