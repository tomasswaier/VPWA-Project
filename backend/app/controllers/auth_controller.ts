import { HttpContext } from "@adonisjs/core/http";
import Group from "App/Models/Group";
import User from "App/Models/User";
import RegisterUserValidator from "App/Validators/RegisterUserValidator";

export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator);
    const user = await User.create(data);
    // join user to general channel
    const general = await Group.findByOrFail("name", "general");
    await user.related("channels").attach([general.id]);

    return user;
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input("email");
    const password = request.input("password");

    const token = await auth.use("api").attempt(email, password);

    return token;
  }

  async logout({ auth }: HttpContext) {
    return auth.use("api").logout();
  }

  async me({ auth }: HttpContext) {
    await auth.user!.load("channels");
    return auth.user;
  }
}
