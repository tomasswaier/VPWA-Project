// import Group from "#models/group";
import GroupUser from "#models/group_user";
import Message from "#models/message";
import type { HttpContext } from "@adonisjs/core/http";

export default class MessagesController {
  // Load messages in group (HTTP or WS)
  async index({ request, params, auth, response }: HttpContext) {
    const user = auth.use("access_tokens").user;
    if (!user) {
      return response.unauthorized({ message: "Not logged in" });
    }

    // check if user belongs to this group
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
      .orderBy("createdAt", "asc")
      .offset((page - 1) * perPage)
      .limit(perPage);

    // serialized messages for frontend
    const serialized = messages.map((msg) => ({
      id: msg.id,
      content: msg.contents,
      author: msg.user.username,
      containsMention: false,
      channelId: msg.groupId,
    }));

    return serialized;
  }

  // Send Message (HTTP or WS)
  async store({ auth, request, params }: HttpContext) {
    const user = auth.use("access_tokens").user;
    if (!user) {
      return { error: "Unauthorized" };
    }

    // validate membership
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

    // Return serialized message (for WS)
    return {
      id: message.id,
      content: message.contents,
      author: message.user.username,
      containsMention: false,
      channelId: message.groupId,
    };
  }

  // Optional: helper static method for WebSocket usage
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
      channelId: message.groupId,
    };
  }
  public static async loadMessages(groupId: string, page: number) {
    return await Message.query()
      .where("group_id", groupId)
      .orderBy("created_at", "desc")
      .paginate(page, 20);
  }
}
