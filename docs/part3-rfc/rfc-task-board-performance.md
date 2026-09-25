# RFC 042: High-Performance Kanban Board Architecture for 2,000+ Tasks

**RFC Identifier**: RFC-2026-042  
**Author**: Senior Full-Stack Developer / Staff Security Architect  
**Target Audience**: Engineering Team, Principal Architects, and Product Management  
**Status**: PROPOSED / UNDER REVIEW  
**Created**: September 2026  
**Target Delivery**: Q4 2026  

---

## 1. Executive Summary & Problem Framing

Our multi-tenant project management platform has scaled to over **500+ active enterprise organizations**. While performance is adequate for small backlogs (<100 tasks), large enterprise projects with **2,000+ tasks** experience severe performance degradation that directly threatens user retention and enterprise contract renewals.

### Current Architecture Flaws
1. **Monolithic Payload Fetching**: The frontend issues a single monolithic GraphQL query (`query GetFullProject { project { tasks { ...allFields } } }`) fetching 2,000+ task nodes including nested assignees, labels, and status objects.
2. **Client-Side CPU & DOM Thrashing**: The browser mounts 2,000+ React DOM nodes simultaneously across 5 columns.
3. **Refetch-on-Mutation Antipattern**: Every drag-and-drop card movement and every filter keystroke triggers a full project query refetch, locking the UI thread.

### Empirical Performance Metrics (Baseline)

| Metric | Current Baseline (2,000 Tasks) | Target SLO (Post-RFC) | Delta / Business Impact |
| :--- | :--- | :--- | :--- |
| **Initial Board Load (p95 LCP)** | **6.8 – 8.2 seconds** | **< 800 ms** | **90% reduction** |
| **Payload Size over Wire** | **4.8 MB (uncompressed JSON)** | **< 120 KB (initial fold)** | **97.5% bandwidth savings** |
| **Drag & Drop Interaction Latency** | **6.5 seconds (full refetch lock)** | **< 50 ms (optimistic)** | **Instantaneous feedback** |
| **Client Memory Footprint** | **~380 MB heap** | **< 65 MB heap** | **Eliminates mobile tab crashes** |
| **PostgreSQL DB CPU during Board Load** | **78% spike (full table scans)** | **< 12% steady-state** | **6x connection capacity** |

---

## 2. Architecture Options Evaluated

We evaluated three potential architectural interventions:

```
                            ARCHITECTURAL TRADEOFF MATRIX
                            
 ┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
 │ Evaluation Criteria  │ Option 1: Pure       │ Option 2: Column     │ Option 3: Hybrid     │
 │                      │ Client Virtualization│ Keyset Pagination    │ Virtual Windowing +  │
 │                      │                      │ Only                 │ Optimistic Delta Sync│
 ├──────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
 │ Network Payload Cut  │ ❌ 0% (Still 4.8MB)  │ ✅ 95% (<150KB)      │ ✅ 97.5% (<120KB)    │
 │ Client Rendering Speed│ ✅ Fast (<200ms)    │ ⚠️ Degrades on scroll │ ✅ Sub-50ms (DOM <60)│
 │ Elimination of Refetch│ ❌ No                │ ⚠️ Partial           │ ✅ Full Optimistic UI│
 │ Implementation Effort│ Low (1 sprint)       │ Medium (2 sprints)   │ High (3 sprints)     │
 │ Architectural Longevity│ Short (<6 months)   │ Medium (~1 year)     │ Long-term (10x scale)│
 └──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

### Option 1: Pure Client-Side DOM Virtualization with Existing Monolithic Query
* **Mechanism**: Retain single GraphQL query; wrap columns in `@tanstack/react-virtual` to mount only visible viewport cards (~15 per column).
* **Pros**: Low complexity; ships in one sprint.
* **Cons**: Fails to solve the root problem. Downloading and parsing 4.8MB of JSON on mobile devices or constrained enterprise VPNs still consumes 3–4 seconds of network latency and CPU time.

### Option 2: Column-Level Keyset Pagination Only
* **Mechanism**: Break project query into independent per-column queries (`columnTasks(statusId, first: 25, after: cursor)`).
* **Pros**: Eliminates monolithic network payload; database queries leverage `(project_id, status_id, order_in_status)` index scans.
* **Cons**: Dragging cards across columns requires managing disconnected paginated lists without normalized caching; rapid continuous scrolling still inflates the client DOM tree over time.

### Option 3 (Recommended): Hybrid Virtual Windowing + Keyset Column Windowing + Optimistic Delta Sync
* **Mechanism**:
  1. **Split Queries**: Initial load fetches lightweight board metadata (`project` + `statuses` + `taskSummary` aggregate counts, ~8KB) plus the top 20 cards per column (`first: 20`).
  2. **Per-Column Keyset Infinite Scroll**: Subsequent cards are fetched incrementally on scroll boundary thresholds via keyset cursors.
  3. **DOM Virtualization**: Each column virtualizes card items using `react-virtual`, rendering a maximum of 12 DOM elements per column at any instant.
  4. **Optimistic Mutation Pipeline**: Drag-and-drop updates local normalized cache instantly; a lightweight mutation (`moveTaskStatus(id, targetStatusId, targetPosition)`) fires asynchronously with automatic rollback on network failure.

---

## 3. Detailed Technical Specification (Recommended Solution)

### 3.1 GraphQL Schema Evolution

We deprecate the monolithic `tasks` field in favor of column-scoped windowing and decoupled aggregations:

```graphql
# New lightweight board initialization query
query GetBoardBootstrap($projectId: ID!) {
  project(id: $projectId) {
    id
    name
    key
    statuses {
      id
      name
      color
      category
      position
    }
  }
  taskSummary(projectId: $projectId) {
    totalTasks
    overdueTasks
    completedTasks
    byStatus {
      status { id }
      count
    }
    byPriority {
      priority
      count
    }
  }
}

