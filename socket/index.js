import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const io = new Server({
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
});

let onlineUsers = [];

const addUser = (username, firstname, lastname, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, firstname, lastname, socketId });
};

const deleteUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("newUser", (username, firstname, lastname) => {
    addUser(socket.id, username, firstname, lastname);
    console.log("New user added", onlineUsers);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    console.log("receiver", receiver);
    io.to(receiver?.socketId).emit("getNotification", {
      senderName,
      type,
    });
  });

  socket.on("disconnect", () => {
    deleteUser(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
io.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
