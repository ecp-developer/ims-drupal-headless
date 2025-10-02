import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Mock offices data
const mockOffices = [
    {
        OfficeID: 1,
        OfficeName: 'Head Office',
        OfficeCode: 'HO',
        Address: '123 Main Street, City',
        Phone: '+1-555-0123',
        Email: 'headoffice@company.com'
    },
    {
        OfficeID: 2,
        OfficeName: 'Branch Office North',
        OfficeCode: 'BN',
        Address: '456 North Ave, North City',
        Phone: '+1-555-0456',
        Email: 'north@company.com'
    },
    {
        OfficeID: 3,
        OfficeName: 'Branch Office South',
        OfficeCode: 'BS',
        Address: '789 South Blvd, South City',
        Phone: '+1-555-0789',
        Email: 'south@company.com'
    }
];

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Mock API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/offices', (req, res) => {
    console.log('🏢 Mock: Fetching offices...');
    res.json({
        success: true,
        data: mockOffices,
        count: mockOffices.length
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Mock API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🏢 Offices endpoint: http://localhost:${PORT}/api/offices`);
});

export default app;