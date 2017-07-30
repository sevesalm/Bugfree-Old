const knexfile = require('./knexfile.js');
const knex = require('knex')(knexfile[process.env.NODE_ENV]);

knex.migrate.latest([knexfile])
  .catch(err => console.log(err));

module.exports = knex;
