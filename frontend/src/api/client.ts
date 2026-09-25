export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {},
  tenantId: string = 'org-1',
  userId: string = 'usr-1'
): Promise<T> {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      'x-user-id': userId
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const errorMsg = json.errors.map((e: any) => e.message).join(', ');
    throw new Error(errorMsg);
  }

  return json.data;
}

// Queries and Mutations
export const GET_PROJECT_BOARD_DATA = /* GraphQL */ `
  query GetProjectBoardData($projectId: ID!, $filter: TaskFilterInput, $first: Int, $after: String) {
    currentUser {
      id
      email
      fullName
      avatarUrl
    }
    currentOrganization {
      id
      name
      slug
      members {
        id
        role
        user {
          id
          fullName
          email
          avatarUrl
        }
      }
    }
    projects {
      id
      name
      key
      description
    }
    project(id: $projectId) {
      id
      name
      key
      description
      statuses {
        id
        name
        color
        category
        position
        isDefault
        tasksCount
      }
    }
    tasks(projectId: $projectId, filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          organizationId
          projectId
          sequenceNumber
          taskKey
          title
          description
          priority
          status {
            id
            name
            color
            category
          }
          assignee {
            id
            fullName
            email
            avatarUrl
          }
          reporter {
            id
            fullName
          }
          dueDate
          labels {
            id
            name
            color
          }
          orderInStatus
          createdAt
          updatedAt
        }
      }
    }
    taskSummary(projectId: $projectId, filter: $filter) {
      totalTasks
      overdueTasks
      completedTasks
      byStatus {
        status {
          id
          name
          color
        }
        count
      }
      byPriority {
        priority
        count
      }
      byAssignee {
        assignee {
          id
          fullName
          avatarUrl
        }
        count
      }
    }
  }
`;

export const MOVE_TASK_STATUS_MUTATION = /* GraphQL */ `
  mutation MoveTaskStatus($input: MoveTaskStatusInput!) {
    moveTaskStatus(input: $input) {
      id
      status {
        id
        name
        color
        category
      }
      orderInStatus
      updatedAt
    }
  }
`;

export const CREATE_TASK_MUTATION = /* GraphQL */ `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      sequenceNumber
      taskKey
      title
      description
      priority
      status {
        id
        name
        color
        category
      }
      assignee {
        id
        fullName
        avatarUrl
      }
      dueDate
      orderInStatus
      createdAt
    }
  }
`;
