import { BaseSchema } from "@adonisjs/lucid/schema";

export default class GroupUserKicks extends BaseSchema {
  protected tableName = "group_user_kick";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("user_target_id").notNullable();
      table.uuid("user_caster_id").notNullable();
      table.uuid("group_id").notNullable();

      table.foreign("user_target_id").references("users.id").onDelete(
        "CASCADE",
      );

      table.foreign("user_caster_id").references("users.id").onDelete(
        "CASCADE",
      );

      table.foreign("group_id").references("groups.id").onDelete("CASCADE");

      table.primary(["user_target_id", "user_caster_id", "group_id"]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
