const mysql = require("mysql2/promise");

async function connectDB() {
  let pool;
  while (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true, 
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('✅ Database connected!');
    } catch (err) {
      console.log('❌ Database not ready, retrying in 2s...');
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return pool;
}

module.exports = connectDB;
