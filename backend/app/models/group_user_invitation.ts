import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class GroupUserInvitation extends BaseModel {
  public static table = "group_user_invitation";

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare userId: string;

  @column()
  declare groupId: string;
}
