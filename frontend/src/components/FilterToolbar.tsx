import React from 'react';
import { User } from '../types';
import { Search, Plus, User as UserIcon, X, AlertCircle } from 'lucide-react';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAssigneeId?: string;
  onAssigneeChange: (assigneeId?: string) => void;
  isOverdueOnly: boolean;
  onOverdueToggle: (overdue: boolean) => void;
  members: { user: User }[];
  onReset: () => void;
  hasActiveFilters: boolean;
  onOpenCreateModal: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssigneeId,
  onAssigneeChange,
  isOverdueOnly,
  onOverdueToggle,
  members,
  onReset,
  hasActiveFilters,
  onOpenCreateModal
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input & Filter Inputs */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, key, or CVE..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedAssigneeId || ''}
            onChange={e => onAssigneeChange(e.target.value || undefined)}
            className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Assignees</option>
            {members.map(m => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.fullName}
              </option>
            ))}
          </select>
          <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Overdue Only Toggle */}
        <button
          onClick={() => onOverdueToggle(!isOverdueOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            isOverdueOnly
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue SLA</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 transition"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onOpenCreateModal}
        className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-sm shadow-indigo-600/30 whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span>New Security Task</span>
      </button>
    </div>
  );
};
