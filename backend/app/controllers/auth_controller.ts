import Group from "#models/group";
import User from "#models/user";
import { logInValidator, registerValidator } from "#validators/auth";
// import { AccessToken } from "@adonisjs/auth/access_tokens";
import { HttpContext } from "@adonisjs/core/http";
// import hash from "@adonisjs/core/services/hash";

export default class AuthController {
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator);
    const user = await User.create(data);

    const general = await Group.findByOrFail("name", "general");
    await user.related("groups").attach([general.id]);

    return user;
  }

  async login({ request, response }: HttpContext) {
    const { username, password } = await request.validateUsing(logInValidator);

    const user = await User.verifyCredentials(username, password);

    const token = await User.accessTokens.create(user);

    return response.ok({
      token: token.value!.release(),
      ...user.serialize(),
    });
  }

  async logout({ auth, response }: HttpContext) {
    const token = (auth.use("access_tokens") as any).token;

    if (token) {
      await token.delete();
    }

    return response.ok({ message: "Logged out" });
  }

  async me({ auth }: HttpContext) {
    const user = auth.use("access_tokens").user;
    await user!.load("groups");
    return user;
  }
}
