import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// SQL Server configuration
const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    port: parseInt(process.env.SQL_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000
    }
};

// Create a single connection pool
let pool;

async function getConnection() {
    try {
        if (!pool) {
            console.log('🔌 Creating SQL Server connection pool...');
            pool = await sql.connect(config);
            
            pool.on('error', err => {
                console.error('❌ Database pool error:', err);
            });
            
            console.log('✅ Connected to database:', config.database);
        }
        return pool;
    } catch (err) {
        console.error('❌ Database connection error:', err);
        throw err;
    }
}

async function closeConnection() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('🔌 Connection pool closed');
        }
    } catch (err) {
        console.error('❌ Error closing connection:', err);
    }
}

export { getConnection, closeConnection, sql };
