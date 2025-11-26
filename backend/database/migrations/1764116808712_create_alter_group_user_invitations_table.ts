import { BaseSchema } from "@adonisjs/lucid/schema";

export default class AlterGroupUserInvitation extends BaseSchema {
  protected tableName = "group_user_invitation";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.raw("gen_random_uuid()"));
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("id");
    });
  }
}
