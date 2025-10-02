import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection, closeConnection } from './db.js';
import officesRouter from './routes/offices-new.js';
import usersRouter from './routes/users.js';
import decMstRouter from './routes/dec-mst.js';
import wingsRouter from './routes/wings.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SQL Server API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/offices', officesRouter);
app.use('/api/users', usersRouter);
app.use('/api/dec-mst', decMstRouter);
app.use('/api/wings', wingsRouter);

// Start server
async function startServer() {
    try {
        // Initialize database connection
        console.log('🔌 Initializing SQL Server connection...');
        await getConnection();
        console.log('✅ Database connection initialized');
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n🚀 SQL Server API Server Started`);
            console.log(`📍 Port: ${PORT}`);
            console.log(`\n📋 Available Endpoints:`);
            console.log(`   🔗 Health Check:  http://localhost:${PORT}/api/health`);
            console.log(`   🏢 Offices:       http://localhost:${PORT}/api/offices`);
            console.log(`   👥 Users:         http://localhost:${PORT}/api/users`);
            console.log(`   📊 DEC MST:       http://localhost:${PORT}/api/dec-mst`);
            console.log(`   🦅 Wings:         http://localhost:${PORT}/api/wings`);
            console.log(`\n⏳ Server is ready and waiting for requests...\n`);
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n⏹️  Shutting down gracefully...');
            await closeConnection();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
