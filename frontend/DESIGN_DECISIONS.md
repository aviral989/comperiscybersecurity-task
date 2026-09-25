# Frontend State Management & Component Architecture Decisions (Task 2.2)

### 1. Component Architecture & Decomposition
The Task Board was structured according to atomic design and separation-of-concerns principles:
* **Container Layer (`TaskBoard.tsx`)**: Orchestrates data fetching, error boundaries, filter composition, optimistic mutations, and modal lifecycles.
* **Presentational Hierarchy**:
  * `SummaryMetrics.tsx`: Visualizes KPI counts with reactive SLA alert states.
  * `PriorityDistributionChart.tsx`: Serves as both an interactive SVG distribution chart and a multi-tier filter controller.
  * `FilterToolbar.tsx`: Houses composable search inputs, assignee pickers, and SLA toggles.
  * `KanbanColumn.tsx` & `TaskCard.tsx`: Encapsulates column workflow states, drag-and-drop/quick movement triggers, and badge indicators.
  * `CreateTaskModal.tsx`: Uncontrolled-to-controlled input form with client-side validation.

### 2. State Management Strategy: Local Composition + Optimistic UI
Rather than introducing heavy external state managers (e.g., Redux or MobX) for a single feature board, state is managed via React hooks (`useState`, `useEffect`, `useCallback`) alongside declarative server synchronization:
* **Optimistic Status Transitions**: When moving a task across workflow stages (`handleMoveStatus`), the local card list updates immediately in the UI before network resolution, eliminating perceived network latency. If the mutation fails on the server (e.g., permission rejection or server crash), the board rolls back automatically to the previous state.
* **Co-located Filter Aggregation**: Filter states (`searchQuery`, `selectedAssigneeId`, `selectedPriority`, `isOverdueOnly`) trigger memoized data fetching, refreshing both the task board and aggregate KPI summaries in unison.
* **Progressive Keyset Cursor Pagination**: As users load additional cards, newly received edges are appended to the existing task array via endCursor tracking, preserving current scroll positions and filter contexts.
