import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import RoleRoute from "../routes/RoleRoute";

import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy-loaded page components for route-level code-splitting
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const ProjectsPage = lazy(() => import("../features/projects/pages/ProjectsPage"));
const ProjectDetailsPage = lazy(() => import("../features/projects/pages/ProjectDetailsPage"));
const TasksPage = lazy(() => import("../features/tasks/pages/TasksPage"));
const TaskDetailsPage = lazy(() => import("../features/tasks/pages/TaskDetailsPage"));
const KanbanPage = lazy(() => import("../features/tasks/pages/KanbanPage"));
const OrganizationsPage = lazy(() => import("../features/organizations/pages/OrganizationsPage"));
const OrganizationDetailsPage = lazy(() => import("../features/organizations/pages/OrganizationDetailsPage"));
const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));

// Suspense Fallback Wrapper
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner label="Loading page..." minHeight="60vh" />}>
    <Component {...props} />
  </Suspense>
);

const LazyLoginPage = Loadable(LoginPage);
const LazyRegisterPage = Loadable(RegisterPage);
const LazyDashboardPage = Loadable(DashboardPage);
const LazyProjectsPage = Loadable(ProjectsPage);
const LazyProjectDetailsPage = Loadable(ProjectDetailsPage);
const LazyTasksPage = Loadable(TasksPage);
const LazyTaskDetailsPage = Loadable(TaskDetailsPage);
const LazyKanbanPage = Loadable(KanbanPage);
const LazyOrganizationsPage = Loadable(OrganizationsPage);
const LazyOrganizationDetailsPage = Loadable(OrganizationDetailsPage);
const LazyProfilePage = Loadable(ProfilePage);
const LazyUnauthorizedPage = Loadable(UnauthorizedPage);

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
            element: <LazyLoginPage />,
          },
          {
            path: "/register",
            element: <LazyRegisterPage />,
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
            element: <LazyDashboardPage />,
          },

          // Organizations
          {
            path: "/organizations",
            element: <LazyOrganizationsPage />,
          },

          {
            path: "/organizations/:organizationId",
            element: <LazyOrganizationDetailsPage />,
          },

          // Projects
          {
            path: "/projects",
            element: <LazyProjectsPage />,
          },

          {
            path: "/projects/:projectId",
            element: <LazyProjectDetailsPage />,
          },

          // Tasks
          {
            path: "/tasks",
            element: <LazyTasksPage />,
          },

          {
            path: "/tasks/:taskId",
            element: <LazyTaskDetailsPage />,
          },

          {
            path: "/projects/:projectId/tasks/:taskId",
            element: <LazyTaskDetailsPage />,
          },

          {
            path: "/projects/:projectId/board",
            element: <LazyKanbanPage />,
          },

          // Profile
          {
            path: "/profile",
            element: <LazyProfilePage />,
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
                element: <LazyOrganizationDetailsPage />,
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
                element: <LazyProjectDetailsPage />,
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
    element: <LazyUnauthorizedPage />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);