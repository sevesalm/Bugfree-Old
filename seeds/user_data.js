const data = require('../users.json');

exports.seed = function (knex, Promise) {
  return Promise.all([knex('users').del()
    .then(() =>
      knex('users').insert(data)
    )]);
};
