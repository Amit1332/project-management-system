// src/constants/priorities.js

export const PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: "Low",
  [PRIORITIES.MEDIUM]: "Medium",
  [PRIORITIES.HIGH]: "High",
  [PRIORITIES.CRITICAL]: "Critical",
};

export const PRIORITY_OPTIONS = [
  {
    value: PRIORITIES.LOW,
    label: PRIORITY_LABELS[PRIORITIES.LOW],
  },
  {
    value: PRIORITIES.MEDIUM,
    label: PRIORITY_LABELS[PRIORITIES.MEDIUM],
  },
  {
    value: PRIORITIES.HIGH,
    label: PRIORITY_LABELS[PRIORITIES.HIGH],
  },
  {
    value: PRIORITIES.CRITICAL,
    label: PRIORITY_LABELS[PRIORITIES.CRITICAL],
  },
];
