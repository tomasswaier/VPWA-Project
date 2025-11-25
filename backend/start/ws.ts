import MessagesController from "#controllers/messages_controller";
import GroupUser from "#models/group_user";
import User from "#models/user";
import { Secret } from "@adonisjs/core/helpers";
import app from "@adonisjs/core/services/app";
import server from "@adonisjs/core/services/server";
import { Server, Socket } from "socket.io";

app.ready(() => {
  console.log("WS is running");

  const io = new Server(server.getNodeServer(), {
    cors: { origin: "*" },
  });

  // Handle all namespaces that start with /groups/
  io.of(/^\/groups\/.+$/).on("connection", async (socket) => {
    // Extract groupId from namespace
    const namespace = socket.nsp.name; // e.g. "/groups/123"
    const groupId = namespace.split("/").pop();

    console.log(`New connection to group ${groupId}: ${socket.id}`);

    // Authenticate user
    try {
      const token = socket.handshake.auth?.token;
      if (!token || token === "") {
        return socket.disconnect(true);
      }
      const secret = new Secret(token);
      const tokenRecord = await User.accessTokens.verify(secret);
      if (!tokenRecord) {
        return socket.disconnect(true);
      }

      const userId = tokenRecord.tokenableId;
      socket.data.userId = userId;

      // Check membership before allowing messages
      const membership = await GroupUser.query()
        .where("group_id", groupId!)
        .andWhere("user_id", userId.toString())
        .first();

      if (!membership) {
        return socket.disconnect(true);
      }

      // Handle sending messages
      socket.on("sendMessage", async (data: { content: string }, callback) => {
        try {
          const message = await MessagesController.sendMessage(
            userId.toString(),
            groupId!,
            data.content,
          );

          // Broadcast to all sockets in this namespace
          socket.nsp.emit("message", message);

          callback(message);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to send message" });
        }
      });

      // Handle loading messages
      socket.on("loadMessages", async (page: number, callback) => {
        try {
          const messages = await MessagesController.loadMessages(
            groupId!,
            page,
          );
          callback(messages);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to load messages" });
        }
      });
    } catch (err) {
      console.error("Socket auth error:", err);
      return socket.disconnect(true);
    }
  });
});
