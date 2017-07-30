module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'bugfree',
      user: process.env.db_user,
      password: process.env.db_password,
    },
  },
};
