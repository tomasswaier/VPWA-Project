import MessagesController from "#controllers/messages_controller";
import GroupUser from "#models/group_user";
import User from "#models/user";
import { Secret } from "@adonisjs/core/helpers";
import app from "@adonisjs/core/services/app";
import server from "@adonisjs/core/services/server";
import { Server, Socket } from "socket.io";

app.ready(() => {
  console.info("WS is running");

  const io = new Server(server.getNodeServer(), {
    cors: { origin: "*" },
  });

  io.of(/^\/groups\/.+$/).on("connection", async (socket) => {
    const namespace = socket.nsp.name;
    const groupId = namespace.split("/").pop();

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

      const membership = await GroupUser.query()
        .where("group_id", groupId!)
        .andWhere("user_id", userId.toString())
        .first();

      if (!membership) {
        return socket.disconnect(true);
      }

      socket.on("sendMessage", async (data: { content: string }, callback) => {
        try {
          const message = await MessagesController.sendMessage(
            userId.toString(),
            groupId!,
            data.content,
          );

          const allSockets = await socket.nsp.fetchSockets();
          
          for (const clientSocket of allSockets) {
            const clientUserId = clientSocket.data.userId;
            const clientUser = await User.find(clientUserId);
            
            if (clientUser) {
              const words = data.content.trim().split(/\s+/);
              const firstWord = words[0] || "";
              const containsMention = firstWord.startsWith("@") && 
                                     firstWord.substring(1) === clientUser.username;
              
              clientSocket.emit("message", {
                ...message,
                containsMention: containsMention,
              });
            }
          }

          callback(message);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to send message" });
        }
      });

      socket.on("loadMessages", async (page: number, callback) => {
        try {
          const user = await User.find(userId);
          const messages = await MessagesController.loadMessages(
            groupId!,
            page,
          );

          const serializedMessages = messages.all().map((msg: any) => {
            const words = msg.contents.trim().split(/\s+/);
            const firstWord = words[0] || "";
            const containsMention = user && firstWord.startsWith("@") && 
                                   firstWord.substring(1) === user.username;

            return {
              id: msg.id,
              content: msg.contents,
              author: msg.user ? msg.user.username : "Unknown",
              containsMention: containsMention,
              groupId: msg.groupId,
            };
          });

          callback({
            data: serializedMessages,
            meta: messages.getMeta(),
          });
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to load messages" });
        }
      });

      socket.on("voteKick", async (page: number, callback) => {
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

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected from group ${groupId}`);
      });
    } catch (err) {
      console.error("Socket auth error:", err);
      return socket.disconnect(true);
    }
  });

  global.notifyGroupDeletion = (groupId: string) => {
    io.of(`/groups/${groupId}`).emit("groupDeleted", { groupId });
  };
});