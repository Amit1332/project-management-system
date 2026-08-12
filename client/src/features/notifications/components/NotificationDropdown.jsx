// client/src/features/notifications/components/NotificationDropdown.jsx

import React, { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import { Bell, CheckCheck, MessageSquare, CheckSquare, Sparkles, Trash2 } from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "../api/notificationApi";
import { getSocket, onSocketEvent } from "../../../services/socket";
import { formatDate } from "../../../utils/formatDate";

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { data: countData, refetch: refetchCount } = useGetUnreadCountQuery();
  const { data: listData, isLoading, refetch: refetchList } = useGetNotificationsQuery({ limit: 15 });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const unreadCount =
    typeof countData?.data === "number"
      ? countData.data
      : typeof countData?.data?.count === "number"
      ? countData.data.count
      : 0;

  const rawNotifications = listData?.data?.notifications || listData?.data;
  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];

  useEffect(() => {
    const unsubscribe = onSocketEvent("notification:received", () => {
      refetchCount();
      refetchList();
    });
    return () => {
      unsubscribe();
    };
  }, [refetchCount, refetchList]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    refetchList();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (e) {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case "USER_MENTIONED":
      case "COMMENT_ADDED":
        return <MessageSquare size={17} color="#4F46E5" />;
      case "TASK_ASSIGNED":
      case "TASK_STATUS_CHANGED":
        return <CheckSquare size={17} color="#059669" />;
      default:
        return <Sparkles size={17} color="#D97706" />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          width: 38,
          height: 38,
          borderRadius: 2.5,
          boxShadow: "0 2px 4px rgba(15, 23, 42, 0.04)",
          "&:hover": { bgcolor: "#EEF2FF", borderColor: "#4F46E5" },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Bell size={18} color="#475569" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxHeight: 520,
              mt: 1.5,
              p: 2.5,
              borderRadius: 3.5,
              border: "1px solid #E2E8F0",
              boxShadow: "0 16px 40px -4px rgba(15, 23, 42, 0.16)",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header Modal Bar - Strict Horizontal Row (Notifications + Count Chip on Left, Mark All Read on Far Right) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
            paddingBottom: "12px",
            marginBottom: "12px",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  bgcolor: "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  height: 20,
                  borderRadius: 1.5,
                }}
              />
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckCheck size={14} />}
              onClick={handleMarkAllRead}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, px: 1, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={4} px={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#F1F5F9",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Bell size={24} color="#94A3B8" />
            </Box>
            <Typography variant="subtitle2" color="#0F172A" fontWeight={700} mb={0.5}>
              No notifications yet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.5}>
              You're all caught up! New task updates and mentions will appear here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 420, overflowY: "auto" }}>
            {notifications.map((item) => (
              <React.Fragment key={item._id}>
                <ListItem
                  onClick={() => handleMarkRead(item._id)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2.5,
                    mb: 1,
                    bgcolor: item.isRead ? "transparent" : "#F0F4FF",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: item.isRead ? "#F8FAFC" : "#EEF2FF",
                    },
                  }}
                  secondaryAction={
                    <Tooltip title="Delete notification">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleDelete(e, item._id)}
                        sx={{ color: "#94A3B8", "&:hover": { color: "#DC2626" } }}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      {getIcon(item.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={item.isRead ? 600 : 800}
                        color="#0F172A"
                        sx={{ pr: 2 }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" display="block" mt={0.3}>
                        <Typography
                          component="span"
                          variant="caption"
                          color="#475569"
                          display="block"
                          sx={{
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            pr: 2,
                          }}
                        >
                          {item.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="#94A3B8"
                          fontSize="0.7rem"
                          fontWeight={600}
                          mt={0.3}
                          display="block"
                        >
                          {formatDate(item.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;
