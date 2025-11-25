import GroupUser from "#models/group_user";
import Message from "#models/message";
import type { HttpContext } from "@adonisjs/core/http";

export default class MessagesController {
  async index({ request, params, auth, response }: HttpContext) {
    const user = auth.use("access_tokens").user;
    if (!user) {
      return response.unauthorized({ message: "Not logged in" });
    }

    const membership = await GroupUser.query()
      .where("userId", user.id)
      .andWhere("groupId", params.groupId)
      .first();

    if (!membership) {
      return response.forbidden(
        { message: "You are not a member of this group" },
      );
    }

    const page = Number(request.input("page", 1));
    const perPage = 20;

    const messages = await Message.query()
      .where("groupId", params.groupId)
      .preload("user", (q) => q.select("username"))
      .orderBy("createdAt", "desc")
      .offset((page - 1) * perPage)
      .limit(perPage);

    const serialized = messages.map((msg) => {
      const words = msg.contents.trim().split(/\s+/);
      const firstWord = words[0] || "";
      const containsMention = firstWord.startsWith("@") && 
                             firstWord.substring(1) === user.username;

      return {
        id: msg.id,
        content: msg.contents,
        author: msg.user.username,
        containsMention: containsMention,
        groupId: msg.groupId,
      };
    });

    return serialized;
  }

  async store({ auth, request, params }: HttpContext) {
    const user = auth.use("access_tokens").user;
    if (!user) {
      return { error: "Unauthorized" };
    }

    const membership = await GroupUser.query()
      .where("userId", user.id)
      .andWhere("groupId", params.groupId)
      .first();

    if (!membership) {
      return { error: "You are not a member of this group" };
    }

    const message = await Message.create({
      contents: request.input("contents"),
      userId: user.id,
      groupId: params.groupId,
    });

    await message.load("user");

    return {
      id: message.id,
      content: message.contents,
      author: message.user.username,
      containsMention: false,
      groupId: message.groupId,
    };
  }

  public static async sendMessage(
    userId: string,
    groupId: string,
    content: string,
  ) {
    const membership = await GroupUser.query()
      .where("userId", userId)
      .andWhere("groupId", groupId)
      .first();

    if (!membership) {
      throw new Error("User not a member of this group");
    }

    const message = await Message.create({
      contents: content,
      userId,
      groupId,
    });
    await message.load("user");

    return {
      id: message.id,
      content: message.contents,
      author: message.user.username,
      containsMention: false,
      groupId: message.groupId,
    };
  }

  public static async loadMessages(groupId: string, page: number) {
    const messages = await Message.query()
      .where("group_id", groupId)
      .preload("user")
      .orderBy("created_at", "desc")
      .paginate(page, 20);
    
    return messages;
  }
}