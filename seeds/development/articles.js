const data = require('./test_articles.json');

exports.seed = function (knex, Promise) {
  return Promise.all([knex('articles').del()
    .then(() =>
      knex('articles').insert(data)
    )]);
};
