import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Users extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.raw(`
      CREATE TYPE user_status AS ENUM ('online', 'do_not_disturb', 'offline');
    `);

    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().notNullable();
      table.string("username").notNullable();
      table.string("password").notNullable();

      table.specificType("status", "user_status")
        .notNullable()
        .defaultTo("offline");

      table.boolean("notification_perm").defaultTo(true);
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTableIfExists(this.tableName);

    this.schema.raw(`DROP TYPE IF EXISTS user_status;`);
  }
}
