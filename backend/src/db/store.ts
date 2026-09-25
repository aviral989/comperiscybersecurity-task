export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectStatus {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  color: string;
  category: 'BACKLOG' | 'UNSTARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  position: number;
  isDefault: boolean;
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
  description: string;
  leadId: string;
  taskSequenceCounter: number;
}

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  sequenceNumber: number;
  taskKey: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  statusId: string;
  assigneeId: string | null;
  reporterId: string;
  dueDate: string | null;
  labelIds: string[];
  orderInStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  statusId?: string;
  statusIds?: string[];
  assigneeId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priorities?: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[];
  searchQuery?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isOverdue?: boolean;
}

class InMemoryDataStore {
  users: Map<string, User> = new Map();
  organizations: Map<string, Organization> = new Map();
  organizationMembers: OrganizationMember[] = [];
  projects: Map<string, Project> = new Map();
  projectStatuses: Map<string, ProjectStatus> = new Map();
  labels: Map<string, Label> = new Map();
  tasks: Map<string, Task> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Users
    const u1: User = { id: 'usr-1', email: 'alice@comperis.io', fullName: 'Alice Vance', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' };
    const u2: User = { id: 'usr-2', email: 'bob@comperis.io', fullName: 'Bob Martin', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' };
    const u3: User = { id: 'usr-3', email: 'charlie@comperis.io', fullName: 'Charlie Davis', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' };
    const u4: User = { id: 'usr-4', email: 'diana@comperis.io', fullName: 'Diana Prince', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' };
    [u1, u2, u3, u4].forEach(u => this.users.set(u.id, u));

    // 2. Seed Organizations
    const org1: Organization = { id: 'org-1', name: 'Comperis Cyber Security', slug: 'comperis-cyber' };
    const org2: Organization = { id: 'org-2', name: 'Apex Shield Labs', slug: 'apex-shield' };
    [org1, org2].forEach(o => this.organizations.set(o.id, o));

    // 3. Organization Memberships
    this.organizationMembers.push(
      { id: 'mem-1', userId: 'usr-1', organizationId: 'org-1', role: 'OWNER', joinedAt: '2026-01-10T00:00:00Z' },
      { id: 'mem-2', userId: 'usr-2', organizationId: 'org-1', role: 'ADMIN', joinedAt: '2026-01-15T00:00:00Z' },
      { id: 'mem-3', userId: 'usr-3', organizationId: 'org-1', role: 'MEMBER', joinedAt: '2026-02-01T00:00:00Z' },
      { id: 'mem-4', userId: 'usr-4', organizationId: 'org-1', role: 'MEMBER', joinedAt: '2026-02-10T00:00:00Z' },
      { id: 'mem-5', userId: 'usr-1', organizationId: 'org-2', role: 'VIEWER', joinedAt: '2026-03-01T00:00:00Z' }
    );

    // 4. Projects
    const p1: Project = {
      id: 'proj-1',
      organizationId: 'org-1',
      name: 'SOC Automation & Threat Detection',
      key: 'SOC',
      description: 'Autonomous event correlation, SOAR pipeline integrations and zero-day defense playbooks.',
      leadId: 'usr-1',
      taskSequenceCounter: 8
    };
    const p2: Project = {
      id: 'proj-2',
      organizationId: 'org-1',
      name: 'Zero-Trust Cloud Identity Federation',
      key: 'IAM',
      description: 'Continuous session attestation, mTLS mesh enforcement, and role governance.',
      leadId: 'usr-2',
      taskSequenceCounter: 3
    };
    [p1, p2].forEach(p => this.projects.set(p.id, p));

    // 5. Project Statuses
    const statuses: ProjectStatus[] = [
      { id: 'st-backlog', organizationId: 'org-1', projectId: 'proj-1', name: 'Backlog', color: '#64748b', category: 'BACKLOG', position: 0, isDefault: false },
      { id: 'st-todo', organizationId: 'org-1', projectId: 'proj-1', name: 'To Do', color: '#3b82f6', category: 'UNSTARTED', position: 1, isDefault: true },
      { id: 'st-inprogress', organizationId: 'org-1', projectId: 'proj-1', name: 'In Progress', color: '#f59e0b', category: 'IN_PROGRESS', position: 2, isDefault: false },
      { id: 'st-inreview', organizationId: 'org-1', projectId: 'proj-1', name: 'In Review', color: '#8b5cf6', category: 'IN_PROGRESS', position: 3, isDefault: false },
      { id: 'st-done', organizationId: 'org-1', projectId: 'proj-1', name: 'Completed', color: '#10b981', category: 'COMPLETED', position: 4, isDefault: false },
    ];
    statuses.forEach(s => this.projectStatuses.set(s.id, s));

    // 6. Labels
    const l1: Label = { id: 'lbl-1', organizationId: 'org-1', name: 'Security Advisory', color: '#ef4444' };
    const l2: Label = { id: 'lbl-2', organizationId: 'org-1', name: 'Backend', color: '#3b82f6' };
    const l3: Label = { id: 'lbl-3', organizationId: 'org-1', name: 'Performance', color: '#10b981' };
    const l4: Label = { id: 'lbl-4', organizationId: 'org-1', name: 'SOC 2 Compliance', color: '#f59e0b' };
    [l1, l2, l3, l4].forEach(l => this.labels.set(l.id, l));

    // 7. Tasks
    const now = new Date();
    const past2Days = new Date(now.getTime() - 2 * 86400000).toISOString();
    const past5Days = new Date(now.getTime() - 5 * 86400000).toISOString();
    const next1Day = new Date(now.getTime() + 1 * 86400000).toISOString();
    const next4Days = new Date(now.getTime() + 4 * 86400000).toISOString();
    const next10Days = new Date(now.getTime() + 10 * 86400000).toISOString();

    const sampleTasks: Task[] = [
      {
        id: 'tsk-101',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 1,
        taskKey: 'SOC-1',
        title: 'Patch Critical OpenSSL RCE CVE-2026-3829 on Ingress Proxies',
        description: 'Update Envoy edge gateways across all production clusters to eliminate buffer overflow vulnerability.',
        priority: 'URGENT',
        statusId: 'st-todo',
        assigneeId: 'usr-2',
        reporterId: 'usr-1',
        dueDate: past2Days, // OVERDUE
        labelIds: ['lbl-1', 'lbl-2'],
        orderInStatus: 100.0,
        createdAt: '2026-09-20T10:00:00Z',
        updatedAt: '2026-09-24T12:00:00Z'
      },
      {
        id: 'tsk-102',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 2,
        taskKey: 'SOC-2',
        title: 'Implement SIEM Log Stream Ingestion with Kafka & ClickHouse',
        description: 'Stream 100k syslog eps from Kubernetes daemonsets into raw analytics pipeline with partition keying.',
        priority: 'HIGH',
        statusId: 'st-inprogress',
        assigneeId: 'usr-3',
        reporterId: 'usr-1',
        dueDate: past5Days, // OVERDUE
        labelIds: ['lbl-2', 'lbl-3'],
        orderInStatus: 200.0,
        createdAt: '2026-09-21T09:30:00Z',
        updatedAt: '2026-09-24T15:00:00Z'
      },
      {
        id: 'tsk-103',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 3,
        taskKey: 'SOC-3',
        title: 'Automated Honeytoken Alerting for Vault Credential Access',
        description: 'Deploy canary API tokens in secret manager and trigger instant telemetry alerts upon read attempts.',
        priority: 'MEDIUM',
        statusId: 'st-inprogress',
        assigneeId: 'usr-1',
        reporterId: 'usr-2',
        dueDate: next4Days,
        labelIds: ['lbl-1'],
        orderInStatus: 300.0,
        createdAt: '2026-09-22T14:15:00Z',
        updatedAt: '2026-09-23T11:20:00Z'
      },
      {
        id: 'tsk-104',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 4,
        taskKey: 'SOC-4',
        title: 'Complete SOC 2 Type II Evidence Collection for Access Reviews',
        description: 'Export quarterly Google Workspace and AWS IAM audit trails into encrypted evidence repository.',
        priority: 'HIGH',
        statusId: 'st-inreview',
        assigneeId: 'usr-4',
        reporterId: 'usr-1',
        dueDate: next1Day,
        labelIds: ['lbl-4'],
        orderInStatus: 400.0,
        createdAt: '2026-09-23T08:00:00Z',
        updatedAt: '2026-09-24T16:00:00Z'
      },
      {
        id: 'tsk-105',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 5,
        taskKey: 'SOC-5',
        title: 'Enforce Hardware Security Keys (FIDO2) on Bastion Gateways',
        description: 'Mandate YubiKey authentication for SSH bastions and rotate legacy PAM credentials.',
        priority: 'MEDIUM',
        statusId: 'st-done',
        assigneeId: 'usr-2',
        reporterId: 'usr-1',
        dueDate: past2Days,
        labelIds: ['lbl-1', 'lbl-4'],
        orderInStatus: 500.0,
        createdAt: '2026-09-18T10:00:00Z',
        updatedAt: '2026-09-24T18:00:00Z'
      },
      {
        id: 'tsk-106',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 6,
        taskKey: 'SOC-6',
        title: 'Benchmark GraphQL Keyset Cursor Pagination on 10M Rows',
        description: 'Evaluate p95 query latency under simulated multi-tenant load test with k6 and Apollo metrics.',
        priority: 'LOW',
        statusId: 'st-backlog',
        assigneeId: 'usr-3',
        reporterId: 'usr-3',
        dueDate: next10Days,
        labelIds: ['lbl-2', 'lbl-3'],
        orderInStatus: 600.0,
        createdAt: '2026-09-24T11:00:00Z',
        updatedAt: '2026-09-24T11:00:00Z'
      },
      {
        id: 'tsk-107',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 7,
        taskKey: 'SOC-7',
        title: 'Draft Red Team Pentest Remediation Matrix for Kubernetes CNI',
        description: 'Validate network policy egress isolation across pod namespaces and document remediation actions.',
        priority: 'HIGH',
        statusId: 'st-todo',
        assigneeId: null, // Unassigned
        reporterId: 'usr-2',
        dueDate: past2Days, // OVERDUE
        labelIds: ['lbl-1'],
        orderInStatus: 700.0,
        createdAt: '2026-09-24T13:45:00Z',
        updatedAt: '2026-09-24T13:45:00Z'
      },
      {
        id: 'tsk-108',
        organizationId: 'org-1',
        projectId: 'proj-1',
        sequenceNumber: 8,
        taskKey: 'SOC-8',
        title: 'Deploy eBPF Kernel Probe Agent for Zero-Day Process Auditing',
        description: 'Instrument worker nodes with Cilium Tetragon for real-time privilege escalation detection.',
        priority: 'URGENT',
        statusId: 'st-inprogress',
        assigneeId: 'usr-1',
        reporterId: 'usr-1',
        dueDate: next1Day,
        labelIds: ['lbl-1', 'lbl-3'],
        orderInStatus: 800.0,
        createdAt: '2026-09-25T08:00:00Z',
        updatedAt: '2026-09-25T08:00:00Z'
      }
    ];

    sampleTasks.forEach(t => this.tasks.set(t.id, t));
  }

  // --- Multi-Tenant Access Verification ---
  checkMembership(userId: string, organizationId: string): OrganizationMember | null {
    return this.organizationMembers.find(m => m.userId === userId && m.organizationId === organizationId) || null;
  }

  // --- Task Querying & Cursor Pagination ---
  getTasks(
    projectId: string,
    tenantId: string,
    filter?: TaskFilter,
    first: number = 50,
    after?: string
  ): { tasks: Task[]; totalCount: number; hasNextPage: boolean; endCursor: string | null } {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== tenantId) {
      throw new Error(`Unauthorized: Project does not belong to tenant ${tenantId}`);
    }

    // 1. Filter tasks
    let filtered = Array.from(this.tasks.values()).filter(t => t.projectId === projectId && t.organizationId === tenantId);

    if (filter) {
      if (filter.statusId) {
        filtered = filtered.filter(t => t.statusId === filter.statusId);
      }
      if (filter.statusIds && filter.statusIds.length > 0) {
        filtered = filtered.filter(t => filter.statusIds!.includes(t.statusId));
      }
      if (filter.assigneeId) {
        filtered = filtered.filter(t => t.assigneeId === filter.assigneeId);
      }
      if (filter.priority) {
        filtered = filtered.filter(t => t.priority === filter.priority);
      }
      if (filter.priorities && filter.priorities.length > 0) {
        filtered = filtered.filter(t => filter.priorities!.includes(t.priority));
      }
      if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
        const q = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.taskKey.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      }
      if (filter.dueDateFrom) {
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) >= new Date(filter.dueDateFrom!));
      }
      if (filter.dueDateTo) {
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(filter.dueDateTo!));
      }
      if (filter.isOverdue) {
        const now = new Date();
        filtered = filtered.filter(t => {
          if (!t.dueDate) return false;
          const status = this.projectStatuses.get(t.statusId);
          const isDone = status?.category === 'COMPLETED' || status?.category === 'CANCELLED';
          return !isDone && new Date(t.dueDate) < now;
        });
      }
    }

    const totalCount = filtered.length;

    // 2. Deterministic Sort: by orderInStatus ascending, then createdAt descending, id descending
    filtered.sort((a, b) => {
      if (a.orderInStatus !== b.orderInStatus) return a.orderInStatus - b.orderInStatus;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });

    // 3. Keyset / Cursor Pagination
    let startIndex = 0;
    if (after) {
      try {
        const decoded = Buffer.from(after, 'base64').toString('utf8');
        const [cursorId] = decoded.split(':');
        const foundIdx = filtered.findIndex(t => t.id === cursorId);
        if (foundIdx !== -1) {
          startIndex = foundIdx + 1;
        }
      } catch (e) {
        // Invalid cursor gracefully defaults to start
      }
    }

    const sliced = filtered.slice(startIndex, startIndex + first);
    const hasNextPage = startIndex + first < filtered.length;
    const endCursor = sliced.length > 0
      ? Buffer.from(`${sliced[sliced.length - 1].id}:${sliced[sliced.length - 1].orderInStatus}`).toString('base64')
      : null;

    return {
      tasks: sliced,
      totalCount,
      hasNextPage,
      endCursor
    };
  }

  // --- Aggregation / Summary KPI Computation ---
  getTaskSummary(projectId: string, tenantId: string, filter?: TaskFilter) {
    const project = this.projects.get(projectId);
    if (!project || project.organizationId !== tenantId) {
      throw new Error(`Unauthorized: Project does not belong to tenant ${tenantId}`);
    }

    let list = Array.from(this.tasks.values()).filter(t => t.projectId === projectId && t.organizationId === tenantId);

    // Apply optional pre-filters
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.taskKey.toLowerCase().includes(q));
    }
    if (filter?.assigneeId) {
      list = list.filter(t => t.assigneeId === filter.assigneeId);
    }

    const now = new Date();
    let overdueCount = 0;
    let completedCount = 0;

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    const assigneeCounts: Record<string, number> = {};

    list.forEach(t => {
      // Status Count
      statusCounts[t.statusId] = (statusCounts[t.statusId] || 0) + 1;

      // Priority Count
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;

      // Assignee Count
      const assKey = t.assigneeId || 'unassigned';
      assigneeCounts[assKey] = (assigneeCounts[assKey] || 0) + 1;

      // Completion & Overdue
      const status = this.projectStatuses.get(t.statusId);
      const isComplete = status?.category === 'COMPLETED';
      if (isComplete) {
        completedCount++;
      } else if (t.dueDate && new Date(t.dueDate) < now) {
        overdueCount++;
      }
    });

    const byStatus = Array.from(this.projectStatuses.values())
      .filter(s => s.projectId === projectId)
      .map(s => ({
        status: s,
        count: statusCounts[s.id] || 0
      }));

    const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      count
    }));

    const byAssignee = Object.entries(assigneeCounts).map(([assigneeId, count]) => ({
      assignee: assigneeId === 'unassigned' ? null : this.users.get(assigneeId) || null,
      count
    }));

    return {
      totalTasks: list.length,
      overdueTasks: overdueCount,
      completedTasks: completedCount,
      byStatus,
      byPriority,
      byAssignee
    };
  }

  // --- Mutations ---
  moveTaskStatus(taskId: string, statusId: string, tenantId: string, targetPosition?: number): Task {
    const task = this.tasks.get(taskId);
    if (!task || task.organizationId !== tenantId) {
      throw new Error('Task not found or access denied');
    }

    const status = this.projectStatuses.get(statusId);
    if (!status || status.organizationId !== tenantId) {
      throw new Error('Invalid target status');
    }

    task.statusId = statusId;
    if (typeof targetPosition === 'number') {
      task.orderInStatus = targetPosition;
    }
    task.updatedAt = new Date().toISOString();
    return task;
  }

  createTask(input: {
    projectId: string;
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    statusId: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    labelIds?: string[];
  }, tenantId: string, reporterId: string): Task {
    const project = this.projects.get(input.projectId);
    if (!project || project.organizationId !== tenantId) {
      throw new Error('Project not found or unauthorized');
    }

    project.taskSequenceCounter += 1;
    const seq = project.taskSequenceCounter;
    const taskKey = `${project.key}-${seq}`;

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      organizationId: tenantId,
      projectId: input.projectId,
      sequenceNumber: seq,
      taskKey,
      title: input.title,
      description: input.description || '',
      priority: input.priority,
      statusId: input.statusId,
      assigneeId: input.assigneeId || null,
      reporterId,
      dueDate: input.dueDate || null,
      labelIds: input.labelIds || [],
      orderInStatus: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  updateTask(input: {
    id: string;
    title?: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    statusId?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  }, tenantId: string): Task {
    const task = this.tasks.get(input.id);
    if (!task || task.organizationId !== tenantId) {
      throw new Error('Task not found or unauthorized');
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.statusId !== undefined) task.statusId = input.statusId;
    if (input.assigneeId !== undefined) task.assigneeId = input.assigneeId;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate;
    task.updatedAt = new Date().toISOString();

    return task;
  }

  deleteTask(taskId: string, tenantId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.organizationId !== tenantId) {
      return false;
    }
    return this.tasks.delete(taskId);
  }
}

export const db = new InMemoryDataStore();
