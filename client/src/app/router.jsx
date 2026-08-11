// src/app/router.jsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import RoleRoute from "../routes/RoleRoute";

import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import DashboardPage from "../features/dashboard/pages/DashboardPage";

import ProjectsPage from "../features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage";

import TasksPage from "../features/tasks/pages/TasksPage";
import TaskDetailsPage from "../features/tasks/pages/TaskDetailsPage";
import KanbanPage from "../features/tasks/pages/KanbanPage";

import OrganizationsPage from "../features/organizations/pages/OrganizationsPage";
import OrganizationDetailsPage from "../features/organizations/pages/OrganizationDetailsPage";

import ProfilePage from "../features/profile/pages/ProfilePage";

import UnauthorizedPage from "../pages/UnauthorizedPage";

export const router = createBrowserRouter([
  // Root Redirect
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // =========================
  // PUBLIC ROUTES
  // =========================

  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // =========================
  // PROTECTED ROUTES
  // =========================

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },

          // Organizations
          {
            path: "/organizations",
            element: <OrganizationsPage />,
          },

          {
            path: "/organizations/:organizationId",
            element: <OrganizationDetailsPage />,
          },

          // Projects
          {
            path: "/projects",
            element: <ProjectsPage />,
          },

          {
            path: "/projects/:projectId",
            element: <ProjectDetailsPage />,
          },

          // Tasks
          {
            path: "/tasks",
            element: <TasksPage />,
          },

          {
            path: "/tasks/:taskId",
            element: <TaskDetailsPage />,
          },

          {
            path: "/projects/:projectId/tasks/:taskId",
            element: <TaskDetailsPage />,
          },

          {
            path: "/projects/:projectId/board",
            element: <KanbanPage />,
          },

          // Profile
          {
            path: "/profile",
            element: <ProfilePage />,
          },

          // =========================
          // ROLE BASED ROUTES
          // =========================

          {
            element: (
              <RoleRoute
                allowedRoles={["OWNER", "ADMIN"]}
              />
            ),
            children: [
              {
                path: "/organizations/:organizationId/members",
                element: <OrganizationDetailsPage />,
              },
            ],
          },

          {
            element: (
              <RoleRoute
                allowedRoles={[
                  "OWNER",
                  "ADMIN",
                  "MANAGER",
                ]}
              />
            ),
            children: [
              {
                path: "/projects/:projectId/manage",
                element: <ProjectDetailsPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================
  // UNAUTHORIZED & CATCH-ALL
  // =========================

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);