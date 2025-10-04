import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

// GET all wings from WingsInformation
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/wings');
        
        const pool = await getConnection();
        console.log('✅ Got database connection');
        
        // Query the view to get unique Wings only
        const result = await pool.request().query('SELECT * FROM vw_UniqueWings ORDER BY Name');
        
        console.log(`✅ Query successful: ${result.recordset.length} unique wings found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/wings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single wing by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Request received for wing ID: ${id}`);
        
        const pool = await getConnection();
        
        // Adjust the column name based on your actual primary key
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM WingsInformation WHERE WingId = @id'); // Adjust column name as needed
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Wing not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
        
    } catch (error) {
        console.error('❌ Error in /api/wings/:id:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET wings by status (if there's an active/inactive field)
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const isActive = status.toLowerCase() === 'active';
        console.log(`🔍 Filtering wings by status: ${status}`);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('isActive', isActive)
            .query('SELECT * FROM WingsInformation WHERE IsActive = @isActive'); // Adjust column name
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error filtering wings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
