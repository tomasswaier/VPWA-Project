import { BaseSchema } from "@adonisjs/lucid/schema";

export default class GroupUserInvitations extends BaseSchema {
  protected tableName = "group_user_invitation";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("user_id").notNullable();
      table.uuid("group_id").notNullable();

      table.foreign("user_id").references("users.id").onDelete("CASCADE");

      table.foreign("group_id").references("groups.id").onDelete("CASCADE");

      // table.primary(["user_id", "group_id"]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
