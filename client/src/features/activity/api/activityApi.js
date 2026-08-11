// src/features/activity/api/activityApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const activityApi = createApi({
  reducerPath: "activityApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ActivityLog"],
  endpoints: (builder) => ({
    // Get Project & Task Activity History
    getProjectActivity: builder.query({
      query: ({ projectId, organizationId, taskId, page = 1, limit = 20 }) => {
        const queryParams = new URLSearchParams();
        if (organizationId) queryParams.append("organizationId", organizationId);
        if (taskId) queryParams.append("taskId", taskId);
        queryParams.append("page", page);
        queryParams.append("limit", limit);
        return `/projects/${projectId}/activity?${queryParams.toString()}`;
      },
      providesTags: ["ActivityLog"],
    }),

    // Get Task Activity History (Consolidated)
    getTaskActivity: builder.query({
      query: ({ projectId, taskId, organizationId, page = 1, limit = 20 }) => {
        const queryParams = new URLSearchParams();
        if (organizationId) queryParams.append("organizationId", organizationId);
        if (taskId) queryParams.append("taskId", taskId);
        queryParams.append("page", page);
        queryParams.append("limit", limit);
        return `/projects/${projectId}/activity?${queryParams.toString()}`;
      },
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const {
  useGetProjectActivityQuery,
  useGetTaskActivityQuery,
} = activityApi;
