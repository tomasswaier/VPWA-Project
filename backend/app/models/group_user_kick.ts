import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class GroupUserKick extends BaseModel {
  public static table = "group_user_kick";

  @column()
  declare userTargetId: string;

  @column()
  declare userCasterId: string;

  @column()
  declare groupId: string;
}
