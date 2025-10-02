import sql from 'mssql';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Function to get Windows host IP from WSL
const getWindowsHostIP = () => {
    try {
        // Try to get the Windows host IP from /etc/resolv.conf
        const nameserver = execSync("cat /etc/resolv.conf | grep nameserver | awk '{print $2}'", { encoding: 'utf-8' }).trim();
        return nameserver;
    } catch (error) {
        console.warn('⚠️  Could not detect Windows host IP, using configured server');
        return null;
    }
};

// Determine the SQL Server address
let sqlServer = process.env.SQL_SERVER || 'localhost';

// If running in WSL and server is localhost, try to get Windows host IP
if (sqlServer === 'localhost' || sqlServer === '127.0.0.1') {
    const hostIP = getWindowsHostIP();
    if (hostIP) {
        console.log(`🔍 Detected WSL environment, using Windows host IP: ${hostIP}`);
        sqlServer = hostIP;
    }
}

const config = {
    user: process.env.SQL_USER || 'drupal_user',
    password: process.env.SQL_PASSWORD || '2016Wfp61@', 
    server: sqlServer,
    database: process.env.SQL_DATABASE || 'ims-drupal-db',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000
    },
    port: parseInt(process.env.SQL_PORT) || 1433,
    pool: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000
};

// Global connection pool
let poolPromise = null;

const getPool = async () => {
    if (!poolPromise) {
        console.log('🔌 Creating new SQL Server connection pool...');
        console.log('📍 Server:', config.server, 'Port:', config.port, 'DB:', config.database);
        
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log('✅ SQL Server pool connected successfully');
                
                pool.on('error', err => {
                    console.error('❌ SQL Pool error:', err);
                    poolPromise = null;
                });
                
                return pool;
            })
            .catch(err => {
                console.error('❌ Failed to create pool:', err);
                poolPromise = null;
                throw err;
            });
    }
    
    return poolPromise;
};

const connectDB = async () => {
    try {
        const pool = await getPool();
        
        if (!pool.connected) {
            console.warn('⚠️  Pool not connected, resetting...');
            poolPromise = null;
            return await getPool();
        }
        
        return pool;
    } catch (error) {
        console.error('❌ connectDB failed:', error.message);
        throw error;
    }
};

// Get current pool status
const getPoolStatus = () => {
    if (!poolPromise) return 'No pool promise';
    return poolPromise.then(p => `connected: ${p.connected}`).catch(() => 'Pool error');
};

// Graceful shutdown
const closeDB = async () => {
    if (poolPromise) {
        try {
            const pool = await poolPromise;
            await pool.close();
            console.log('🔌 SQL Server connection closed');
        } catch (err) {
            console.error('Error closing pool:', err);
        }
        poolPromise = null;
    }
};

export { connectDB, closeDB, getPoolStatus, sql };
