// src/utils/formatDate.js

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (date, format = "DD MMM YYYY") => {
  if (!date) {
    return "-";
  }

  const parsedDate = dayjs(date);

  if (!parsedDate.isValid()) {
    return "-";
  }

  return parsedDate.format(format);
};

export const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = dayjs(date);

  if (!parsedDate.isValid()) {
    return "-";
  }

  return parsedDate.format("DD MMM YYYY, hh:mm A");
};

export const formatTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = dayjs(date);

  if (!parsedDate.isValid()) {
    return "-";
  }

  return parsedDate.format("hh:mm A");
};

export const formatRelativeDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = dayjs(date);

  if (!parsedDate.isValid()) {
    return "-";
  }

  return parsedDate.fromNow();
};
