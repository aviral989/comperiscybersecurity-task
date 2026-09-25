import { db, TaskFilter } from '../db/store';
import { GraphQLContext } from '../middleware/auth';
import { GraphQLError } from 'graphql';

export const summaryResolvers = {
  Query: {
    taskSummary: (
      _: any,
      args: { projectId: string; filter?: TaskFilter },
      context: GraphQLContext
    ) => {
      const { projectId, filter } = args;
      const { tenantId } = context;

      // 1. Verify project exists in active tenant
      const project = db.projects.get(projectId);
      if (!project || project.organizationId !== tenantId) {
        throw new GraphQLError(`Project ${projectId} not found in active organization`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } }
        });
      }

      // 2. Compute aggregated metrics
      return db.getTaskSummary(projectId, tenantId, filter);
    }
  }
};
