import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

// GET all offices from tblOffices
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/offices');
        
        const pool = await getConnection();
        console.log('✅ Got database connection');
        
        // Query with correct column name
        const result = await pool.request().query('SELECT * FROM tblOffices ORDER BY strOfficeName');
        
        console.log(`✅ Query successful: ${result.recordset.length} offices found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/offices:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single office by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Request received for office ID: ${id}`);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM tblOffices WHERE OfficeID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Office not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
        
    } catch (error) {
        console.error('❌ Error in /api/offices/:id:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
