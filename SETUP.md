# 🚀 Sunday Project Management SaaS — Setup & Installation Guide

This document provides complete step-by-step instructions to install, configure, and run the **Sunday Project Management SaaS** application locally on your machine.

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.x` or higher (comes with Node.js)
- **MongoDB Database**: Local MongoDB instance or free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Redis Database**: Local Redis server or free database on [Upstash Redis](https://upstash.com)

---

## ⚡ Quick Start Setup (One-Click)

### On Windows (Command Prompt):
Double-click `setup.bat` or run:
```cmd
setup.bat
```

This automatic setup script will:
1. Install all backend dependencies in `server/node_modules`.
2. Automatically create `server/.env` from `server/.env.example`.
3. Install all frontend dependencies in `client/node_modules`.
4. Automatically create `client/.env` from `client/.env.example`.

---

## 🛠️ Step-by-Step Manual Setup Guide

If you prefer to set up the application manually, follow these steps:

### Step 1: Clone Repository
```bash
git clone https://github.com/Amit1332/project-management-system.git
cd project-management-system
```

---

### Step 2: Configure & Start Backend Server

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `server/.env` in your code editor and configure your credentials:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=mongodb+srv://your_username:your_password@cluster0.mongodb.net/sunday_db?retryWrites=true&w=majority
   REDIS_URL=rediss://default:your_redis_password@your_host.upstash.io:6379
   JWT_SECRET=your_super_secret_jwt_key
   JWT_ACCESS_EXPIRATION_MINUTES=43200
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the Backend Server**:
   ```bash
   npm start
   ```
   You should see:
   ```text
   Server running on port 3001
   Connected to MongoDB Database
   Connected to Upstash Redis
   ```

---

### Step 3: Configure & Start Frontend Client

1. **Open a new terminal window** and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `client/.env` points to your backend URL:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the Vite Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The terminal will output:
   ```text
   VITE v6.x.x  ready in 300 ms

   ➜  Local:   http://localhost:5173/
   ```

---

## 🔑 Accessing the Application & Test Accounts

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

### Pre-Configured Test Credentials:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Organization Owner** | `owner@example.com` | `Password123!` | Full control over orgs, projects, roles, members, & tasks |
| **Organization Admin** | `admin@example.com` | `Password123!` | Full admin access across all workspace projects & tasks |
| **Project Manager** | `manager@example.com` | `Password123!` | Manages project tasks, assigns members, updates priority & due dates |
| **Regular Member** | `member@example.com` | `Password123!` | Views board, advances task status, creates comments |

---

## 📮 Postman Collection Setup (API Testing)

A complete Postman Collection is included in the project root: [`postman_collection.json`](file:///E:/amit/project-management-system/postman_collection.json).

### How to Import & Run APIs in Postman:
1. Open **Postman**.
2. Click **Import** (top-left button).
3. Drag & drop [`postman_collection.json`](file:///E:/amit/project-management-system/postman_collection.json).
4. Run the **`Register`** or **`Login`** request in the **Authentication** folder.
5. The collection automatically extracts your JWT `accessToken` and saves it to collection variables, allowing all subsequent endpoints to run seamlessly!

---

## ❓ Troubleshooting & FAQs

### 1. MongoDB Connection Error (`MongooseServerSelectionError`)
- Check your IP Whitelist on MongoDB Atlas (`Network Access` $\rightarrow$ `Add IP Address` $\rightarrow$ `Allow Access from Anywhere 0.0.0.0/0`).
- Ensure the connection string in `server/.env` includes your database password.

### 2. Redis Connection Warning / Fallback
- If Upstash Redis is unreachable or credentials are missing, the server will log a warning and fall back directly to MongoDB without crashing.

### 3. Port Conflict (`EADDRINUSE: 3001`)
- If port `3001` is already in use by another process, change `PORT=3002` in `server/.env` and update `VITE_API_URL=http://localhost:3002` in `client/.env`.
