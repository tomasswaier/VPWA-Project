import MessagesController from "#controllers/messages_controller";
import GroupUser from "#models/group_user";
import app from "@adonisjs/core/services/app";
import server from "@adonisjs/core/services/server";
import { Server, Socket } from "socket.io";

app.ready(() => {
  console.log("WS is running");
  const io = new Server(server.getNodeServer(), {
    cors: {
      origin: "*",
    },
  });

  const groupsNamespace = io.of("/groups");

  groupsNamespace.on("connection", async (socket: Socket) => {
    console.log("New connection:", socket.id);

    socket.on(
      "joinGroup",
      async (groupId: string, callback: (response: any) => void) => {
        try {
          console.log("im on");
          const userId = socket.data.userId;
          const membership = await GroupUser.query()
            .where("group_id", groupId)
            .andWhere("user_id", userId)
            .first();

          if (!membership) {
            return callback({ error: "Not a member of this group" });
          }

          // Join room for this group
          socket.join(`group:${groupId}`);
          callback({ success: true });
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to join group" });
        }
      },
    );

    // Listen to send message
    socket.on(
      "sendMessage",
      async (
        data: { groupId: string; content: string },
        callback: (msg: any) => void,
      ) => {
        try {
          const { groupId, content } = data;
          const userId = socket.data.userId;

          const membership = await GroupUser.query()
            .where("group_id", groupId)
            .andWhere("user_id", userId)
            .first();
          if (!membership) {
            return callback({ error: "Not a member of this group" });
          }

          const message = await MessagesController.sendMessage(
            userId,
            groupId,
            content,
          );

          // Broadcast to all members in the room
          groupsNamespace.to(`group:${groupId}`).emit("message", message);

          // Return to sender
          callback(message);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to send message" });
        }
      },
    );

    // Listen to load messages
    socket.on(
      "loadMessages",
      async (
        groupId: string,
        page: number,
        callback: (messages: any) => void,
      ) => {
        try {
          console.log("im on");
          const userId = socket.data.userId;

          const membership = await GroupUser.query()
            .where("group_id", groupId)
            .andWhere("user_id", userId)
            .first();

          if (!membership) {
            return callback({ error: "Not a member of this group" });
          }

          const messages = await MessagesController.loadMessages(groupId, page);
          callback(messages);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to load messages" });
        }
      },
    );
  });
});
