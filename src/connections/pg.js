const { Pool } = require("pg");
const dbConfig = require("../config/db.config");

const pool = new Pool({
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DATABASE,
});

module.exports = pool