import { middleware } from "#start/kernel";
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

router
  .group(() => {
    router.post("login", "#controllers/auth_controller.login");
    router.post("register", "#controllers/auth_controller.register");
  })
  .prefix("auth");

router
  .group(() => {
    router.get("/", "#controllers/group_controller.index");
    router.get("/:id", "#controllers/group_controller.show");
    router.get("/:id/members", "#controllers/group_controller.members");
    router.post("/:id/join", "#controllers/group_controller.join");
    router.post("/:id/leave", "#controllers/group_controller.leave");
  })
  .prefix("groups")
  .use(middleware.auth());
