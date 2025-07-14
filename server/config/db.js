const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  dateStrings: ["DATE"],
});

(async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("✅ MySQL Connection Successful");
  } catch (error) {
    console.error("❌ MySQL Pool Connection Failed \n Error:", error.message);
  } finally {
    if (connection) connection.release();
  }
})();

module.exports = pool;
