// import type { HttpContext } from '@adonisjs/core/http'
// import User from "#models/user";
// import type UserStatus from "#models/user";
import { HttpContext } from "@adonisjs/core/http";

export default class UsersController {
  async changeStatus({ auth, request }: HttpContext) {
    const user = auth.use("access_tokens").user;

    if (!user) {
      return { error: "Unauthorized" };
    }

    const newStatus = request.input("status");
    user.status = newStatus;
    await user.save();

    return { status: user.status };
  }
}
