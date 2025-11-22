import { BaseModel, column, hasMany, manyToMany } from "@adonisjs/lucid/orm";
import type { HasMany, ManyToMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";

import Message from "./message.js";
import User from "./user.js";

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare name: string;

  @column()
  declare description: string | null;

  @column()
  declare isPrivate: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column
    .dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>;

  @manyToMany(() => User, {
    pivotTable: "group_user",
    pivotForeignKey: "group_id",
    pivotRelatedForeignKey: "user_id",
  })
  declare users: ManyToMany<typeof User>;
}
