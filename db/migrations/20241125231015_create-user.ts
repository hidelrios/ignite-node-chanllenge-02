import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary();
        table.string('username').notNullable().unique();
        table.string('email').notNullable().unique(); 
        table.timestamps(true, true)
        table.string('session_id').notNullable().unique()

    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}

