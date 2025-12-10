// import type { HttpContext } from '@adonisjs/core/http'
// import User from "#models/user";
import type UserStatus from "#models/user";
import { HttpContext } from "@adonisjs/core/http";
import GroupUser from "#models/group_user";

export default class UsersController {
  async changeStatus({ auth, request }: HttpContext) {
    const user = await auth.use("access_tokens").authenticate();

    const { status } = request.body();

    if (!status || !(status as UserStatus)) {
      return { error: "Status not provided" };
    }

    user.status = status;
    await user.save();

    // Broadcast status change to all groups the user is a member of
    const userGroups = await GroupUser.query()
      .where("user_id", user.id.toString())
      .select("group_id");

    const io = (global as any).io;
    if (io) {
      for (const membership of userGroups) {
        io.of(`/groups/${membership.groupId}`).emit("userStatusChanged", {
          userId: user.id,
          username: user.username,
          status: user.status,
        });
      }
    }

    return { status: user.status };
  }
}
