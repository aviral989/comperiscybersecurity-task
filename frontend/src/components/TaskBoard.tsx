import React, { useState, useEffect, useCallback } from 'react';
import {
  Project,
  Task,
  TaskSummary,
  ProjectStatus,
  User,
  Priority,
  TaskFilterInput,
  OrganizationInfo
} from '../types';
import {
  graphqlRequest,
  GET_PROJECT_BOARD_DATA,
  MOVE_TASK_STATUS_MUTATION,
  CREATE_TASK_MUTATION
} from '../api/client';
import { SummaryMetrics } from './SummaryMetrics';
import { PriorityDistributionChart } from './PriorityDistributionChart';
import { FilterToolbar } from './FilterToolbar';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskModal } from './CreateTaskModal';
import { Shield, RefreshCw, AlertCircle, Building2, FolderGit2 } from 'lucide-react';

export const TaskBoard: React.FC = () => {
  // State: Projects & Organization
  const [currentOrg, setCurrentOrg] = useState<OrganizationInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<{ id: string; role: string; user: User }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);

  // State: Board Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  // State: Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<Priority | undefined>();
  const [isOverdueOnly, setIsOverdueOnly] = useState<boolean>(false);

  // State: UI Lifecycle
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Fetch Board Data
  const fetchData = useCallback(
    async (loadMore: boolean = false) => {
      try {
        if (!loadMore) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const filter: TaskFilterInput = {};
        if (searchQuery.trim()) filter.searchQuery = searchQuery.trim();
        if (selectedAssigneeId) filter.assigneeId = selectedAssigneeId;
        if (selectedPriority) filter.priority = selectedPriority;
        if (isOverdueOnly) filter.isOverdue = true;

        const variables = {
          projectId: selectedProjectId,
          filter,
          first: 50,
          after: loadMore ? endCursor : undefined
        };

        const data: any = await graphqlRequest(GET_PROJECT_BOARD_DATA, variables);

        if (data) {
          setCurrentUser(data.currentUser);
          setCurrentOrg(data.currentOrganization);
          setMembers(data.currentOrganization.members || []);
          setProjects(data.projects || []);

          if (data.project) {
            setProjectStatuses(data.project.statuses || []);
          }

          const fetchedTasks = data.tasks.edges.map((e: any) => e.node);
          if (loadMore) {
            setTasks(prev => [...prev, ...fetchedTasks]);
          } else {
            setTasks(fetchedTasks);
          }

          setTotalCount(data.tasks.totalCount);
          setHasNextPage(data.tasks.pageInfo.hasNextPage);
          setEndCursor(data.tasks.pageInfo.endCursor);
          setSummary(data.taskSummary);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to GraphQL backend');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedProjectId, searchQuery, selectedAssigneeId, selectedPriority, isOverdueOnly, endCursor]
  );

  useEffect(() => {
    fetchData(false);
  }, [selectedProjectId, searchQuery, selectedAssigneeId, selectedPriority, isOverdueOnly]);

  // Status Shift Handler (Optimistic Update)
  const handleMoveStatus = async (taskId: string, targetStatusId: string) => {
    const targetStatus = projectStatuses.find(s => s.id === targetStatusId);
    if (!targetStatus) return;

    // 1. Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await graphqlRequest(MOVE_TASK_STATUS_MUTATION, {
        input: { id: taskId, statusId: targetStatusId }
      });
      // Silently refresh summary metrics to maintain accuracy
      fetchData(false);
    } catch (err: any) {
      // Rollback on failure
      setTasks(previousTasks);
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Task Creation Handler
  const handleCreateTask = async (input: {
    title: string;
    description: string;
    priority: Priority;
    statusId: string;
    assigneeId?: string;
    dueDate?: string;
  }) => {
    await graphqlRequest(CREATE_TASK_MUTATION, {
      input: {
        projectId: selectedProjectId,
        ...input
      }
    });
    fetchData(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAssigneeId(undefined);
    setSelectedPriority(undefined);
    setIsOverdueOnly(false);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedAssigneeId || selectedPriority || isOverdueOnly
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                Comperis Cybersecurity
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold">
                SEC-OPS PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Tenant Project & Threat Management Engine
            </p>
          </div>
        </div>

        {/* Project Selector & User Info */}
        <div className="flex items-center gap-4">
          {/* Organization Badge */}
          {currentOrg && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">{currentOrg.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({totalCount} tasks)</span>
            </div>
          )}

          {/* Project Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-full ring-2 ring-indigo-500/40 object-cover"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400">Lead Security Architect</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col">
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchData(false)}
              className="flex items-center gap-1 font-semibold text-white underline hover:no-underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* KPI Summary Metrics */}
        <SummaryMetrics summary={summary} loading={loading} />

        {/* Priority Distribution Chart Data Visualization */}
        {summary && (
          <PriorityDistributionChart
            data={summary.byPriority}
            totalTasks={summary.totalTasks}
            selectedPriority={selectedPriority}
            onSelectPriority={setSelectedPriority}
          />
        )}

        {/* Filter Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedAssigneeId={selectedAssigneeId}
          onAssigneeChange={setSelectedAssigneeId}
          isOverdueOnly={isOverdueOnly}
          onOverdueToggle={setIsOverdueOnly}
          members={members}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* 3. Kanban Task Board View */}
        {loading && !tasks.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-96 rounded-xl bg-slate-900/30 border border-slate-800/60 p-4 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-24 bg-slate-800/50 rounded-lg"></div>
                <div className="h-24 bg-slate-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 flex-1">
            {projectStatuses.map(status => {
              const columnTasks = tasks.filter(t => t.status.id === status.id);
              return (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  allStatuses={projectStatuses}
                  tasks={columnTasks}
                  onMoveStatus={handleMoveStatus}
                />
              );
            })}
          </div>
        )}

        {/* Pagination Trigger (Keyset Cursor Pagination) */}
        {hasNextPage && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => fetchData(true)}
              disabled={loadingMore}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition disabled:opacity-50 flex items-center gap-2 border border-slate-700"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading additional tasks...</span>
                </>
              ) : (
                <span>Load More Tasks (Cursor Pagination)</span>
              )}
            </button>
          </div>
        )}
      </main>

      {/* 4. Modal for Task Creation */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        statuses={projectStatuses}
        members={members}
        onCreate={handleCreateTask}
      />
    </div>
  );
};
