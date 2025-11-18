import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import { BaseModel, column, hasMany, manyToMany } from "@adonisjs/lucid/orm";
import type { HasMany, ManyToMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";

import Group from "./group.js";
import Message from "./message.js";

export type UserStatus = "online" | "do_not_disturb" | "offline";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare username: string;

  @column()
  declare password: string;

  @column()
  declare status: UserStatus;

  @column()
  declare notificationPerm: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column
    .dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: "5 days",
    prefix: "oat_",
    table: "auth_access_tokens",
    type: "auth_token",
    tokenSecretLength: 40,
  });

  // Relations

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>;

  @manyToMany(() => Group, {
    pivotTable: "group_user",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "group_id",
  })
  declare groups: ManyToMany<typeof Group>;
}
