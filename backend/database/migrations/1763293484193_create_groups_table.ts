import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Groups extends BaseSchema {
  protected tableName = "groups";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().notNullable();
      table.string("name").notNullable();
      table.text("description");
      table.boolean("is_private").defaultTo(false);
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
