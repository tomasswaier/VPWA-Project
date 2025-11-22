import router from "@adonisjs/core/services/router";
import { middleware } from "#start/kernel";

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

router
  .group(() => {
    router.post("login", "#controllers/auth_controller.login");
    router.post("register", "#controllers/auth_controller.register");
  })
  .prefix("auth");

router
  .group(() => {
    router.get("/", "#controllers/groups_controller.index");
    router.get("/:id", "#controllers/groups_controller.show");
    router.get("/:id/members", "#controllers/groups_controller.members");
    router.post("/:id/join", "#controllers/groups_controller.join");
    router.post("/:id/leave", "#controllers/groups_controller.leave");
  })
  .prefix("groups")
  .use(middleware.auth());