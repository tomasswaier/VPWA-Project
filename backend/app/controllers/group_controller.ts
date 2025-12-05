import Group from "#models/group";
import GroupUser from "#models/group_user";
import GroupUserBan from "#models/group_user_ban";
import GroupUserKick from "#models/group_user_kick";
import User from "#models/user";
import { HttpContext } from "@adonisjs/core/http";
import { group } from "node:console";
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
            { error: "Group already exists and you are already a member" },
          );
        }
        if (
          await GroupController.isBanned(
            String(existingGroup.id),
            String(user?.id),
          )
        ) {
          return response.ok(
            { error: "You are banned in this group" },
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

  private static async isOwner(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    const pivotRecord = await GroupUser.query()
      .where("group_id", groupId)
      .andWhere("user_id", userId)
      .first();

    return pivotRecord?.isOwner ?? false;
  }
  private static async isBanned(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    const bannedRecord = await GroupUserBan.query()
      .where("group_id", groupId)
      .andWhere("user_id", userId)
      .first();
    return !!bannedRecord; // true if record exists, false otherwise
  }

  public static async invite(
    inviterId: string,
    target: User,
    groupId: string,
  ) {
    // const inviter = User.find(inviterId);

    try {
      const group = await Group.findOrFail(groupId);
      await group.load("users");

      // inviter must be a member
      const isMember = group.users.some((u) => u.id === inviterId);
      if (!isMember) {
        return {
          error: "You are not a member of this group",
        };
      }
      const isInviterOwner = await GroupController.isOwner(
        group.id,
        inviterId,
      );
      const isUserBanned = await GroupController.isBanned(
        group.id,
        target.id,
      );

      // only owner may unban by invitation
      if (isUserBanned && !isInviterOwner) {
        return {
          error: `${target.username} is banned from this group`,
        };
      }

      if (group.isPrivate && !isInviterOwner) {
        return { error: "Only group owner can invite users" };
      }

      const isAlreadyMember = group.users.some((u) => u.id === target.id);
      if (isAlreadyMember) {
        return {
          error: `${target.username} is already a member`,
        };
      }

      const db = (await import("@adonisjs/lucid/services/db")).default;

      await db.transaction(async (trx) => {
        if (isUserBanned && isInviterOwner) {
          console.info("removing from bans");
          await trx.from("group_user_ban")
            .where("user_id", target.id)
            .andWhere("group_id", group.id)
            .delete();
        }

        await trx.table("group_user_invitation").insert({
          user_id: target.id,
          group_id: group.id,
        });
      });

      return {
        success: true,
        message: `Invitation sent to ${target.username}`,
      };
    } catch (error) {
      console.error("Error inviting user:", error);
      return { error: "Failed to send invitation" };
    }
  }

  public static async voteKick(params: {
    groupId: string;
    userTargetId: string;
    userCasterId: string;
  }): Promise<{ banned: boolean; message: string }> {
    const { groupId, userTargetId, userCasterId } = params;

    const existingVote = await GroupUserKick.query()
      .where({ groupId, userCasterId, userTargetId })
      .first();

    if (existingVote) {
      return { banned: false, message: "You already voted to kick this user." };
    }
    const group: Group = await Group.findOrFail(groupId);
    const isCasterOwner: boolean = await this.isOwner(groupId, userCasterId);
    const isTargetOwner: boolean = await this.isOwner(groupId, userTargetId);

    if ((group.isPrivate && !isCasterOwner) || isTargetOwner) {
      return {
        banned: false,
        message: "You do not have authorization to kick this user.",
      };
    }

    await GroupUserKick.create({ groupId, userCasterId, userTargetId });

    const totalVotes = await GroupUserKick.query()
      .where({ groupId, userTargetId })
      .count("* as count")
      .first();
    console.log("votes total" + totalVotes);

    const voteCount = Number(totalVotes?.$extras.count || 0);

    if ((isCasterOwner && voteCount >= 1) || voteCount >= 3) {
      await GroupUserBan.create({ groupId, userId: userTargetId });
      await GroupUser.query().where({ groupId, userId: userTargetId }).delete();
      await GroupUserKick.query().where({ groupId, userTargetId }).delete();

      return { banned: true, message: "User has been banned from this group." };
    }

    return { banned: false, message: `Vote counted (${voteCount}/3).` };
  }
}
