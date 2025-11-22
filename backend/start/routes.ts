/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from "#controllers/auth_controller";
import router from "@adonisjs/core/services/router";

router.get("/", async () => {
  /*
   * this route is used to check whether the server is alive
   */
  console.log("ping");
  return { success: true };
});

router.get("/ping", async () => {
  return {
    success: true,
  };
});

router
  .group(() => {
    router.post("login", [AuthController, "login"]);
    router.post("register", [AuthController, "register"]);
  })
  .prefix("auth");
