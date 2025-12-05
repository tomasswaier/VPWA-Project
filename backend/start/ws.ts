import GroupController from "#controllers/group_controller";
import MessagesController from "#controllers/messages_controller";
import GroupUser from "#models/group_user";
import GroupUserInvitation from "#models/group_user_invitation";
import User from "#models/user";
import {Secret} from "@adonisjs/core/helpers";
import app from "@adonisjs/core/services/app";
import server from "@adonisjs/core/services/server";
import {Server, Socket} from "socket.io";

app.ready(() => {
  console.info("WS is running");

  const io = new Server(server.getNodeServer(), {
    cors : {origin : "*"},
  });

  io.of(/^\/groups\/.+$/).on("connection", async (socket: Socket) => {
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

      socket.on(
          "inviteUser",
          async (data: {username: string}, callback: (res: any) => void) => {
            try {
              const {username} = data;
              const target = await User.findBy("username", username);
              if (!target) {
                return callback({error : "Bad userName"});
              }

              const response = await GroupController.invite(
                  String(userId),
                  target,
                  String(groupId),
              );
              io.of("/user").to(`user:${target.id}`).emit("invited", {
                groupId,
                inviterId : userId,
              });

              callback(
                  response,
              );
            } catch (err) {
              console.error("Failed to invite user:", err);

              callback({error : "Failed to send invitation"});
            }
          },
      );

      socket.on("sendMessage", async (data: {content: string}, callback) => {
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
              const containsMention =
                  firstWord.startsWith("@") &&
                  firstWord.substring(1) === clientUser.username;

              clientSocket.emit("message", {
                ...message,
                containsMention : containsMention,
              });
            }
          }

          callback(message);
        } catch (err) {
          console.error(err);
          callback({error : "Failed to send message"});
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
              id : msg.id,
              content : msg.contents,
              author : msg.user ? msg.user.username : "Unknown",
              containsMention : containsMention,
              groupId : msg.groupId,
            };
          });

          callback({
            data : serializedMessages,
            meta : messages.getMeta(),
          });
        } catch (err) {
          console.error(err);
          callback({error : "Failed to load messages"});
        }
      });

      socket.on(
          "voteKick",
          async (
              data: {username: string},
              callback: (response: any) => void,
              ) => {
            try {
              if (!data.username) {
                return callback({error : "Missing username"});
              }

              // Find user by username
              const targetUser = await User.query()
                                     .where(
                                         "username",
                                         data.username,
                                         )
                                     .first();

              if (!targetUser) {
                return callback({error : "User not found"});
              }

              const result = await GroupController.voteKick({
                groupId : groupId!,
                userTargetId : targetUser.id.toString(),
                userCasterId : userId.toString(),
              });

              if (result.banned) {
                console.log(targetUser.id);
                io.of("/user").to(`user:${targetUser.id}`).emit("kicked", {
                  groupId,
                  message : `You have been banned from group "${groupId}"`,
                });
              } else {
                callback({error : result.message});
              }

              callback(result);
            } catch (err) {
              console.error(err);
              callback({error : "Failed to process vote kick"});
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

  global.notifyGroupDeletion = (groupId: string) => {
    io.of(`/groups/${groupId}`).emit("groupDeleted", {groupId});
  };
});
