import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  public async up() {
    this.schema.alterTable("groups", (table) => {
      table.unique(["name"]);
    });
  }

  public async down() {
    this.schema.alterTable("groups", (table) => {
      table.dropUnique(["name"]);
    });
  }
}
