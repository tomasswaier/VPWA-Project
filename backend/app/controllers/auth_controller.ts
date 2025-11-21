import Group from "#models/group";
import User from "#models/user";
import { logInValidator, registerValidator } from "#validators/auth";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";

export default class AuthController {
  /**
   * Register new user
   */
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator);
    const user = await User.create(data);

    const general = await Group.findByOrFail("name", "general");
    await user.related("groups").attach([general.id]);

    return user;
  }

  /**
   * Login user and return access token
   */
  async login({ request, response }: HttpContext) {
    const { name, password } = await request.validateUsing(
      logInValidator,
    );

    const user = await User.verifyCredentials(name, password);
    const token = await User.accessTokens.create(user);

    return response.ok({
      token: token,
      ...user.serialize(),
    });
  }
  /**
   * Logout by revoking token
   */
  async logout({ auth }: HttpContext) {
    await auth.use("access_tokens").revoke();
    return { message: "Logged out" };
  }

  /**
   * Get logged-in user's profile
   */
  async me({ auth }: HttpContext) {
    const user = auth.use("access_tokens").user;
    await user!.load("groups");
    return user;
  }
}
