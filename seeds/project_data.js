const data = require('../projects.json');

exports.seed = function (knex, Promise) {
  return Promise.all([knex('projects').del()
    .then(() =>
      knex('projects').insert(data)
    )]);
};
