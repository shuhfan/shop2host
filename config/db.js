const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shop2host'
});

// Function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the SQL database');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
  }
}

// Call the testConnection function to log the connection status
testConnection();

module.exports = pool;