# Per-column window query
query GetColumnTasks(
  $projectId: ID!
  $statusId: ID!
  $first: Int = 20
  $after: String
  $filter: TaskFilterInput
) {
  columnTasks(
    projectId: $projectId
    statusId: $statusId
    first: $first
    after: $after
    filter: $filter
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        taskKey
        title
        priority
        dueDate
        orderInStatus
        assignee {
          id
          fullName
          avatarUrl
        }
        labels {
          id
          name
          color
        }
      }
    }
  }
}
```

### 3.2 Frontend Optimistic Drag-and-Drop Pipeline

```
                     OPTIMISTIC MUTATION SEQUENCE
                     
    User Drags Card ────────► Instant Cache Update
                                  │
                                  ├─► Reposition card in target column DOM (<16ms)
                                  ├─► Increment target status counter badge
                                  └─► Decrement source status counter badge
                                  │
                              Fire Mutation
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
         Mutation Succeeds                 Mutation Fails
                 │                                 │
         Confirm revision ID               Revert cache snapshot
         Silent background sync            Display non-blocking toast
```

---

## 4. Performance Targets & SLOs ("What Good Looks Like")

```
                      PERFORMANCE TARGET COMPARISON
                      
   Initial Load (p95)  [██████████████████████████████████] 7,200ms (Baseline)
                       [███] 750ms (SLO Target)
                       
   Payload Size        [██████████████████████████████████] 4,800 KB (Baseline)
                       [█] 110 KB (SLO Target)
                       
   Card Drag Latency   [██████████████████████████████████] 6,500ms (Baseline)
                       [░] 30ms (SLO Target)
```

1. **Largest Contentful Paint (LCP)**: \(\le 800\text{ms}\) at p95 on standard 4G networks.
2. **Interaction to Next Paint (INP)**: \(\le 50\text{ms}\) on drag-and-drop actions.
3. **Cumulative Layout Shift (CLS)**: \(0.00\) during incremental card streaming.
4. **Bandwidth Footprint**: \(<120\text{KB}\) for initial fold rendering.

---

## 5. Phased Rollout & Migration Strategy

To protect existing enterprise workflows, we execute a zero-risk, canary-based rollout governed by LaunchDarkly feature flags:

```
                            PHASED ROLLOUT TIMELINE
                            
    Sprint 1: Core API     Sprint 2: UI Virtualization   Sprint 3: Dogfooding     Sprint 4: General
   ┌────────────────────┐ ┌───────────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
   │ Deploy column      │ │ Build virtualized column  │ │ Enable for internal│ │ 10% -> 25% -> 50%  │
   │ queries & keyset   │ │ component & optimistic    │ │ projects & beta    │ │ -> 100% of orgs;   │
   │ compound indexes   │ │ mutation cache handlers   │ │ enterprise orgs    │ │ monitor p95 latencies│
   └────────────────────┘ └───────────────────────────┘ └────────────────────┘ └────────────────────┘
```

### Risk Mitigation & Kill Switch
* **Feature Flag**: `growth_kanban_virtualization_v2` dynamically toggles between the legacy monolithic query and the virtualized column queries per organization.
* **Automatic Circuit Breaker**: If Apollo Client detects \(\ge 3\%\) unhandled mutation rejections or cursor decoding errors within 60 seconds, the frontend automatically falls back to the legacy renderer without requiring service restarts.
* **Telemetry & Observability**: Real-time Datadog RUM dashboards monitoring INP, LCP, GraphQL resolver duration, and database connection pool saturation.
