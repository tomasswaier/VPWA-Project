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
  console.log("moew");
  return { hello: "world" };
});

router.get("/test", async () => {
  console.log("moew");
  return {
    title: "Pedro",
    secondTitle: "Pedro",
    name: "Pedro",
    surname: "Pedro",
    middlename: "Pe",
  };
});

router.group(() => {
  router.post("login", [AuthController, "login"]);
})
  .prefix("auth");
