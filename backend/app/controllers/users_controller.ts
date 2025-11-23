// import type { HttpContext } from '@adonisjs/core/http'
// import User from "#models/user";
import type UserStatus from "#models/user";
import { HttpContext } from "@adonisjs/core/http";

export default class UsersController {
  async changeStatus({ auth, request }: HttpContext) {
    const user = await auth.use("access_tokens").authenticate();

    const { status } = request.body();

    if (!status || !(status as UserStatus)) {
      return { error: "Status not provided" };
    }

    user.status = status;
    await user.save();

    return { status: user.status };
  }
}
