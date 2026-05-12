'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateRecordField } from '@/actions/kanban';

type KanbanCard = {
  id: string;
  name: string;
  status: string; // the grouping field
  raw_data: Record<string, any>;
};

export default function KanbanBoard({ 
  initialData, 
  columns,
  resourceName,
  groupByField
}: { 
  initialData: KanbanCard[],
  columns: string[],
  resourceName: string,
  groupByField: string
}) {
  const [cards, setCards] = useState<KanbanCard[]>(initialData);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Group cards into columns dynamically based on state
  const groupedCards = columns.reduce((acc, col) => {
    acc[col] = cards.filter(c => c.status === col);
    return acc;
  }, {} as Record<string, KanbanCard[]>);

  // -- Native HTML5 Drag Events --

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move'; // visually indicate a move
    // Firefox requires setting empty data
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!draggedCardId) return;

    const cardToMove = cards.find(c => c.id === draggedCardId);
    if (!cardToMove || cardToMove.status === targetColumn) {
      setDraggedCardId(null);
      return; 
    }

    // 1. Optimistic UI Update (Instant feedback)
    const updatedCards = cards.map(c => 
      c.id === draggedCardId ? { ...c, status: targetColumn } : c
    );
    setCards(updatedCards);
    setDraggedCardId(null);

    // 2. Background Database Commit via Server Action
    const result = await updateRecordField(draggedCardId, resourceName, groupByField, targetColumn);
    
    // 3. Rollback if failed
    if (!result.success) {
      console.error('Failed to update kanban state:', result.error);
      setCards(cards); // revert to original state snapshot before the move
      // Ideally, show a toast notification here
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-140px)] select-none scrollbar-thin">
      {columns.map(column => (
        <div 
          key={column} 
          className="bg-gray-50/50 dark:bg-void-light/30 rounded-xl border border-gray-200 dark:border-void-lighter min-w-[300px] w-[300px] flex flex-col flex-shrink-0 transition-all shadow-sm"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column)}
        >
          {/* Column Header */}
          <div className="p-4 border-b border-gray-200 dark:border-void-lighter bg-gray-100 dark:bg-void-light/60 rounded-t-xl flex items-center justify-between transition-colors">
            <h3 className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">{column}</h3>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-void-lighter px-2.5 py-0.5 rounded-full shadow-inner">
              {groupedCards[column]?.length || 0}
            </span>
          </div>
          
          {/* Card Engine Canvas */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {groupedCards[column]?.map(card => (
              <div 
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                className={`bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-xl p-4 shadow-sm cursor-grab hover:border-aether-blue dark:hover:border-blue-500 transition-all transform hover:scale-[1.02] active:scale-95 group
                  ${draggedCardId === card.id ? 'opacity-50 ring-2 ring-aether-blue ring-dashed' : ''}
                `}
              >
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-widest">{resourceName.slice(0, -1)}</div>
                <Link 
                  href={`/${resourceName}/${card.id}`} 
                  className="text-sm font-black text-aether-blue dark:text-blue-400 hover:underline underline-offset-4 decoration-2"
                >
                  {card.name}
                </Link>
                {card.raw_data.Company && (
                   <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                     {card.raw_data.Company}
                   </div>
                )}
              </div>
            ))}
            
            {/* Visual Drop Target Ghost (Empty State) */}
            {(!groupedCards[column] || groupedCards[column].length === 0) && (
              <div className="h-28 border-2 border-dashed border-gray-200 dark:border-void-lighter rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                 Drop items here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
