module.exports = {
  apps: [
    {
      name: 'Bugfree',
      script: 'server/server.js',
      cwd: '/var/www/html/',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
