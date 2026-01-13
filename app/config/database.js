const mysql = require("mysql2/promise");

let pool = null;

async function connectDB() {
  // Jika pool sudah ada, langsung return
  if (pool) {
    return pool;
  }

  const config = {
    host: process.env.DB_HOST || 'db_service',
    user: process.env.DB_USER || 'rayhan',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'penyewaan_motor',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Timezone setting
    timezone: '+07:00'
  };

  // Retry logic untuk koneksi database
  const maxRetries = 10;
  const retryDelay = 3000; // 3 detik

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempting database connection (${attempt}/${maxRetries})...`);
      
      pool = mysql.createPool(config);

      // Test koneksi
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      console.log("✅ Database connected successfully!");
      console.log(`   Host: ${config.host}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      
      return pool;

    } catch (err) {
      console.error(`❌ Connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${err.message}`);
      }
      
      console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (pool) {
    try {
      await pool.end();
      console.log('✅ Database pool closed gracefully');
    } catch (err) {
      console.error('❌ Error closing database pool:', err);
    }
  }
});

module.exports = connectDB;