// src/app/store.js

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";

// RTK Query APIs
import { authApi } from "../features/auth/api/authApi";
// import { organizationApi } from "../features/organizations/api/organizationApi";
// import { projectApi } from "../features/projects/api/projectApi";
// import { taskApi } from "../features/tasks/api/taskApi";
// import { commentApi } from "../features/comments/api/commentApi";
// import { activityApi } from "../features/activity/api/activityApi";
// import { dashboardApi } from "../features/dashboard/api/dashboardApi";

export const store = configureStore({
  reducer: {
    // Redux slices
    auth: authReducer,

    // RTK Query
    [authApi.reducerPath]: authApi.reducer,

    // Add other API reducers as you create them
    // [organizationApi.reducerPath]: organizationApi.reducer,
    // [projectApi.reducerPath]: projectApi.reducer,
    // [taskApi.reducerPath]: taskApi.reducer,
    // [commentApi.reducerPath]: commentApi.reducer,
    // [activityApi.reducerPath]: activityApi.reducer,
    // [dashboardApi.reducerPath]: dashboardApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,

      // Add other API middleware here
      // organizationApi.middleware,
      // projectApi.middleware,
      // taskApi.middleware,
      // commentApi.middleware,
      // activityApi.middleware,
      // dashboardApi.middleware,
    ),

  devTools: import.meta.env.DEV,
});

export default store;
