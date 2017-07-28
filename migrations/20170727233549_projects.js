
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('projects', table => {
      table.increments('id').primary();
      table.string('title');
      table.string('image_url');
      table.text('content');
      table.string('source_url');
      table.string('demo_url');
    })]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('projects'),
  ]);
};
