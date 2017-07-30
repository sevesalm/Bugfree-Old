module.exports = {
  apps: [
    {
      name: 'Bugfree',
      script: 'server.js',
      cwd: '/var/www/html/',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
