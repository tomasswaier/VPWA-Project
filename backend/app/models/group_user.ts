import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class GroupUser extends BaseModel {
  public static table = "group_user";

  @column()
  declare userId: string;

  @column()
  declare groupId: string;

  @column()
  declare isOwner: boolean;
}
