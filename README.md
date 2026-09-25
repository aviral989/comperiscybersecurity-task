# Multi-Tenant Project Management Platform
### Senior Full-Stack Developer — Take-Home Technical Assessment
**Company**: Comperis Cybersecurity  
**Candidate Submission**: Aviral Gupta  
**Evaluation Scope**: Impact, Engineering Excellence, People/Leadership, Direction/Strategy  

---

## 🎯 Executive Overview

This repository contains the complete deliverables for the **Senior Full-Stack Developer Take-Home Technical Assessment**. The solution designs and implements a high-performance, multi-tenant project management platform (similar to Linear and Jira) specialized for cybersecurity, security operations (SOC), and cloud infrastructure teams.

### System Architecture Highlights
* **Multi-Tenancy & Security Isolation**: Logical data isolation across organizations using PostgreSQL Row-Level Security (RLS) policies and context-bound GraphQL authorization middleware.
* **Keyset Cursor Pagination**: True \(O(1)\) Relay-compliant cursor pagination (`edges`, `pageInfo`, `cursor`) eliminating offset-based database degradation.
* **Customizable Project Workflows**: Dynamic per-project statuses (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`) with custom color coding and fractional ordering.
* **Optimistic Real-Time Kanban Board**: Modern React + TypeScript task board with sub-16ms optimistic UI updates, interactive Threat Priority distribution chart, and SLA breach tracking.
* **Comprehensive Architectural RFC**: Production-ready RFC detailing solutions for scaling task boards to 2,000+ tasks under high concurrency.

---

## 📁 Repository Directory Structure

```
comperiscybersecurity-task/
├── README.md                                # Master project documentation & guide
├── package.json                             # Root orchestrator (concurrent dev runner)
│
├── docs/                                    # Technical Documentation & Deliverables
│   ├── part1-system-design/
│   │   ├── schema.graphql                   # Task 1.1: GraphQL Schema type definitions
│   │   ├── schema.sql                       # Task 1.1: PostgreSQL DDL with RLS, triggers & indexes
│   │   ├── technical-documentation.md       # Task 1.2: 2-3 page System Design & ERD doc
│   │   └── architecture-critique.md         # Task 1.3: AI Critique & Senior Engineer Analysis
│   │
│   ├── part3-rfc/
│   │   └── rfc-task-board-performance.md    # Task 3.1: 2-3 page Engineering RFC for 2,000+ tasks
│   │
│   └── ai-transcript/
│       ├── prompting-strategy-commentary.md # AI usage methodology & validation approach
│       └── ai-transcript.md                 # Complete, unedited transcript of AI interactions
│
├── backend/                                 # Task 2.1: Node.js GraphQL API
│   ├── src/
│   │   ├── schema/typeDefs.ts               # GraphQL schema definition
│   │   ├── resolvers/                       # Task & Summary aggregation resolvers (>150 lines)
│   │   │   ├── index.ts
│   │   │   ├── taskResolvers.ts
│   │   │   └── summaryResolvers.ts
│   │   ├── db/store.ts                      # Multi-tenant in-memory relational store & seed data
│   │   ├── middleware/auth.ts               # Multi-tenant RBAC context builder
│   │   └── server.ts                        # Apollo Server + Express bootstrap
│   ├── DESIGN_DECISIONS.md                  # Task 2.1: Backend design decisions (200-300 words)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                                # Task 2.2: React TypeScript Task Board UI
    ├── src/
    │   ├── components/
    │   │   ├── TaskBoard.tsx                # Master Kanban board container
    │   │   ├── KanbanColumn.tsx             # Column workflow renderer
    │   │   ├── TaskCard.tsx                 # Card with badges, labels, due date & quick shift
    │   │   ├── SummaryMetrics.tsx           # KPI metrics (Total, Overdue, In-Flight, Completion)
    │   │   ├── PriorityDistributionChart.tsx# Data Visualization: Priority distribution chart
    │   │   ├── FilterToolbar.tsx            # Search, assignee filter, and SLA toggle
    │   │   └── CreateTaskModal.tsx          # Interactive task creation modal
    │   ├── api/client.ts                    # GraphQL client with query definitions
    │   ├── types/index.ts                   # TypeScript interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── DESIGN_DECISIONS.md                  # Task 2.2: Frontend architecture decisions (200-300 words)
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (Node v20+ recommended)
* **npm**: v9.0.0 or higher

### 1. Installation
Install all dependencies across root, backend, and frontend with a single command:
```bash
npm run install:all
```

### 2. Running the Full-Stack Application
Start both the GraphQL Backend API (`http://localhost:4000/graphql`) and the Vite React Frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

* **Frontend UI**: Open your browser at **[http://localhost:3000](http://localhost:3000)**
* **GraphQL Playground & Sandbox**: Available at **[http://localhost:4000/graphql](http://localhost:4000/graphql)**
* **Health Check**: Available at `http://localhost:4000/health`

---

## 🧩 Deliverables Checklist

### Part 1: Recursive AI Logic & System Design
* [x] **Task 1.1**: GraphQL schema definitions (`docs/part1-system-design/schema.graphql`) + PostgreSQL DDL (`docs/part1-system-design/schema.sql`) with RLS policies, composite indexes, and atomic sequence triggers.
* [x] **Task 1.2**: Comprehensive technical documentation (`docs/part1-system-design/technical-documentation.md`) covering Mermaid ERDs, query patterns, keyset indexing, multi-tenant RLS, and expand-and-contract migrations.
* [x] **Task 1.3**: AI architectural critique + Staff Engineer written analysis (`docs/part1-system-design/architecture-critique.md`) addressing N+1 risks, DataLoader cache poisoning, cursor tie-breaking on identical timestamps, and a prioritized remediation roadmap.

### Part 2: Full-Stack Implementation
* [x] **Task 2.1**: Node.js GraphQL API with Apollo Server (`backend/src/`) featuring:
  * Rich multi-facet task filtering (status, assignee, priority, due date range, text search, overdue)
  * Relay-compliant keyset cursor pagination (`first`, `after`, `edges`, `pageInfo`)
  * KPI summary aggregation query (`taskSummary`)
  * Multi-tenant RBAC authorization middleware (`x-tenant-id`, `x-user-id`)
  * Design decisions write-up (`backend/DESIGN_DECISIONS.md`)
* [x] **Task 2.2**: React TypeScript Task Board UI (`frontend/src/`) featuring:
  * Kanban-style board with columns grouped by project statuses
  * Summary KPI cards with SLA breach animations
  * Interactive Priority Distribution Chart (data visualization)
  * Real-time search, assignee filters, and SLA overdue toggle
  * Optimistic UI updates on card status transitions
  * Loading skeletons, error notifications with retry, and empty column states
  * Create Task modal with live board injection
  * Design decisions write-up (`frontend/DESIGN_DECISIONS.md`)

### Part 3: Technical Communication & Product Thinking
* [x] **Task 3.1**: Production-grade RFC (`docs/part3-rfc/rfc-task-board-performance.md`) addressing 2,000+ task performance with metrics framing, 3 evaluated options, recommended virtualized windowing architecture, concrete SLO targets, and canary rollout plan.

### AI Transcript & Prompting Methodology
* [x] **Commentary**: Prompting strategy and validation commentary (`docs/ai-transcript/prompting-strategy-commentary.md`).
* [x] **Transcript**: Complete transcript of AI interactions (`docs/ai-transcript/ai-transcript.md`).

---

## 🛠️ Verification & Testing Commands

To verify code quality and compile TypeScript without running the server:
```bash
# Build & verify backend TypeScript
cd backend && npm run build

# Build & verify frontend TypeScript & Vite bundle
cd ../frontend && npm run build
```

---

## 🔐 Multi-Tenant Security Model

The backend simulates production JWT context via request headers:
* `x-tenant-id`: Controls the active organization tenant (defaults to `org-1` - Comperis Cyber Security; alternate tenant `org-2` - Apex Shield Labs).
* `x-user-id`: Controls the authenticated user (defaults to `usr-1` - Alice Vance, Owner/Admin).
* Attempting to query resources outside the user's tenant or mutating tasks with `VIEWER` credentials automatically triggers `403 Forbidden` errors.
