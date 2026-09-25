import React from 'react';
import { Task, ProjectStatus, Priority } from '../types';
import { Calendar, User as UserIcon, ChevronRight, ChevronLeft } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  allStatuses: ProjectStatus[];
  onMoveStatus: (taskId: string, targetStatusId: string) => void;
}

const PRIORITY_STYLES: Record<Priority, { label: string; badge: string }> = {
  URGENT: { label: 'Urgent', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  HIGH: { label: 'High', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  MEDIUM: { label: 'Medium', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  LOW: { label: 'Low', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, allStatuses, onMoveStatus }) => {
  const currentStatusIndex = allStatuses.findIndex(s => s.id === task.status.id);
  const prevStatus = currentStatusIndex > 0 ? allStatuses[currentStatusIndex - 1] : null;
  const nextStatus = currentStatusIndex < allStatuses.length - 1 ? allStatuses[currentStatusIndex + 1] : null;

  // Format Due Date & Overdue Calculation
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate) return false;
    const isCompleted = task.status.category === 'COMPLETED' || task.status.category === 'CANCELLED';
    return !isCompleted && new Date(task.dueDate) < new Date();
  }, [task.dueDate, task.status.category]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [task.dueDate]);

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all rounded-xl p-3.5 shadow-sm group flex flex-col gap-2.5">
      {/* Header: Key & Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          {task.taskKey}
        </span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
            PRIORITY_STYLES[task.priority].badge
          }`}
        >
          {PRIORITY_STYLES[task.priority].label}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-medium text-slate-100 group-hover:text-indigo-200 transition line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {task.labels.map(lbl => (
            <span
              key={lbl.id}
              style={{ backgroundColor: `${lbl.color}15`, borderColor: `${lbl.color}40`, color: lbl.color }}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Due Date & Assignee & Quick Status Shift */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between mt-1 text-slate-400">
        <div className="flex items-center gap-2">
          {formattedDueDate ? (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30' : 'text-slate-400'
              }`}
              title={isOverdue ? 'SLA Breached: Overdue' : `Due date: ${formattedDueDate}`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formattedDueDate}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">No due date</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Column Shift Actions */}
          {prevStatus && (
            <button
              onClick={() => onMoveStatus(task.id, prevStatus.id)}
              title={`Move to ${prevStatus.name}`}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {nextStatus && (
            <button
              onClick={() => onMoveStatus(task.id, nextStatus.id)}
              title={`Move to ${nextStatus.name}`}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Assignee Avatar */}
          {task.assignee ? (
            <img
              src={task.assignee.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50'}
              alt={task.assignee.fullName}
              title={`Assigned to ${task.assignee.fullName}`}
              className="w-5 h-5 rounded-full ring-1 ring-slate-700 object-cover"
            />
          ) : (
            <span
              title="Unassigned"
              className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-[10px]"
            >
              <UserIcon className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
