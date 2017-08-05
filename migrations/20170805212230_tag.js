
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tag', table => {
      table.string('tag').unique();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('tag'),
  ]);
};
