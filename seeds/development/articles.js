const articles = require('./test_articles.json');
const tags = require('./test_tags.json');
const articlesTags = require('./test_articles_tags.json');

exports.seed = function (knex, Promise) {
  return knex('article_tag').del()
    .then(() =>
      Promise.all([
        knex('articles').del()
          .then(() =>
            knex('articles').insert(articles)
          ),
        knex('tag').del()
          .then(() =>
            knex('tag').insert(tags)),
      ]))
    .then(() =>
      knex('article_tag').del()
        .then(() =>
          knex('article_tag').insert(articlesTags)));
};
