// client/src/features/analytics/api/analyticsApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: ({ organizationId, projectId }) => {
        let url = `/analytics/dashboard?organizationId=${organizationId}`;
        if (projectId) {
          url += `&projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery } = analyticsApi;
