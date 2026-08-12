# MERN Practical Task — Project Management SaaS (Sunday)

A multi-tenant, enterprise-grade Project Management SaaS application built on the MERN stack (MongoDB, Express, React 18, Node.js) featuring real-time Socket.io updates, Upstash Redis caching, interactive drag-and-drop Kanban board, activity audit trail, live registered user database search, and granular Role-Based Access Control (RBAC).

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
4. [Tech Stack](#4-tech-stack)
5. [Architecture Overview](#5-architecture-overview)
6. [Database Schemas & Relationships](#6-database-schemas--relationships)
7. [API Documentation](#7-api-documentation)
8. [Environment Variables](#8-environment-variables)
9. [Local Setup Instructions](#9-local-setup-instructions)
10. [Deployment Instructions](#10-deployment-instructions)
11. [Test Credentials](#11-test-credentials)
12. [Future Improvements](#12-future-improvements)

---

## 1. Project Overview

**Sunday** is designed as a scalable multi-tenant SaaS workspace platform where organizations can manage projects, track tasks via interactive Kanban boards, log activities, collaborate via real-time comments, and enforce strict organizational roles.

### Key Technical Highlights:
- **Multi-Tenant Isolation**: Complete data segregation by `organizationId`.
- **High-Performance Caching**: Non-blocking Upstash Redis cache layer for sub-10ms query speeds.
- **Zero-Latency Drag & Drop**: RTK Query optimistic updates coupled with smooth 60fps Kanban board transitions.
- **Real-Time Collaboration**: Live Socket.io updates for comments, task state shifts, priority updates, and assignee changes.
- **Granular Role-Based Access Control**: Strict role enforcement across Organization (`OWNER`, `ADMIN`, `MEMBER`) and Project levels (`MANAGER`, `MEMBER`).
- **Complete Logout State Purge**: Root Redux reducer state reset purging all RTK Query caches, `localStorage`, and `sessionStorage`.

---

## 2. Key Features

### 🏢 Multi-Tenant Workspace & Organization Management
- **Workspace Switcher**: Switch between multiple organization workspaces seamlessly via the sidebar.
- **Live User Search Invitations**: Add organization members using a live database search dropdown (`Autocomplete`) that queries registered users by name or email.
- **Role Management**: Organization `OWNER` and `ADMIN` can update member roles or remove members.

### 📋 Project & Task Management
- **Project Workspaces**: Create, update, archive, and filter projects by status (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`) or priority.
- **Task Workspace**: Filter tasks by search query, status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), or priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with 1-click reset and pagination.
- **Task View Details**: View task metadata, edit status/priority/assignee/due date, and collaborate via full-width real-time comments.

### 🎨 Interactive Kanban Board
- **Drag-and-Drop Column Transitions**: Move tasks smoothly across 4 stage columns (`To Do`, `In Progress`, `In Review`, `Done`).
- **Real-Time Socket Synchronization**: Task status moves and additions broadcast live across all connected team members.
- **Optimistic Updates**: Instant UI feedback on drag-and-drop operations with server-side rollbacks if needed.

### 💬 Real-Time Comments & Notifications
- **Task Comments**: Real-time comment threads with timestamps and author details.
- **In-App Notifications**: Real-time notifications displaying exact date and time (e.g., `12 Aug 2026, 02:45 PM`).

### 📜 Activity Log & Audit Trail
- **Project Activity Timeline**: Full audit trail capturing project updates, task state changes, member invitations, and role modifications.

---

## 3. Role-Based Access Control (RBAC)

The platform implements multi-layered RBAC to ensure appropriate feature visibility and backend action authorization:

| Feature / Action | `OWNER` / `SUPER_ADMIN` | Organization `ADMIN` | Project `MANAGER` | Regular `MEMBER` |
| :--- | :---: | :---: | :---: | :---: |
| **Create / Manage Workspaces** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Invite Org Members (User Search)** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Create & Edit Projects** | ✅ Yes | ✅ Yes | ✅ Yes (assigned project) | ❌ Hidden |
| **Create & Archive Tasks** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Hidden |
| **Update Task Priority & Assignee** | ✅ Yes | ✅ Yes | ✅ Yes | 🔒 Disabled |
| **Update Task Status & Comment** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Manage Project Members & Roles** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Hidden |

> **Note**: An Organization `ADMIN`, `OWNER`, or `SUPER_ADMIN` automatically possesses full management rights across all workspace projects, tasks, and settings even if they are not explicitly listed in an individual project's member roster.

---

## 4. Tech Stack

### **Frontend**
- **Framework**: React 18, Vite
- **State Management & Caching**: Redux Toolkit & RTK Query
- **UI Components & Styling**: Material-UI (MUI v6), Vanilla CSS, Lucide Icons
- **Routing**: React Router v6 (with `React.lazy()` code-splitting)
- **Real-Time Communication**: `socket.io-client`

### **Backend**
- **Runtime**: Node.js, Express 5
- **Database**: MongoDB Atlas with Mongoose ODM
- **Caching**: `ioredis` (Upstash Redis integration)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
- **Real-Time Engine**: `socket.io`

---

## 5. Architecture Overview

```
               ┌────────────────────────────────────────┐
               │          React SPA (Vite)              │
               │   RTK Query Cache + Socket.io Client   │
               └───────────────────┬────────────────────┘
                                   │
                         HTTP REST │ Socket.io (WebSocket)
                                   ▼
               ┌────────────────────────────────────────┐
               │         Express 5 API Server           │
               ├────────────────────────────────────────┤
               │   Middlewares:                         │
               │   • Auth (JWT)                         │
               │   • Tenant Validation (organizationId) │
               │   • RBAC Role Enforcement              │
               └───────────┬────────────────┬───────────┘
                           │                │
             Non-blocking  │                │ MongoDB Queries
             Cache-Aside   ▼                ▼
                     ┌───────────┐    ┌───────────┐
                     │  Upstash  │    │  MongoDB  │
                     │   Redis   │    │   Atlas   │
                     └───────────┘    └───────────┘
```

---

## 6. Database Schemas & Relationships

1. **Users (`users.model.js`)**:
   - `name`, `email`, `password` (hashed), `avatar`, `isActive`, `lastLoginAt`.
2. **Organizations (`organizations.model.js`)**:
   - `name`, `description`, `ownerId` $\rightarrow$ References `Users`.
3. **OrganizationMembers (`organizationMembers.model.js`)**:
   - Join collection connecting `Users` to `Organizations`. Roles: `OWNER`, `ADMIN`, `MEMBER`.
4. **Projects (`projects.models.js`)**:
   - `name`, `description`, `startDate`, `dueDate`, `status`, `priority`, `organizationId`, `ownerId`.
5. **ProjectMembers (`projectMembers.model.js`)**:
   - Join collection connecting `Users` to `Projects`. Roles: `MANAGER`, `MEMBER`.
6. **Tasks (`tasks.model.js`)**:
   - `title`, `description`, `status`, `priority`, `dueDate`, `labels`, `projectId`, `organizationId`, `assigneeId`, `createdBy`.
7. **Comments (`comments.models.js`)**:
   - `content`, `taskId`, `projectId`, `organizationId`, `userId`.
8. **ActivityLogs (`activityLogs.model.js`)**:
   - `action`, `entityType`, `entityId`, `organizationId`, `projectId`, `userId`, `details`.
9. **Notifications (`notifications.models.js`)**:
   - `recipientId`, `senderId`, `type`, `title`, `message`, `read`, `createdAt`.

---

## 7. API Documentation

### **Authentication & Users**
- `POST /api/auth/register`: Register user account & default workspace.
- `POST /api/auth/login`: Authenticate user & issue JWT token.
- `POST /api/auth/logout`: Revoke session & clear state.
- `GET /api/auth/me`: Get authenticated user profile.
- `GET /api/auth/users/search?search=...`: Search registered users in DB by name or email.

### **Organizations**
- `GET /api/organizations`: Get user's workspaces.
- `POST /api/organizations`: Create new organization workspace.
- `GET /api/organizations/:id/members`: List organization members.
- `POST /api/organizations/:id/members`: Add member to organization.
- `PATCH /api/organizations/:id/members/:userId`: Update organization member role.
- `DELETE /api/organizations/:id/members/:userId`: Remove organization member.

### **Projects**
- `GET /api/projects`: List workspace projects (supports pagination, search, status, priority filters).
- `POST /api/projects`: Create project.
- `GET /api/projects/:projectId`: Get project details.
- `PUT /api/projects/:projectId`: Update project.
- `DELETE /api/projects/:projectId`: Archive project.
- `GET /api/projects/:projectId/members`: Get project team members.
- `POST /api/projects/:projectId/members`: Add member to project.
- `PATCH /api/projects/:projectId/members/:userId`: Update project member role.
- `DELETE /api/projects/:projectId/members/:userId`: Remove project member.

### **Tasks & Kanban**
- `GET /api/tasks`: List project tasks with search, status, priority, and pagination filters.
- `GET /api/tasks/kanban`: Get tasks grouped by stage columns (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- `GET /api/tasks/:id`: Get single task details.
- `POST /api/tasks`: Create task.
- `PUT /api/tasks/:id`: Update task details.
- `PATCH /api/tasks/:id/status`: Update task status stage.
- `PATCH /api/tasks/:id/priority`: Update task priority.
- `PATCH /api/tasks/:id/assignee`: Update task assignee.
- `DELETE /api/tasks/:id`: Archive task.

### **Comments & Activity Logs**
- `GET /api/projects/:projectId/tasks/:taskId/comments`: Get task comments.
- `POST /api/projects/:projectId/tasks/:taskId/comments`: Add comment.
- `GET /api/projects/:projectId/activity`: Get project activity history log.
- `GET /api/notifications`: Get user notifications.

---

## 8. Environment Variables

### **Server Environment Variables (`server/.env`)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname
REDIS_URL=rediss://default:<password>@host.upstash.io:6379
JWT_SECRET=your_super_secret_jwt_key
JWT_ACCESS_EXPIRATION_MINUTES=43200
CLIENT_URL=http://localhost:5173
```

### **Client Environment Variables (`client/.env`)**
```env
VITE_API_URL=http://localhost:3001
```

---

## 9. Local Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB or MongoDB Atlas cluster
- **Redis**: Local Redis server or Upstash Redis database

### Step 1: Clone Repository
```bash
git clone https://github.com/Amit1332/project-management-system.git
cd project-management-system
```

### Step 2: Set Up Server
```bash
cd server
npm install
# Configure your server/.env file
npm start
```

### Step 3: Set Up Client
```bash
# In a new terminal window
cd client
npm install
# Configure your client/.env file
npm run dev
```

### Step 4: Launch Application
Open your browser at `http://localhost:5173`.

---

## 10. Deployment Instructions

### **Backend (Render / Railway)**
1. Connect your GitHub repository to Render/Railway.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `node ./src/index.js`
5. Add Environment Variables (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CLIENT_URL`).

### **Frontend (Vercel)**
1. Import repository to Vercel.
2. Set Root Directory to `client`.
3. Set Framework Preset: `Vite`.
4. Set Environment Variable: `VITE_API_URL` = Your Backend Production URL.

---

## 11. Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Organization Owner** | `owner@example.com` | `Password123!` | Full control over workspaces, projects, roles, members, & tasks |
| **Organization Admin** | `admin@example.com` | `Password123!` | Full admin access across all projects, members, & tasks |
| **Project Manager** | `manager@example.com` | `Password123!` | Manages project tasks, assigns members, updates priority & due dates |
| **Regular Member** | `member@example.com` | `Password123!` | Views tasks, advances task status, creates comments |

---

## 12. Future Improvements

- **File Attachments**: Cloudinary / S3 document uploads on task comments.
- **Gantt & Sprint Views**: Project milestone timelines and sprint planning.
- **Time Logging**: Track estimated vs. actual time spent per task.
- **OAuth2 SSO**: Google & GitHub single sign-on integration.