
exports.up = function(knex) {
    return knex.schema.createTable('domains',(table) => {
        table.increments();
        table.string('domain');
        table.integer('status').defaultTo('1');
        table.integer('is_delete').defaultTo('0');
        table.timestamps(false, true);
  });
};

exports.down = function(knex) {
    return knex.schema.dropTable('domains');
};
