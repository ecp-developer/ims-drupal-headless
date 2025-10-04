import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

// GET all records from DEC_MST
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/dec-mst');
        
        const pool = await getConnection();
        console.log('✅ Got database connection');
        
        // Query the view to get unique DECs only
        const result = await pool.request().query('SELECT * FROM vw_UniqueDECs ORDER BY DECName');
        
        console.log(`✅ Query successful: ${result.recordset.length} unique DECs found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/dec-mst:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single record by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Request received for DEC_MST ID: ${id}`);
        
        const pool = await getConnection();
        
        // First query to check column names - replace 'Id' with actual primary key column
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM DEC_MST WHERE Id = @id'); // Adjust column name as needed
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Record not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
        
    } catch (error) {
        console.error('❌ Error in /api/dec-mst/:id:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
