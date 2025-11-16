import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Messages extends BaseSchema {
  protected tableName = "messages";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().notNullable();
      table.text("contents").notNullable();
      table.uuid("user_id").notNullable();
      table.uuid("group_id").notNullable();

      table.foreign("user_id").references("users.id").onDelete("CASCADE");

      table.foreign("group_id").references("groups.id").onDelete("CASCADE");

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
