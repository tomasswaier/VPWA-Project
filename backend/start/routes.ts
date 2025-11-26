import AuthController from "#controllers/auth_controller";
import GroupController from "#controllers/group_controller";
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
    router.get("/", [GroupController, "index"]);
    router.get("/invitations", [GroupController, "invitations"]);
    router.post("/join-or-create", [GroupController, "joinOrCreate"]);
    router.post("/:id/join", [GroupController, "join"]);
    router.post("/:id/leave", [GroupController, "leave"]);
    router.post("/:id/invite", [GroupController, "invite"]);
    router.post("/:id/accept-invitation", [GroupController, "acceptInvitation"]);
    router.post("/:id/decline-invitation", [GroupController, "declineInvitation"]);
    router.get("/:id/members", [GroupController, "members"]);
    router.get(":groupId/messages", [MessagesController, "index"]);
    router.post(":groupId/messages", [MessagesController, "store"]);
    router.post("/:id/revoke", [GroupController, "revoke"]);
  })
  .prefix("groups")
  .use(middleware.auth());

router
  .group(() => {
    router.post("changeStatus", [UsersController, "changeStatus"]);
  })
  .prefix("user");