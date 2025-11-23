// import AuthController from "#controllers/auth_controller";
import UsersController from "#controllers/users_controller";
import Group from "#models/group";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";
import { randomUUID } from "node:crypto";

router.get("/", async () => {
  /*
   * this route is used to check whether the server is alive
   */
  console.log("ping");
  return { success: true };
});

router
  .group(() => {
    router.post("login", "#controllers/auth_controller.login");
    router.post("register", "#controllers/auth_controller.register");
    router.post("logout", "#controllers/auth_controller.logout");
  })
  .prefix("auth");

router.group(() => {
  router.get("me", "#controllers/auth_controller.me");
})
  .prefix("auth")
  .use(middleware.auth());

router
  .group(() => {
    router.get("/", async ({ response }) => {
      try {
        const groups = await Group.query().where("is_private", false);
        return response.ok(groups);
      } catch (error) {
        console.error("Error:", error);
        return response.internalServerError(
          { message: "Failed to load groups" },
        );
      }
    });

    router.post("/join-or-create", async ({ request, response, auth }) => {
      const user = auth.use("access_tokens").user;
      const { name, isPrivate, description } = request.body();

      if (!name || name.trim() === "") {
        return response.badRequest({ message: "Group name is required" });
      }

      try {
        const existingGroup = await Group.findBy("name", name);

        if (existingGroup) {
          await existingGroup.load("users");
          const isMember = existingGroup.users.some((u) => u.id === user!.id);

          if (isMember) {
            return response.ok({ message: "Group already exists and you are already a member" });
          }

          if (existingGroup.isPrivate) {
            return response.badRequest({ message: "Cannot join private group" });
          }

          await existingGroup.related("users").attach([user!.id]);
          return response.ok({ message: "Successfully joined existing group" });
        }

        const newGroup = await Group.create({
          id: randomUUID(),
          name: name,
          description: description || null,
          isPrivate: isPrivate || false
        });

        await newGroup.related("users").attach({
          [user!.id]: { is_owner: true }
        });

        return response.ok({ message: "Group created successfully" });
      } catch (error) {
        console.error("Error in join-or-create:", error);
        return response.internalServerError({ message: "Failed to join/create group" });
      }
    });

    router.post("/:id/join", async ({ params, response, auth }) => {
      const user = auth.use("access_tokens").user;
      const group = await Group.findOrFail(params.id);
      await group.load("users");

      const isMember = group.users.some((u) => u.id === user!.id);
      if (isMember) {
        return response.badRequest(
          { message: "Already a member of this group" },
        );
      }

      await group.related("users").attach([user!.id]);
      return response.ok({ message: "Successfully joined the group" });
    });

    router.post("/:id/leave", async ({ params, response, auth }) => {
      const user = auth.use("access_tokens").user;
      const group = await Group.findOrFail(params.id);
      await group.load("users");

      const isMember = group.users.some((u) => u.id === user!.id);
      if (!isMember) {
        return response.badRequest({ message: "Not a member of this group" });
      }

      const pivotData = await group.related("users").pivotQuery()
        .where("user_id", user!.id)
        .where("group_id", group.id)
        .first();

      const isOwner = pivotData?.is_owner || false;

      if (isOwner) {
        await group.delete();
        return response.ok({ message: "Group deleted successfully" });
      } else {
        await group.related("users").detach([user!.id]);
        return response.ok({ message: "Successfully left the group" });
      }
    });
  })
  .prefix("groups")
  .use(middleware.auth());

router
  .group(() => {
    router.post("changeStatus", [UsersController, "changeStatus"]);
  })
  .prefix("user");