const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(isProduction ? process.env.DATABASE_URL : 'postgres://localhost:5435/shorten_url', {
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