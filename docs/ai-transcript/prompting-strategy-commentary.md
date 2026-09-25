# Commentary on AI Prompting Strategy & Engineering Iteration

**Candidate**: Senior Full-Stack Developer  
**Assessment**: Take-Home Technical Assessment — Comperis Cybersecurity  

---

## 1. Core Prompting Philosophy: AI as a Senior Architectural Force Multiplier

Rather than treating AI as a search engine or generic autocomplete tool, my prompting approach leverages AI as a **specialized staff-level peer reviewer, rapid prototyping accelerant, and adversarial critic**. The goal is not passive acceptance of AI outputs, but active architectural steering, rigorous validation, and iterative refinement.

```
                         PROMPTING & ITERATION WORKFLOW
                         
    Step 1: DOMAIN FRAMING ──► Step 2: TARGETED GENERATION ──► Step 3: ADVERSARIAL CRITIQUE
    Define multi-tenant       Generate DDL, GraphQL types,    Force AI to locate N+1,
    threat model & SLAs       Relay connections & indexes     precision loss & leak vectors
                                                                        │
                                                                        ▼
    Step 6: PRODUCTION VERIFICATION ◄── Step 5: CODE HARDENING ◄── Step 4: HUMAN EVALUATION
    Compile TypeScript, test            Implement keyset cursor,      Challenge blind spots,
    GraphQL & React UI live             optimistic UI & RLS guards    synthesize senior roadmap
```

---

## 2. Iteration Breakdown & Engineering Decisions

### Iteration 1: Domain Scoping & Relational Foundation
* **Prompting Intent**: Establish a multi-tenant relational foundation with explicit security constraints, foreign keys, and customizable workflows before writing any application code.
* **Refinement Applied**: When initial models suggested basic auto-incrementing integer IDs, I prompted for UUIDs (`gen_random_uuid()`) combined with human-readable project-scoped identifiers (`SOC-1`, `SOC-2`) via atomic sequences to prevent enumeration attacks across tenants.

### Iteration 2: Relay-Compliant Keyset Pagination & Aggregations
* **Prompting Intent**: Standardize GraphQL schemas around production patterns rather than naive array returns.
* **Refinement Applied**: Replaced offset/limit variables with `first`, `after`, `edges`, `pageInfo`, and compound cursors. Decoupled heavy task list fetching from executive KPI aggregations (`taskSummary`), guaranteeing lightweight initial fold rendering.

### Iteration 3: Adversarial Architectural Critique
* **Prompting Intent**: Intentionally instructed the AI to attack the proposed schema for failure modes under 100x volume, N+1 resolver waterfalls, and multi-tenant security risks.
* **Validation & Human Counter-Analysis**:
  - The AI correctly flagged N+1 risks and floating-point ordering limits.
  - However, **I identified key blind spots the AI missed**: standard DataLoader implementations introduce cross-tenant cache contamination if keys are not scoped by `(tenantId, entityId)`, and cursor pagination breaks when timestamps share millisecond parity without composite unique tie-breakers.

### Iteration 4: Full-Stack Code Implementation & Type Safety
* **Prompting Intent**: Implement full-stack Node.js + React code that runs out-of-the-box with zero mock omissions.
* **Refinement Applied**: Replaced abstract ORM stubs with a fully operational in-memory relational store supporting multi-tenant isolation, compound filtering, keyset pagination, and optimistic React UI updates.

---

## 3. Principles for Validating AI Outputs
1. **Mathematical & Precision Bounds**: Validate that algorithmic shortcuts (e.g., midpoint float division for card positioning) are tested against numerical limits.
2. **Security & Boundary Auditing**: Never assume an AI-generated resolver enforces authorization. Explicitly verify tenant boundary checks (`organizationId`) at the middleware, resolver, and database levels.
3. **Execution Rigor**: Every TypeScript interface, GraphQL schema definition, and React component must compile cleanly under strict mode (`tsc --noEmit`) and run locally.
