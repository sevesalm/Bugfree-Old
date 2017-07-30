const path = require('path');

module.exports = {
  production: {
    client: 'pg',
    connection: {
      database: 'bugfree',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  test: {
    client: 'pg',
    connection: {
      database: 'bugfree_test',
      user: 'postgres',
      password: '',
    },
    seeds: {
      directory: path.join(__dirname, '/seeds/test'),
    },
  },
};
