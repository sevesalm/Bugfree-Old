const knexfile = require('./knexfile.js');
const knex = require('knex')(knexfile.development);

knex.migrate.latest([knexfile])
  .catch(err => console.log(err));

module.exports = knex;
