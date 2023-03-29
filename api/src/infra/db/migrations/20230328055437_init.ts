import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('locations', function (table) {
      table.string('id', 32).primary();
      table.string('name', 256).notNullable();
      table.string('address', 256);
      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('events', function (table) {
      table.increments('id').primary();
      table.string('name', 32).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('location_id', 32).notNullable();
      table
        .foreign('location_id')
        .references('locations.id')
        .onDelete('cascade')
        .onUpdate('cascade');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('events').dropTableIfExists('locations');
}
