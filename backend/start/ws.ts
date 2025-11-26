import GroupController from "#controllers/group_controller";
import MessagesController from "#controllers/messages_controller";
import GroupUser from "#models/group_user";
import GroupUserInvitation from "#models/group_user_invitation";
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

  io.of(/^\/groups\/.+$/).on("connection", async (socket: Socket) => {
    const namespace = socket.nsp.name; // e.g. "/groups/123"
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

      // Check group membership
      const membership = await GroupUser.query()
        .where("group_id", groupId!)
        .andWhere("user_id", userId.toString())
        .first();
      if (!membership) {
        return socket.disconnect(true);
      }

      socket.on(
        "inviteUser",
        async (data: { username: string }, callback: (res: any) => void) => {
          try {
            const { username } = data;

            const targetUser = await User.query().where("username", username)
              .first();
            if (!targetUser) {
              return callback({ error: `User "${username}" not found` });
            }

            await GroupUserInvitation.create({
              userId: targetUser.id,
              groupId,
            });

            io.of("/user").to(`user:${targetUser.id}`).emit("invited", {
              groupId,
              inviterId: userId,
            });

            callback(
              { success: true, message: `Invitation sent to ${username}` },
            );
          } catch (err) {
            console.error("Failed to invite user:", err);
            callback({ error: "Failed to send invitation" });
          }
        },
      );

      socket.on("sendMessage", async (data: { content: string }, callback) => {
        try {
          const message = await MessagesController.sendMessage(
            userId.toString(),
            groupId!,
            data.content,
          );

          socket.nsp.emit("message", message);

          callback(message);
        } catch (err) {
          console.error(err);
          callback({ error: "Failed to send message" });
        }
      });

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

      socket.on(
        "voteKick",
        async (data: { userTargetId: string }, callback) => {
          try {
            const result = await GroupController.voteKickInternal({
              groupId: groupId!,
              userTargetId: data.userTargetId,
              userCasterId: userId.toString(),
            });

            if (result.banned) {
              io.to(`user:${data.userTargetId}`).emit("kicked", {
                groupId,
                message: "You have been banned from this group",
              });
            }

            callback(result);
          } catch (err) {
            console.error(err);
            callback({ error: "Failed to vote kick" });
          }
        },
      );
    } catch (err) {
      console.error("Socket auth error:", err);
      socket.disconnect(true);
    }
  });

  io.of("/user").on("connection", async (socket: Socket) => {
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

      socket.join(`user:${userId}`);

      if (process.env.NODE_ENV === "development") {
        console.info(`User ${userId} connected to private notifications`);
      }

      socket.on("ackNotification", (notificationId: string) => {
        console.log(
          `User ${userId} acknowledged notification ${notificationId}`,
        );
      });
    } catch (err) {
      console.error("Private socket auth error:", err);
      socket.disconnect(true);
    }
  });
});
