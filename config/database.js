const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const databaseUrl = isProduction ? process.env.DATABASE_URL : isTest ? process.env.DATABASE_URL : 'postgres://localhost:5435/shorten_url';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  protocol: 'postgres',
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
  logging: false,
});

module.exports = sequelize;