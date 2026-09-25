import React from 'react';
import { TaskSummary } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface SummaryMetricsProps {
  summary: TaskSummary | null;
  loading: boolean;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse p-4 flex flex-col justify-between">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const { totalTasks, overdueTasks, completedTasks } = summary;
  const inFlightTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Tasks */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</span>
          <div className="text-2xl font-bold text-white mt-1">{totalTasks}</div>
          <span className="text-xs text-slate-400">Across active sprint</span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Overdue Warning */}
      <div className={`border rounded-xl p-4 flex items-center justify-between shadow-sm transition ${
        overdueTasks > 0
          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Overdue SLA</span>
          <div className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-2">
            {overdueTasks}
            {overdueTasks > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
          <span className="text-xs text-rose-300/70">Needs urgent review</span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* 3. In-Flight Tasks */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">In Progress</span>
          <div className="text-2xl font-bold text-white mt-1">{inFlightTasks}</div>
          <span className="text-xs text-slate-400">Active engineering focus</span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Completion Rate */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completion</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-white">{completedTasks} <span className="text-xs font-normal text-slate-400">/ {totalTasks}</span></div>
          <span className="text-sm font-semibold text-emerald-400">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
