const env = process.env.NODE_ENV;
if (env === 'production' || env === 'qa') {
  process.env.NEW_RELIC_HOME = `${__dirname}/config/newrelic/${env}.js`;
  require('newrelic');
}
