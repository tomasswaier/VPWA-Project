import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";

import Group from "./group.js";
import User from "./user.js";

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare contents: string;

  @column()
  declare userId: string;

  @column()
  declare groupId: string;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column
    .dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  // Relations

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>;
}
