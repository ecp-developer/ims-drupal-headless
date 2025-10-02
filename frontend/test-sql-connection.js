import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: parseInt(process.env.SQL_PORT) || 1433
};

async function testConnection() {
    console.log('🔍 Testing SQL Server connection...');
    console.log('📊 Configuration:', {
        user: config.user,
        server: config.server,
        database: config.database,
        port: config.port
    });

    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Successfully connected to SQL Server!');
        
        // Test if tblOffices exists
        const result = await pool.request().query('SELECT COUNT(*) as count FROM tblOffices');
        console.log('📊 tblOffices contains', result.recordset[0].count, 'records');
        
        await pool.close();
        console.log('🎉 Connection test completed successfully!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('🔧 Possible solutions:');
        console.error('   1. Check if SQL Server is running');
        console.error('   2. Verify username/password');
        console.error('   3. Check if database exists');
        console.error('   4. Verify network connectivity');
    }
}

testConnection();