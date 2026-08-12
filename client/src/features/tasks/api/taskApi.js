// src/features/tasks/api/taskApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task", "KanbanTasks", "TaskDetail"],
  endpoints: (builder) => ({
    // Get Tasks List
    getTasks: builder.query({
      query: ({ projectId, ...params }) => {
        const queryParams = new URLSearchParams();
        if (projectId) queryParams.append("projectId", projectId);
        if (params.organizationId) queryParams.append("organizationId", params.organizationId);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.status) queryParams.append("status", params.status);
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.assigneeId) queryParams.append("assigneeId", params.assigneeId);
        if (params.search) queryParams.append("search", params.search);
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        return `/tasks?${queryParams.toString()}`;
      },
      providesTags: ["Task"],
    }),

    // Get Kanban Tasks
    getKanbanTasks: builder.query({
      query: ({ projectId, organizationId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (organizationId) params.append("organizationId", organizationId);
        const query = params.toString() ? `?${params.toString()}` : "";
        return `/tasks/kanban${query}`;
      },
      providesTags: ["KanbanTasks"],
    }),

    // Get Single Task Detail
    getTask: builder.query({
      query: ({ taskId, organizationId, projectId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (organizationId) params.append("organizationId", organizationId);
        const query = params.toString() ? `?${params.toString()}` : "";
        return `/tasks/${taskId}${query}`;
      },
      providesTags: (result, error, { taskId }) => [{ type: "TaskDetail", id: taskId }],
    }),

    // Create Task
    createTask: builder.mutation({
      query: ({ ...data }) => ({
        url: `/tasks`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Task", "KanbanTasks"],
    }),

    // Update Task
    updateTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: `/tasks/${taskId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        "Task",
        "KanbanTasks",
        { type: "TaskDetail", id: taskId },
      ],
    }),

    // Archive Task
    archiveTask: builder.mutation({
      query: ({ taskId, organizationId, projectId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (organizationId) params.append("organizationId", organizationId);
        const query = params.toString() ? `?${params.toString()}` : "";
        return {
          url: `/tasks/${taskId}${query}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Task", "KanbanTasks"],
    }),

    // Change Task Status (Used in Kanban)
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status, organizationId, projectId }) => ({
        url: `/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status, organizationId, projectId },
      }),
      async onQueryStarted({ taskId, status, organizationId, projectId }, { dispatch, queryFulfilled }) {
        const patchTaskDetail = dispatch(
          taskApi.util.updateQueryData("getTask", { taskId, organizationId, projectId }, (draft) => {
            if (draft?.data) {
              draft.data.status = status;
            }
          })
        );

        const patchKanban = dispatch(
          taskApi.util.updateQueryData("getKanbanTasks", { projectId, organizationId }, (draft) => {
            if (draft?.data) {
              let movedTask = null;
              Object.keys(draft.data).forEach((col) => {
                if (Array.isArray(draft.data[col])) {
                  const idx = draft.data[col].findIndex((t) => (t._id || t) === taskId);
                  if (idx !== -1) {
                    movedTask = { ...draft.data[col][idx] };
                    draft.data[col].splice(idx, 1);
                  }
                }
              });
              if (movedTask) {
                movedTask.status = status;
                if (!draft.data[status]) draft.data[status] = [];
                draft.data[status].unshift(movedTask);
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchTaskDetail.undo();
          patchKanban.undo();
        }
      },
      invalidatesTags: (result, error, { taskId }) => [
        "Task",
        "KanbanTasks",
        { type: "TaskDetail", id: taskId },
      ],
    }),

    // Change Task Priority
    updateTaskPriority: builder.mutation({
      query: ({ taskId, priority, organizationId, projectId }) => ({
        url: `/tasks/${taskId}/priority`,
        method: "PATCH",
        body: { priority, organizationId, projectId },
      }),
      async onQueryStarted({ taskId, priority, organizationId, projectId }, { dispatch, queryFulfilled }) {
        const patchTaskDetail = dispatch(
          taskApi.util.updateQueryData("getTask", { taskId, organizationId, projectId }, (draft) => {
            if (draft?.data) {
              draft.data.priority = priority;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchTaskDetail.undo();
        }
      },
      invalidatesTags: (result, error, { taskId }) => [
        "Task",
        "KanbanTasks",
        { type: "TaskDetail", id: taskId },
      ],
    }),

    // Change Task Assignee
    updateTaskAssignee: builder.mutation({
      query: ({ taskId, assigneeId, organizationId, projectId }) => ({
        url: `/tasks/${taskId}/assignee`,
        method: "PATCH",
        body: { assigneeId, organizationId, projectId },
      }),
      async onQueryStarted({ taskId, assigneeId, organizationId, projectId }, { dispatch, queryFulfilled }) {
        const patchTaskDetail = dispatch(
          taskApi.util.updateQueryData("getTask", { taskId, organizationId, projectId }, (draft) => {
            if (draft?.data) {
              draft.data.assigneeId = assigneeId;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchTaskDetail.undo();
        }
      },
      invalidatesTags: (result, error, { taskId }) => [
        "Task",
        "KanbanTasks",
        { type: "TaskDetail", id: taskId },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetKanbanTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useArchiveTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskAssigneeMutation,
} = taskApi;
