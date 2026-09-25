import { Request } from 'express';
import { db, User, OrganizationMember } from '../db/store';
import { GraphQLError } from 'graphql';

export interface GraphQLContext {
  tenantId: string;
  userId: string;
  user: User;
  membership: OrganizationMember;
}

export function buildAuthContext(req: Request): GraphQLContext {
  // Allow client headers for tenant switching or local token simulation
  const tenantId = (req.headers['x-tenant-id'] as string) || 'org-1';
  const userId = (req.headers['x-user-id'] as string) || 'usr-1';

  const user = db.users.get(userId);
  if (!user) {
    throw new GraphQLError('Authentication failed: User account not found', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } }
    });
  }

  const membership = db.checkMembership(userId, tenantId);
  if (!membership) {
    throw new GraphQLError(`Access denied: User does not belong to organization '${tenantId}'`, {
      extensions: { code: 'FORBIDDEN', http: { status: 403 } }
    });
  }

  return {
    tenantId,
    userId,
    user,
    membership
  };
}
