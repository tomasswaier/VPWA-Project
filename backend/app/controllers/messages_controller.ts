import Group from "#models/group";
import Message from "#models/message";
import type { HttpContext } from "@adonisjs/core/http";

export default class MessagesController {
  // Load messages in group
  async index({ request, params }: HttpContext) {
    const page = Number(request.input("page", 1));
    const perPage = 20;

    const messages = await Message.query()
      .where("groupId", params.groupId)
      .preload("user", (q) => q.select("username"))
      .orderBy("createdAt", "asc")
      .offset((page - 1) * perPage)
      .limit(perPage);

    const serialized = messages.map((msg) => ({
      id: msg.id,
      content: msg.contents,
      author: msg.user.username,
      containsMention: false,
      channelId: msg.groupId,
    }));

    return serialized;
  }

  // Send Message
  async store({ auth, request, params }: HttpContext) {
    const user = auth.use("access_tokens").user;
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

    const group = await Group.findOrFail(params.groupId);

    const message = await Message.create({
      contents: request.input("contents"),
      userId: user.id,
      groupId: group.id,
    });

    await message.load("user");

    return message;
  }
}
