import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class GroupBan extends BaseModel {
  public static table = "group_user_ban";

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare userId: string;

  @column()
  declare groupId: string;
}
