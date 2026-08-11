// src/features/projects/api/projectApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Project", "ProjectDetail", "ProjectMembers"],
  endpoints: (builder) => ({
    // Get All Projects
    getProjects: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.organizationId) queryParams.append("organizationId", params.organizationId);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.status) queryParams.append("status", params.status);
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.search) queryParams.append("search", params.search);
        return `/projects?${queryParams.toString()}`;
      },
      providesTags: ["Project"],
    }),

    // Get Single Project
    getProject: builder.query({
      query: ({ projectId, organizationId }) => {
        const query = organizationId ? `?organizationId=${organizationId}` : "";
        return `/projects/${projectId}${query}`;
      },
      providesTags: (result, error, { projectId }) => [
        { type: "ProjectDetail", id: projectId },
      ],
    }),

    // Create Project
    createProject: builder.mutation({
      query: (data) => ({
        url: "/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Update Project
    updateProject: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        "Project",
        { type: "ProjectDetail", id: projectId },
      ],
    }),

    // Archive Project
    archiveProject: builder.mutation({
      query: ({ projectId, organizationId }) => ({
        url: `/projects/${projectId}${organizationId ? `?organizationId=${organizationId}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // Get Project Members
    getProjectMembers: builder.query({
      query: ({ projectId, organizationId }) => {
        const query = organizationId ? `?organizationId=${organizationId}` : "";
        return `/projects/${projectId}/members${query}`;
      },
      providesTags: (result, error, { projectId }) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),

    // Add Project Member
    addProjectMember: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/projects/${projectId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),

    // Update Project Member Role
    updateProjectMemberRole: builder.mutation({
      query: ({ projectId, userId, role, organizationId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: "PATCH",
        body: { role, organizationId },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),

    // Remove Project Member
    removeProjectMember: builder.mutation({
      query: ({ projectId, userId, organizationId }) => ({
        url: `/projects/${projectId}/members/${userId}${organizationId ? `?organizationId=${organizationId}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useRemoveProjectMemberMutation,
} = projectApi;
