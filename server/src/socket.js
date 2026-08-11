const { Server } = require("socket.io");
const { verifyAccessToken } = require("./utils/jwt");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user?.userId})`);

    if (socket.user?.userId) {
      socket.join(`user_${socket.user.userId}`);
    }

    socket.on("join:organization", (organizationId) => {
      if (organizationId) {
        socket.join(`org_${organizationId}`);
      }
    });

    socket.on("leave:organization", (organizationId) => {
      if (organizationId) {
        socket.leave(`org_${organizationId}`);
      }
    });

    socket.on("join:project", (projectId) => {
      if (projectId) {
        socket.join(`project_${projectId}`);
      }
    });

    socket.on("leave:project", (projectId) => {
      if (projectId) {
        socket.leave(`project_${projectId}`);
      }
    });

    socket.on("join:task", (taskId) => {
      if (taskId) {
        socket.join(`task_${taskId}`);
      }
    });

    socket.on("leave:task", (taskId) => {
      if (taskId) {
        socket.leave(`task_${taskId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId.toString()}`).emit(event, data);
  }
};

const emitToProject = (projectId, event, data) => {
  if (io && projectId) {
    io.to(`project_${projectId.toString()}`).emit(event, data);
  }
};

const emitToOrganization = (organizationId, event, data) => {
  if (io && organizationId) {
    io.to(`org_${organizationId.toString()}`).emit(event, data);
  }
};

const emitToTask = (taskId, event, data) => {
  if (io && taskId) {
    io.to(`task_${taskId.toString()}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToProject,
  emitToOrganization,
  emitToTask,
};
