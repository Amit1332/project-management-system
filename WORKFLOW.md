# Frontend Workflow & Application User Journey Guide

Welcome to the **Project Management SaaS** frontend workflow guide. This document explains the step-by-step user journey, application routing, state management architecture, real-time Socket.io events, and role-based permissions system.

---

## Table of Contents
1. [Overview & High-Level Architecture](#1-overview--high-level-architecture)
2. [User Journey & Feature Workflows](#2-user-journey--feature-workflows)
   - [Step 1: Authentication & Workspace Entry](#step-1-authentication--workspace-entry)
   - [Step 2: Multi-Tenant Organization Selection](#step-2-multi-tenant-organization-selection)
   - [Step 3: Project Creation & Member Onboarding](#step-3-project-creation--member-onboarding)
   - [Step 4: Task Creation & Project-Scoped Assignee Selection](#step-4-task-creation--project-scoped-assignee-selection)
   - [Step 5: Drag & Drop Kanban Board (0ms Optimistic UI)](#step-5-drag--drop-kanban-board-0ms-optimistic-ui)
   - [Step 6: Task Details, Real-Time Comments & Mentions](#step-6-task-details-real-time-comments--mentions)
   - [Step 7: Real-Time Notifications & Activity History Audit Trail](#step-7-real-time-notifications--activity-history-audit-trail)
3. [Role-Based Access Control (RBAC) Matrix](#3-role-based-access-control-rbac-matrix)
4. [Real-Time WebSocket Architecture (Socket.io)](#4-real-time-websocket-architecture-socketio)
5. [Frontend State & Performance Optimization](#5-frontend-state--performance-optimization)

---

## 1. Overview & High-Level Architecture

The frontend is a single-page React application (Vite) engineered for real-time team collaboration. It uses **Redux Toolkit Query (RTK Query)** for server state management and automatic caching, **Material-UI (MUI v6)** for responsive styling, and **Socket.io** for instantaneous multi-user updates.

```
                               ┌──────────────────────────────────┐
                               │   React SPA (Vite Component Tree) │
                               └────────────────┬─────────────────┘
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
            ┌───────────────────────────┐               ┌───────────────────────────┐
            │   RTK Query Data Layer    │               │  Socket.io Real-Time Hub  │
            │ • Optimistic Cache Updates│               │ • Multi-room subscriptions│
            │ • Auto Token Re-Auth      │               │ • Live event listeners    │
            └─────────────┬─────────────┘               └─────────────┬─────────────┘
                          │                                           │
                          ▼                                           ▼
            ┌───────────────────────────────────────────────────────────────┐
            │                     Express 5 API Server                      │
            └───────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey & Feature Workflows

### Step 1: Authentication & Workspace Entry
1. **Register/Login**:
   - Navigate to `/login` or `/register`.
   - On submission, the server verifies credentials and returns a JWT token.
   - The token is automatically saved in `localStorage` and attached to all HTTP requests via Redux `baseQueryWithReauth`.
2. **Auto-Login & Workspace Load**:
   - The user profile (`/auth/me`) is loaded into Redux state (`auth.user`).
   - The user's active organization is set automatically in Redux (`auth.currentOrganization`).

---

### Step 2: Multi-Tenant Organization Selection
1. **Organization Header Selector**:
   - In the top header bar, users can view their current organization or switch to another organization via the dropdown selector.
2. **Tenant Scoping**:
   - Every API query automatically appends `organizationId` to ensure complete data isolation between organizations.

---

### Step 3: Project Creation & Member Onboarding
1. **Creating a Project**:
   - Navigate to **Projects** (`/projects`) and click **Create Project**.
   - Input project name, description, priority, and target due date.
   - The user creating the project is assigned the **`OWNER`** / **`MANAGER`** role for that project.
2. **Adding Members to Project**:
   - Open **Project Details** (`/projects/:projectId`) $\rightarrow$ **Members** tab.
   - Click **Add Member** and select an Organization Member. Assign them a role:
     - **`MANAGER`**: Can manage tasks, edit project settings, assign tasks, and moderate comments.
     - **`MEMBER`**: Can view board, drag/move assigned tasks, and write comments.
   - **Real-time Event**: Adding a member generates a live `USER_ADDED_TO_PROJECT` notification to the invited user and logs a `PROJECT_MEMBER_ADDED` event in the Activity History.

---

### Step 4: Task Creation & Project-Scoped Assignee Selection
1. **Creating a Task**:
   - On the Project Details or Kanban page, click **Create Task**.
   - Fill in Task Title, Description, Priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), and Due Date.
2. **Assignee Dropdown Enforcement**:
   - The Assignee dropdown menu **strictly populates only members who belong to that specific project**.
   - Non-project organization members are filtered out to prevent unauthorized task assignments.

---

### Step 5: Drag & Drop Kanban Board (0ms Optimistic UI)
1. **Board Navigation**:
   - Navigate to **Kanban Board** (`/projects/:projectId/board`).
2. **Drag & Drop Action**:
   - Grab any task card and drop it into a target column (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `DONE`).
3. **0ms Latency Optimistic Update**:
   - The Redux RTK Query cache (`onQueryStarted`) updates the local board state **instantly (0ms)** before the API request completes.
   - If the backend request succeeds, cache invalidation updates smoothly in the background.
4. **Real-Time Notification Broadcast**:
   - When a member moves a task status:
     - **Project Managers & Project Owner** receive instant notifications (*"Task 'X' status changed to IN_REVIEW"*).
     - **Task Creator** receives a notification.
     - **Assignee** receives a notification (if updated by someone else).

---

### Step 6: Task Details, Real-Time Comments & Mentions
1. **View Task Details**:
   - Click any task card to open **Task Details** (`/projects/:projectId/tasks/:taskId`).
2. **Real-Time Comments**:
   - Type a comment in the comment box and click **Send**.
   - Socket.io broadcasts `comment:created` to all open browser windows viewing that task.
3. **@Mentioning Team Members**:
   - Type `@` to open the interactive member autocomplete list.
   - Mentioning a user sends them a direct `USER_MENTIONED` notification.
4. **Comment Moderation Restrictions**:
   - Users with the **`MEMBER`** role cannot edit or delete comments (action buttons are hidden, and backend blocks unauthorized requests).
   - Only **`MANAGER`**, **`OWNER`**, or Organization **`ADMIN`** roles can edit or delete comments.

---

### Step 7: Real-Time Notifications & Activity History Audit Trail
1. **Header Notification Bell**:
   - Unread badge counter updates live whenever a notification arrives.
   - Clicking the bell opens the notifications panel with one-click **Mark as Read** capabilities.
2. **Activity History Audit Log**:
   - View full audit history under **Activity History**.
   - Activity items display full sentences with target user names:
     - *"Amitesh Patel created task `#123456 (Task Title)` and assigned to Rahul"*
     - *"Amitesh Patel added project member Rahul Patel"*
   - **Clickable Task Badges**: Clicking any `#123456` badge navigates directly to that task page.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Feature / Action | Org Owner | Org Admin | Project Manager | Project Member |
| :--- | :---: | :---: | :---: | :---: |
| Create / Archive Projects | ✅ | ✅ | ❌ | ❌ |
| Add / Remove Project Members | ✅ | ✅ | ✅ | ❌ |
| Update Project Member Roles | ✅ | ✅ | ✅ | ❌ |
| Create & Assign Tasks | ✅ | ✅ | ✅ | ❌ |
| Drag & Move Assigned Tasks | ✅ | ✅ | ✅ | ✅ |
| Add Comments & @Mentions | ✅ | ✅ | ✅ | ✅ |
| Edit / Delete Comments | ✅ | ✅ | ✅ | ❌ |
| View Activity History & Board | ✅ | ✅ | ✅ | ✅ |

---

## 4. Real-Time WebSocket Architecture (Socket.io)

The frontend automatically joins Socket.io rooms upon page navigation:
- `joinRoom("project", projectId)`: Listens to project-wide events.
- `joinRoom("task", taskId)`: Listens to task-specific events.

### Managed Socket Events

| Socket Event Name | Trigger | Frontend Action |
| :--- | :--- | :--- |
| `task:created` | New task created | Refetches task lists & Kanban columns |
| `task:status_changed` | Task status moved | Updates Kanban board & Task Detail state |
| `task:priority_changed` | Task priority updated | Updates task priority chip |
| `comment:created` | New comment posted | Appends new comment card in real-time |
| `comment:updated` | Comment content edited | Updates comment text in real-time |
| `comment:deleted` | Comment deleted | Removes comment card from DOM |
| `notification:created` | New notification sent | Increments bell icon badge counter |

---

## 5. Frontend State & Performance Optimization

1. **Route-Level Code-Splitting (`React.lazy` + `Suspense`)**:
   - All pages are lazily imported in `router.jsx`, reducing initial load bundle size by >60%.
2. **Component Memoization (`React.memo`)**:
   - Card items (`TaskCard`, `ProjectCard`) are wrapped in `React.memo` to prevent re-rendering unaffected cards during drag-and-drop actions.
3. **Frictionless UI Positioning**:
   - MUI layout components maintain clean flex spacing and dynamic card math to eliminate text truncation or element overlap on mobile devices.
