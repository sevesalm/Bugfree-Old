module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'bugfree',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
};
