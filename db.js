const knexfile = require('./knexfile.js');
const knex = require('knex')(knexfile.development);

knex.migrate.latest([knexfile]);
module.exports = knex;
