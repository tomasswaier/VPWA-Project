import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";
import {
  BaseModel,
  beforeCreate,
  column,
  hasMany,
  manyToMany,
} from "@adonisjs/lucid/orm";
import type { HasMany, ManyToMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

import Group from "./group.js";
import Message from "./message.js";

const AuthFinder = withAuthFinder(() => hash.use("scrypt"), {
  uids: ["username"],
  passwordColumnName: "password",
});

export type UserStatus = "online" | "do_not_disturb" | "offline";

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string;

  @beforeCreate()
  static assignUuid(user: User) {
    if (!user.id) {
      user.id = randomUUID();
    }
  }

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

  public static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: "auth_access_tokens", // optionally customize
    expiresIn: "30 days", // optional
    // more options if needed
  });

  @column
    .dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
  @column() @hasMany(() => Message)
  declare messages: HasMany<typeof Message>;

  @manyToMany(() => Group, {
    pivotTable: "group_user",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "group_id",
  })
  declare groups: ManyToMany<typeof Group>;
}
