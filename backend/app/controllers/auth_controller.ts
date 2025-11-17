import Group from "#models/group";
import User from "#models/user";
import { registerUserValidator } from "#validators/register_user";
import { HttpContext } from "@adonisjs/core/http";

export default class AuthController {
  async register({ request }: HttpContext) {
    // if invalid, exception
    const data = await registerUserValidator.validate(request);

    const user = await User.create(data);
    // join user to general channel
    const general = await Group.findByOrFail("name", "general");
    await user.related("groups").attach([general.id]);

    return user;
  }

  async login({ auth, request }: HttpContext) {
    // const name = request.input("username");
    // const password = request.input("password");

    // const token = await auth.use("api").login(name, password);

    return "meow";
  }

  async logout({ auth }: HttpContext) {
    // const token = auth.use("api").token;
    // if (token) {
    //   await token.revoke();
    // }
    return { message: "Logged out" };
  }

  async me({ auth }: HttpContext) {
    // await auth.load("groups");
    return auth.user;
  }
}
