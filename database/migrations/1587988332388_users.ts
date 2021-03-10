import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.string('firstname', 255).notNullable();
      table.string('lastname', 255).notNullable();
      table.string('username', 255).unique().notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('password', 180).notNullable();
      table.timestamp('register').notNullable();
      table.boolean('isAdmin').notNullable();
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
