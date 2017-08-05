
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('article_tag', table => {
      table.integer('article_id').references('id').inTable('articles');
      table.string('tag').references('tag').inTable('tag');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('article_tag'),
  ]);
};
