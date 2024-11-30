import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('description').unique().notNullable();
        table.date('date').notNullable()
        table.boolean('is_on_diet').notNullable()
        table.timestamps(true, true)

        
        // Relacionamento com a tabela de usuários (chave estrangeira)
        table.uuid('user_id').references('users.id').notNullable()
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('meals');
}

