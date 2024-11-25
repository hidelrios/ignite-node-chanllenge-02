import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description').unique().notNullable();
        table.timestamp('date_time').defaultTo(knex.fn.now());
        table.boolean('this_on_diet').notNullable();
        
        // Relacionamento com a tabela de usuários (chave estrangeira)
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('meals');
}

