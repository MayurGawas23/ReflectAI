import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Database
} from 'lucide-react';
import { Interaction } from '../types';

interface SidebarProps {
  interactions: Interaction[];
  currentInteractionId: string | null;
  onSelectInteraction: (id: string) => void;
  onNewReflection: () => void;
  onDeleteInteraction: (id: string, e: React.MouseEvent) => void;
  loading: boolean;
  onSeedDemoData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  interactions,
  currentInteractionId,
  onSelectInteraction,
  onNewReflection,
  onDeleteInteraction,
  loading,
  onSeedDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = interactions.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const summaryMatch = item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = item.themes?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return titleMatch || summaryMatch || tagMatch;
  });

  return (
    <aside className="w-80 flex-shrink-0 border-r border-stone-200 bg-white flex flex-col h-full">
      {/* New Reflection CTA */}
      <div className="p-4 border-b border-stone-100 flex flex-col gap-2.5">
        <button
          id="new-reflection-btn"
          onClick={onNewReflection}
          className="cursor-pointer w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 transition shadow-sm active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>

        {onSeedDemoData && (
          <button
            id="seed-demo-data-btn"
            onClick={onSeedDemoData}
            title="Populate curated entries with locations, action items & admin metrics"
            className="cursor-pointer w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 text-emerald-800 text-[11px] font-medium hover:bg-emerald-100 transition shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Demo Data (Hack2skill APAC)</span>
          </button>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search entries or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Journal History ({filtered.length})</span>
          {loading && <span className="text-stone-400 text-[10px] animate-pulse">Syncing...</span>}
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            {searchTerm ? 'No matching entries found' : 'No reflections yet. Start your first entry above.'}
          </div>
        ) : (
          filtered.map((entry) => {
            const isSelected = entry.id === currentInteractionId;
            const formattedDate = new Date(entry.updatedAt || entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={entry.id}
                id={`entry-item-${entry.id}`}
                onClick={() => onSelectInteraction(entry.id)}
                className={`group relative flex items-start justify-between p-3 rounded-xl cursor-pointer transition text-left ${
                  isSelected 
                    ? 'bg-stone-100 text-stone-900 font-medium' 
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <h3 className="text-xs truncate font-medium text-stone-900">
                      {entry.title || 'Untitled Reflection'}
                    </h3>
                  </div>

                  {entry.summary && (
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {entry.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formattedDate}
                    </span>
                    {entry.themes && entry.themes.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-600 truncate max-w-[100px]">
                        {entry.themes[0]}
                      </span>
                    )}
                    {entry.location && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 truncate max-w-[90px] flex items-center gap-0.5 border border-emerald-100">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{entry.location.placeName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  id={`delete-entry-${entry.id}`}
                  title="Delete Entry"
                  onClick={(e) => onDeleteInteraction(entry.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
