import { taskResolvers } from './taskResolvers';
import { summaryResolvers } from './summaryResolvers';
import { db } from '../db/store';
import { GraphQLContext } from '../middleware/auth';

export const resolvers = {
  Query: {
    currentUser: (_: any, __: any, context: GraphQLContext) => context.user,
    
    currentOrganization: (_: any, __: any, context: GraphQLContext) => {
      const org = db.organizations.get(context.tenantId);
      if (!org) throw new Error('Tenant not found');
      return {
        ...org,
        members: db.organizationMembers.filter(m => m.organizationId === org.id)
      };
    },

    organizations: (_: any, __: any, context: GraphQLContext) => {
      // Return organizations that the user is a member of
      const userMemberships = db.organizationMembers.filter(m => m.userId === context.userId);
      return userMemberships
        .map(m => db.organizations.get(m.organizationId))
        .filter(Boolean)
        .map(org => ({
          ...org,
          members: db.organizationMembers.filter(m => m.organizationId === org!.id)
        }));
    },

    projects: (_: any, args: { organizationId?: string }, context: GraphQLContext) => {
      const tenantId = args.organizationId || context.tenantId;
      return Array.from(db.projects.values()).filter(p => p.organizationId === tenantId);
    },

    project: (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const project = db.projects.get(id);
      if (!project || project.organizationId !== context.tenantId) {
        return null;
      }
      return project;
    },

    projectStatuses: (_: any, { projectId }: { projectId: string }, context: GraphQLContext) => {
      return Array.from(db.projectStatuses.values())
        .filter(s => s.projectId === projectId && s.organizationId === context.tenantId)
        .sort((a, b) => a.position - b.position);
    },

    ...taskResolvers.Query,
    ...summaryResolvers.Query
  },

  Mutation: {
    ...taskResolvers.Mutation
  },

  Task: {
    ...taskResolvers.Task
  },

  Project: {
    lead: (project: any) => (project.leadId ? db.users.get(project.leadId) : null),
    statuses: (project: any) =>
      Array.from(db.projectStatuses.values())
        .filter(s => s.projectId === project.id)
        .sort((a, b) => a.position - b.position)
  },

  ProjectStatus: {
    tasksCount: (status: any) =>
      Array.from(db.tasks.values()).filter(t => t.statusId === status.id).length
  },

  OrganizationMember: {
    user: (member: any) => db.users.get(member.userId)
  }
};
