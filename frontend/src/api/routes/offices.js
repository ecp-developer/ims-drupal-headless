import express from 'express';
import { connectDB, getPoolStatus, sql } from '../config/database.js';

const router = express.Router();

// GET all offices
router.get('/', async (req, res) => {
    let pool;
    try {
        console.log('🏢 Fetching offices from SQL Server...');
        console.log('📊 Pool status before connect:', getPoolStatus());
        
        pool = await connectDB();
        
        console.log('✅ Pool connected:', pool.connected);
        console.log('📊 Pool status after connect:', getPoolStatus());
        
        const result = await pool.request()
            .query('SELECT * FROM tblOffices ORDER BY strOfficeName');
        
        console.log('✅ Found', result.recordset.length, 'offices');
        
        res.json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('❌ Error fetching offices:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Pool status on error:', getPoolStatus());
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.name
        });
    }
});

// GET office by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        
        const result = await pool.request()
            .input('officeId', sql.Int, id)
            .query('SELECT * FROM tblOffices WHERE OfficeID = @officeId');
        
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
        console.error('❌ Error fetching office:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
