// TODO: Buat koneksi pool MySQL disini menggunakan Environment Variable (process.env)

const mysql = require("mysql2");

// =========================
// MySQL Connection Pool
// =========================
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // service name docker
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database pool connection failed:", err);
  } else {
    console.log("✅ MySQL Pool Connected");
    connection.release();
  }
});

module.exports = pool;
