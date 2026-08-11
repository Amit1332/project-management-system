// src/constants/status.js

// ================================
// PROJECT STATUS
// ================================

export const PROJECT_STATUS = {
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: "Planning",
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.ON_HOLD]: "On Hold",
  [PROJECT_STATUS.COMPLETED]: "Completed",
  [PROJECT_STATUS.ARCHIVED]: "Archived",
};

export const PROJECT_STATUS_OPTIONS = [
  {
    value: PROJECT_STATUS.PLANNING,
    label: PROJECT_STATUS_LABELS[PROJECT_STATUS.PLANNING],
  },
  {
    value: PROJECT_STATUS.ACTIVE,
    label: PROJECT_STATUS_LABELS[PROJECT_STATUS.ACTIVE],
  },
  {
    value: PROJECT_STATUS.ON_HOLD,
    label: PROJECT_STATUS_LABELS[PROJECT_STATUS.ON_HOLD],
  },
  {
    value: PROJECT_STATUS.COMPLETED,
    label: PROJECT_STATUS_LABELS[PROJECT_STATUS.COMPLETED],
  },
  {
    value: PROJECT_STATUS.ARCHIVED,
    label: PROJECT_STATUS_LABELS[PROJECT_STATUS.ARCHIVED],
  },
];

// ================================
// TASK STATUS
// ================================

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: "To Do",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.IN_REVIEW]: "In Review",
  [TASK_STATUS.COMPLETED]: "Completed",
};

export const TASK_STATUS_OPTIONS = [
  {
    value: TASK_STATUS.TODO,
    label: TASK_STATUS_LABELS[TASK_STATUS.TODO],
  },
  {
    value: TASK_STATUS.IN_PROGRESS,
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
  },
  {
    value: TASK_STATUS.IN_REVIEW,
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_REVIEW],
  },
  {
    value: TASK_STATUS.COMPLETED,
    label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED],
  },
];

export const KANBAN_COLUMNS = [
  {
    id: TASK_STATUS.TODO,
    title: "To Do",
  },
  {
    id: TASK_STATUS.IN_PROGRESS,
    title: "In Progress",
  },
  {
    id: TASK_STATUS.IN_REVIEW,
    title: "In Review",
  },
  {
    id: TASK_STATUS.COMPLETED,
    title: "Completed",
  },
];
