import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection, closeConnection } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Auto-load all route files from the routes directory
const routesPath = path.join(__dirname, 'routes');
const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

console.log('Loading routes from:', routesPath);

for (const file of routeFiles) {
    const routeName = file.replace('.js', '');
    const routePath = path.join(routesPath, file);
    
    try {
        // Dynamic import of the route module
        const routeModule = await import(`./routes/${file}`);
        const router = routeModule.default;
        
        // Convert route name to kebab-case for URL
        // e.g., AspNetUsers -> aspnet-users, hierarchy-final -> hierarchy-final
        let urlPath = routeName
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '')
            .replace(/-+/g, '-');
        
        // Special handling for specific routes
        if (routeName === 'offices-new') {
            urlPath = 'offices';
        } else if (routeName === 'dec-mst') {
            urlPath = 'dec-mst';
        } else if (routeName === 'hierarchy-final' || routeName === 'hierarchy-simple') {
            urlPath = 'hierarchy';
        } else if (routeName === 'AspNetUsers') {
            urlPath = 'aspnet-users';
        }
        
        app.use(`/api/${urlPath}`, router);
        console.log(`✅ Loaded route: /api/${urlPath} from ${file}`);
    } catch (error) {
        console.error(`❌ Failed to load route ${file}:`, error.message);
    }
}

// Start server
const startServer = async () => {
    try {
        console.log('Testing SQL Server connection...');
        await getConnection();
        console.log('SQL Server connection successful!');

        const server = app.listen(PORT, () => {
            console.log('\n🚀 SQL Server API Server Started');
            console.log(`Port: ${PORT}`);
            console.log('\n⏳ Server is ready and waiting for requests...\n');
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
            } else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down...');
    await closeConnection();
    process.exit(0);
});

// Start the server
startServer();
