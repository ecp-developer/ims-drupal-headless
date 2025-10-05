import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

/**
 * GET /api/AspNetUsers
 * ASP Net Users from DS
 * Returns data from vw_AspNetUsers
 */
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/AspNetUsers');
        
        const pool = await getConnection();
        
        // TODO: Customize your query as needed
        const result = await pool.request().query(`
            SELECT *
            FROM vw_AspNetUsers
            ORDER BY 1
        `);
        
        console.log(`✅ Query successful: ${result.recordset.length} records found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/AspNetUsers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/AspNetUsers/:id
 * Get single record by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Request received for /api/AspNetUsers/${id}`);
        
        const pool = await getConnection();
        
        // TODO: Adjust the ID column name as needed
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT *
                FROM vw_AspNetUsers
                WHERE id = @id
            `);
        
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
        console.error(`❌ Error fetching record ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
