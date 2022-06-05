
exports.up = function(knex) {
    return knex.schema.createTable('domain_links',(table) => {
        table.increments();
        table.integer('domain_id')
                .unsigned()
                .nullable()
                .references('id')
                .inTable('domains')
                .onDelete('CASCADE');
        table.text('link');
        table.text('content');
        table.integer('word_count');
        table.integer('status').defaultTo('1');
        table.integer('is_delete').defaultTo('0');
        table.timestamps(false, true);
  });
};

exports.down = function(knex) {
    return knex.schema.dropTable('domain_links');
};
