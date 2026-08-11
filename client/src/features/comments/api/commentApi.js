// src/features/comments/api/commentApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    // Get Comments for a Task
    getComments: builder.query({
      query: ({ projectId, taskId, organizationId }) => {
        const query = organizationId ? `?organizationId=${organizationId}` : "";
        return `/projects/${projectId}/tasks/${taskId}/comments${query}`;
      },
      providesTags: ["Comment"],
    }),

    // Create Comment
    createComment: builder.mutation({
      query: ({ projectId, taskId, content, organizationId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments`,
        method: "POST",
        body: { content, organizationId },
      }),
      invalidatesTags: ["Comment"],
    }),

    // Update Comment
    updateComment: builder.mutation({
      query: ({ projectId, taskId, commentId, content, organizationId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        method: "PUT",
        body: { content, organizationId },
      }),
      invalidatesTags: ["Comment"],
    }),

    // Delete Comment
    deleteComment: builder.mutation({
      query: ({ projectId, taskId, commentId, organizationId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments/${commentId}${organizationId ? `?organizationId=${organizationId}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
