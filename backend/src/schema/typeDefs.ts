export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  enum Role {
    OWNER
    ADMIN
    MEMBER
    VIEWER
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum StatusCategory {
    BACKLOG
    UNSTARTED
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  type User {
    id: ID!
    email: String!
    fullName: String!
    avatarUrl: String
  }

  type OrganizationMember {
    id: ID!
    user: User!
    organizationId: ID!
    role: Role!
    joinedAt: DateTime!
  }

  type ProjectStatus {
    id: ID!
    projectId: ID!
    name: String!
    color: String!
    category: StatusCategory!
    position: Int!
    isDefault: Boolean!
    tasksCount: Int!
  }

  type Label {
    id: ID!
    organizationId: ID!
    name: String!
    color: String!
  }

  type Project {
    id: ID!
    organizationId: ID!
    name: String!
    key: String!
    description: String
    lead: User
    statuses: [ProjectStatus!]!
  }

  type Task {
    id: ID!
    organizationId: ID!
    projectId: ID!
    project: Project!
    sequenceNumber: Int!
    taskKey: String!
    title: String!
    description: String
    priority: Priority!
    status: ProjectStatus!
    assignee: User
    reporter: User!
    dueDate: DateTime
    labels: [Label!]!
    orderInStatus: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type TaskEdge {
    cursor: String!
    node: Task!
  }

  type TaskConnection {
    edges: [TaskEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type StatusCount {
    status: ProjectStatus!
    count: Int!
  }

  type PriorityCount {
    priority: Priority!
    count: Int!
  }

  type AssigneeCount {
    assignee: User
    count: Int!
  }

  type TaskSummary {
    totalTasks: Int!
    overdueTasks: Int!
    completedTasks: Int!
    byStatus: [StatusCount!]!
    byPriority: [PriorityCount!]!
    byAssignee: [AssigneeCount!]!
  }

  input TaskFilterInput {
    statusId: ID
    statusIds: [ID!]
    assigneeId: ID
    priority: Priority
    priorities: [Priority!]
    searchQuery: String
    dueDateFrom: DateTime
    dueDateTo: DateTime
    isOverdue: Boolean
  }

  input CreateTaskInput {
    projectId: ID!
    title: String!
    description: String
    priority: Priority!
    statusId: ID!
    assigneeId: ID
    dueDate: DateTime
    labelIds: [ID!]
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    priority: Priority
    statusId: ID
    assigneeId: ID
    dueDate: DateTime
  }

  input MoveTaskStatusInput {
    id: ID!
    statusId: ID!
    targetPosition: Int
  }

  type Query {
    currentUser: User!
    currentOrganization: OrganizationInfo!
    organizations: [OrganizationInfo!]!
    projects(organizationId: ID): [Project!]!
    project(id: ID!): Project
    projectStatuses(projectId: ID!): [ProjectStatus!]!
    
    tasks(
      projectId: ID!
      first: Int
      after: String
      filter: TaskFilterInput
    ): TaskConnection!

    task(id: ID!): Task
    taskSummary(projectId: ID!, filter: TaskFilterInput): TaskSummary!
  }

  type OrganizationInfo {
    id: ID!
    name: String!
    slug: String!
    members: [OrganizationMember!]!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    moveTaskStatus(input: MoveTaskStatusInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
