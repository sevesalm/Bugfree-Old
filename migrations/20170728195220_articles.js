
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('articles', table => {
      table.increments('id').primary();
      table.integer('author_id').references('id').inTable('users');
      table.string('title');
      table.text('content');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    })]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('articles'),
  ]);
};
