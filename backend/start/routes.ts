import AuthController from "#controllers/auth_controller";
import MessagesController from "#controllers/messages_controller";
import UsersController from "#controllers/users_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.get("/", async () => {
  console.log("ping");
  return { success: true };
});

router
  .group(() => {
    router.post("login", [AuthController, "login"]);
    router.post("register", [AuthController, "register"]);
    router.post("logout", [AuthController, "logout"]);
  })
  .prefix("auth");

router.group(() => {
  router.get("me", [AuthController, "me"]);
})
  .prefix("auth")
  .use(middleware.auth());

router
  .group(() => {
    router.get("/", "#controllers/group_controller.index");
    router.post("/join-or-create", "#controllers/group_controller.joinOrCreate");
    router.post("/:id/join", "#controllers/group_controller.join");
    router.post("/:id/leave", "#controllers/group_controller.leave");
    router.get("/:id/members", "#controllers/group_controller.members");
  })
  .prefix("groups")
  .use(middleware.auth());

router
  .group(() => {
    router.post("changeStatus", [UsersController, "changeStatus"]);
  })
  .prefix("user");