import Group from "#models/group";
import GroupUser from "#models/group_user";
import GroupUserBan from "#models/group_user_ban";
import GroupUserKick from "#models/group_user_kick";
import User from "#models/user";
import { HttpContext } from "@adonisjs/core/http";
import { randomUUID } from "node:crypto";

export default class GroupController {
  async index({ response }: HttpContext) {
    try {
      const groups = await Group.query().where("is_private", false);
      return response.ok(groups);
    } catch (error) {
      console.error("Error:", error);
      return response.internalServerError({ message: "Failed to load groups" });
    }
  }

  async invitations({ auth, response }: HttpContext) {
    const user = auth.use("access_tokens").user;

    try {
      const db = (await import("@adonisjs/lucid/services/db")).default;

      const invitations = await db.from("group_user_invitation")
        .join("groups", "groups.id", "group_user_invitation.group_id")
        .where("group_user_invitation.user_id", user!.id)
        .select(
          "groups.id",
          "groups.name",
          "groups.description",
          "groups.is_private as isPrivate",
        );

      return response.ok(invitations);
    } catch (error) {
      console.error("Error loading invitations:", error);
      return response.internalServerError(
        { message: "Failed to load invitations" },
      );
    }
  }

  async acceptInvitation({ params, auth, response }: HttpContext) {
    const user = auth.use("access_tokens").user;

    try {
      const db = (await import("@adonisjs/lucid/services/db")).default;

      const invitation = await db.from("group_user_invitation")
        .where("user_id", user!.id)
        .where("group_id", params.id)
        .first();

      if (!invitation) {
        return response.notFound({ message: "Invitation not found" });
      }

      const group = await Group.findOrFail(params.id);
      await group.related("users").attach([user!.id]);

      await db.from("group_user_invitation")
        .where("user_id", user!.id)
        .where("group_id", params.id)
        .delete();

      return response.ok({ message: "Invitation accepted successfully" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      return response.internalServerError(
        { message: "Failed to accept invitation" },
      );
    }
  }

  async declineInvitation({ params, auth, response }: HttpContext) {
    const user = auth.use("access_tokens").user;

    try {
      const db = (await import("@adonisjs/lucid/services/db")).default;

      const invitation = await db.from("group_user_invitation")
        .where("user_id", user!.id)
        .where("group_id", params.id)
        .first();

      if (!invitation) {
        return response.notFound({ message: "Invitation not found" });
      }

      await db.from("group_user_invitation")
        .where("user_id", user!.id)
        .where("group_id", params.id)
        .delete();

      return response.ok({ message: "Invitation declined successfully" });
    } catch (error) {
      console.error("Error declining invitation:", error);
      return response.internalServerError(
        { message: "Failed to decline invitation" },
      );
    }
  }

  async joinOrCreate({ request, response, auth }: HttpContext) {
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
          return response.ok(
            { message: "Group already exists and you are already a member" },
          );
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
        isPrivate: isPrivate || false,
      });

      await newGroup.related("users").attach({
        [user!.id]: { is_owner: true },
      });

      return response.ok({ message: "Group created successfully" });
    } catch (error) {
      console.error("Error in join-or-create:", error);
      return response.internalServerError(
        { message: "Failed to join/create group" },
      );
    }
  }

  async join({ params, response, auth }: HttpContext) {
    const user = auth.use("access_tokens").user;
    const group = await Group.findOrFail(params.id);
    await group.load("users");

    const isMember = group.users.some((u) => u.id === user!.id);
    if (isMember) {
      return response.badRequest({ message: "Already a member of this group" });
    }

    await group.related("users").attach([user!.id]);
    return response.ok({ message: "Successfully joined the group" });
  }

  async leave({ params, response, auth }: HttpContext) {
    const user = auth.use("access_tokens").user;
    const group = await Group.findOrFail(params.id);
    await group.load("users");

    const isMember = group.users.some((u) => u.id === user!.id);
    if (!isMember) {
      return response.badRequest({ message: "Not a member of this group" });
    }

    const pivotData = await group.related("users")
      .pivotQuery()
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
  }

  async members({ params, response }: HttpContext) {
    try {
      const group = await Group.findOrFail(params.id);
      await group.load("users");

      return response.ok(group.users);
    } catch (error) {
      console.error("Error loading members:", error);
      return response.internalServerError(
        { message: "Failed to load group members" },
      );
    }
  }

  async invite({ params, request, response, auth }: HttpContext) {
    const user = auth.use("access_tokens").user;
    const { username } = request.body();

    if (!username || username.trim() === "") {
      return response.badRequest({ message: "Username is required" });
    }

    try {
      const group = await Group.findOrFail(params.id);
      await group.load("users");

      const isMember = group.users.some((u) => u.id === user!.id);
      if (!isMember) {
        return response.forbidden(
          { message: "You are not a member of this group" },
        );
      }

      const invitedUser = await User.findBy("username", username);
      if (!invitedUser) {
        return response.notFound({ message: `User "${username}" not found` });
      }

      const isAlreadyMember = group.users.some((u) => u.id === invitedUser.id);
      if (isAlreadyMember) {
        return response.badRequest(
          { message: `${username} is already a member` },
        );
      }

      const db = (await import("@adonisjs/lucid/services/db")).default;

      const existingInvite = await db.from("group_user_invitation")
        .where("user_id", invitedUser.id)
        .where("group_id", group.id)
        .first();

      if (existingInvite) {
        return response.badRequest(
          { message: `${username} already has a pending invitation` },
        );
      }

      await db.table("group_user_invitation").insert({
        user_id: invitedUser.id,
        group_id: group.id,
      });

      return response.ok({ message: `Invitation sent to ${username}` });
    } catch (error) {
      console.error("Error inviting user:", error);
      return response.internalServerError(
        { message: "Failed to send invitation" },
      );
    }
  }

  public static async voteKickInternal(params: {
    groupId: string;
    userTargetId: string;
    userCasterId: string;
  }): Promise<{ banned: boolean; message: string }> {
    const { groupId, userTargetId, userCasterId } = params;

    // 1️⃣ Prevent duplicate votes
    const existingVote = await GroupUserKick.query()
      .where({ groupId, userCasterId, userTargetId })
      .first();

    if (existingVote) {
      return { banned: false, message: "You already voted to kick this user." };
    }

    await GroupUserKick.create({ groupId, userCasterId, userTargetId });

    const totalVotes = await GroupUserKick.query()
      .where({ groupId, userTargetId })
      .count("* as count")
      .first();

    const voteCount = Number(totalVotes?.$extras.count || 0);

    if (voteCount >= 3) {
      await GroupUserBan.create({ groupId, userId: userTargetId });
      await GroupUser.query().where({ groupId, userId: userTargetId }).delete();
      await GroupUserKick.query().where({ groupId, userTargetId }).delete();

      return { banned: true, message: "User has been banned from this group." };
    }

    return { banned: false, message: `Vote counted (${voteCount}/3).` };
  }

  public async voteKick({ request, auth, response }: HttpContext) {
    const { groupId, userTargetId } = request.only(["groupId", "userTargetId"]);
    const userCasterId = auth.user?.id;

    if (!userCasterId) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const result = await GroupController.voteKickInternal({
      groupId,
      userTargetId,
      userCasterId: userCasterId.toString(),
    });

    return response.json(result);
  }
}
