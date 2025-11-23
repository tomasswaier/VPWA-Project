import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable("users", (table) => {
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("email").notNullable().unique();
    });
  }

  async down() {
    this.schema.alterTable("users", (table) => {
      table.dropColumn("first_name");
      table.dropColumn("last_name");
      table.dropColumn("email");
    });
  }
}
