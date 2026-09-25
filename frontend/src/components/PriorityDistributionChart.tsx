import React from 'react';
import { PriorityCount, Priority } from '../types';
import { Flame, ShieldAlert, AlertCircle, ArrowDown } from 'lucide-react';

interface PriorityDistributionChartProps {
  data: PriorityCount[];
  totalTasks: number;
  selectedPriority?: Priority;
  onSelectPriority: (priority?: Priority) => void;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgClass: string; borderClass: string; icon: React.ReactNode }
> = {
  URGENT: {
    label: 'Urgent',
    color: '#ef4444',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    icon: <Flame className="w-3.5 h-3.5" />
  },
  HIGH: {
    label: 'High',
    color: '#f97316',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    icon: <ShieldAlert className="w-3.5 h-3.5" />
  },
  MEDIUM: {
    label: 'Medium',
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    icon: <AlertCircle className="w-3.5 h-3.5" />
  },
  LOW: {
    label: 'Low',
    color: '#64748b',
    bgClass: 'bg-slate-500',
    borderClass: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
    icon: <ArrowDown className="w-3.5 h-3.5" />
  }
};

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({
  data,
  totalTasks,
  selectedPriority,
  onSelectPriority
}) => {
  const priorities: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Threat & Task Priority Distribution</h3>
          <p className="text-xs text-slate-400">Click a priority tier to isolate tasks on the board</p>
        </div>
        {selectedPriority && (
          <button
            onClick={() => onSelectPriority(undefined)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
          >
            Clear priority filter
          </button>
        )}
      </div>

      {/* 1. Visual Stacked Percentage Bar */}
      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex mb-4">
        {priorities.map(p => {
          const item = data.find(d => d.priority === p);
          const count = item ? item.count : 0;
          const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
          if (percentage === 0) return null;

          return (
            <div
              key={p}
              style={{ width: `${percentage}%` }}
              className={`${PRIORITY_CONFIG[p].bgClass} transition-all duration-300 hover:opacity-90 cursor-pointer`}
              title={`${PRIORITY_CONFIG[p].label}: ${count} tasks (${Math.round(percentage)}%)`}
              onClick={() => onSelectPriority(selectedPriority === p ? undefined : p)}
            />
          );
        })}
      </div>

      {/* 2. Interactive Priority Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {priorities.map(p => {
          const item = data.find(d => d.priority === p);
          const count = item ? item.count : 0;
          const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
          const isSelected = selectedPriority === p;

          return (
            <button
              key={p}
              onClick={() => onSelectPriority(isSelected ? undefined : p)}
              className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`p-1 rounded border ${PRIORITY_CONFIG[p].borderClass}`}>
                  {PRIORITY_CONFIG[p].icon}
                </span>
                <div>
                  <div className="text-xs font-medium text-slate-300">{PRIORITY_CONFIG[p].label}</div>
                  <div className="text-xs text-slate-500">{percentage}% of backlog</div>
                </div>
              </div>
              <div className="text-base font-bold text-white">{count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
