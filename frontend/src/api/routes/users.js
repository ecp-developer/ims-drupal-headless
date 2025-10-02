import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

// GET all users from AspNetUser
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/users');
        
        const pool = await getConnection();
        console.log('✅ Got database connection');
        
        // Query all users
        const result = await pool.request().query('SELECT * FROM AspNetUser');
        
        console.log(`✅ Query successful: ${result.recordset.length} users found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Request received for user ID: ${id}`);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM AspNetUser WHERE Id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
        
    } catch (error) {
        console.error('❌ Error in /api/users/:id:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET users by username (search)
router.get('/search/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`🔍 Searching for username: ${username}`);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', `%${username}%`)
            .query('SELECT * FROM AspNetUser WHERE UserName LIKE @username');
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error searching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
