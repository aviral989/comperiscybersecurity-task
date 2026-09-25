import React from 'react';
import { ProjectStatus, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: ProjectStatus;
  allStatuses: ProjectStatus[];
  tasks: Task[];
  onMoveStatus: (taskId: string, targetStatusId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  allStatuses,
  tasks,
  onMoveStatus
}) => {
  return (
    <div className="flex-1 min-w-[280px] max-w-[360px] bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col max-h-[calc(100vh-340px)]">
      {/* Column Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {status.name}
          </h3>
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded-full">
            {tasks.length}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {status.category}
        </span>
      </div>

      {/* Task List / Scroll Area */}
      <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[160px] scrollbar-thin scrollbar-thumb-slate-800">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              allStatuses={allStatuses}
              onMoveStatus={onMoveStatus}
            />
          ))
        ) : (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/60 rounded-lg">
            <Inbox className="w-5 h-5 text-slate-600 mb-1" />
            <p className="text-xs text-slate-500 font-medium">No tasks in {status.name}</p>
            <p className="text-[11px] text-slate-600">Drag or move tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};
