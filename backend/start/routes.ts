/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from "#controllers/auth_controller";
import UsersController from "#controllers/users_controller";
import router from "@adonisjs/core/services/router";

router.get("/", async () => {
  return { success: true };
});

router
  .group(() => {
    router.post("login", [AuthController, "login"]);
    router.post("logout", [AuthController, "logout"]);
    router.post("register", [AuthController, "register"]);
  })
  .prefix("auth");

router
  .group(() => {
    router.post("changeStatus", [UsersController, "changeStatus"]);
  })
  .prefix("user");
