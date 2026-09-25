export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type StatusCategory = 'BACKLOG' | 'UNSTARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ProjectStatus {
  id: string;
  projectId: string;
  name: string;
  color: string;
  category: StatusCategory;
  position: number;
  isDefault: boolean;
  tasksCount: number;
}

export interface Label {
  id: string;
  organizationId: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  description?: string;
  lead?: User;
  statuses: ProjectStatus[];
}

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  sequenceNumber: number;
  taskKey: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ProjectStatus;
  assignee?: User | null;
  reporter: User;
  dueDate?: string | null;
  labels: Label[];
  orderInStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface TaskEdge {
  cursor: string;
  node: Task;
}

export interface TaskConnection {
  edges: TaskEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface StatusCount {
  status: ProjectStatus;
  count: number;
}

export interface PriorityCount {
  priority: Priority;
  count: number;
}

export interface AssigneeCount {
  assignee?: User | null;
  count: number;
}

export interface TaskSummary {
  totalTasks: number;
  overdueTasks: number;
  completedTasks: number;
  byStatus: StatusCount[];
  byPriority: PriorityCount[];
  byAssignee: AssigneeCount[];
}

export interface TaskFilterInput {
  statusId?: string;
  statusIds?: string[];
  assigneeId?: string;
  priority?: Priority;
  priorities?: Priority[];
  searchQuery?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isOverdue?: boolean;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
}
