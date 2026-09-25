import { db, Task, TaskFilter } from '../db/store';
import { GraphQLContext } from '../middleware/auth';
import { GraphQLError } from 'graphql';

export const taskResolvers = {
  Query: {
    tasks: (
      _: any,
      args: { projectId: string; first?: number; after?: string; filter?: TaskFilter },
      context: GraphQLContext
    ) => {
      const { projectId, first = 50, after, filter } = args;
      const { tenantId } = context;

      // 1. Verify project exists and belongs to user's tenant
      const project = db.projects.get(projectId);
      if (!project || project.organizationId !== tenantId) {
        throw new GraphQLError(`Project ${projectId} not found in active organization`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } }
        });
      }

      // 2. Fetch filtered tasks with deterministic ordering and cursor pagination
      const { tasks, totalCount, hasNextPage, endCursor } = db.getTasks(
        projectId,
        tenantId,
        filter,
        first,
        after
      );

      // 3. Format edges with base64 cursors per Relay connection spec
      const edges = tasks.map(task => ({
        cursor: Buffer.from(`${task.id}:${task.orderInStatus}`).toString('base64'),
        node: task
      }));

      const startCursor = edges.length > 0 ? edges[0].cursor : null;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor,
          endCursor
        },
        totalCount
      };
    },

    task: (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const task = db.tasks.get(id);
      if (!task || task.organizationId !== context.tenantId) {
        throw new GraphQLError(`Task ${id} not found or access denied`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } }
        });
      }
      return task;
    }
  },

  Mutation: {
    createTask: (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      // Role check: Viewers cannot create tasks
      if (context.membership.role === 'VIEWER') {
        throw new GraphQLError('Permission denied: Viewer cannot create tasks', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      // Validate project belongs to organization
      const project = db.projects.get(input.projectId);
      if (!project || project.organizationId !== context.tenantId) {
        throw new GraphQLError('Invalid project for tenant', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Validate status belongs to project
      const status = db.projectStatuses.get(input.statusId);
      if (!status || status.projectId !== input.projectId) {
        throw new GraphQLError('Status does not belong to specified project', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      return db.createTask(input, context.tenantId, context.userId);
    },

    updateTask: (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      if (context.membership.role === 'VIEWER') {
        throw new GraphQLError('Permission denied: Viewer cannot modify tasks', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      return db.updateTask(input, context.tenantId);
    },

    moveTaskStatus: (
      _: any,
      { input }: { input: { id: string; statusId: string; targetPosition?: number } },
      context: GraphQLContext
    ) => {
      if (context.membership.role === 'VIEWER') {
        throw new GraphQLError('Permission denied: Viewer cannot change status', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      return db.moveTaskStatus(input.id, input.statusId, context.tenantId, input.targetPosition);
    },

    deleteTask: (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      if (context.membership.role === 'VIEWER') {
        throw new GraphQLError('Permission denied: Viewer cannot delete tasks', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      return db.deleteTask(id, context.tenantId);
    }
  },

  Task: {
    project: (task: Task) => db.projects.get(task.projectId),
    status: (task: Task) => db.projectStatuses.get(task.statusId),
    assignee: (task: Task) => (task.assigneeId ? db.users.get(task.assigneeId) : null),
    reporter: (task: Task) => db.users.get(task.reporterId),
    labels: (task: Task) => task.labelIds.map(id => db.labels.get(id)).filter(Boolean)
  }
};
