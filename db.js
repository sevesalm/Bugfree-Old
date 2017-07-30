const knexfile = require('./knexfile.js');
const knex = require('knex')(knexfile[process.env.NODE_ENV]);

if (process.env.NODE_ENV !== 'test') {
  knex.migrate.latest()
    .catch(err => console.log(err));
}

module.exports = knex;
