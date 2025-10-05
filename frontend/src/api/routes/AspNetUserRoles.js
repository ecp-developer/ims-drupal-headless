import express from 'express';
import { getConnection } from '../db.js';

const router = express.Router();

/**
 * GET /api/aspnet-user-roles
 * ASP.NET User Roles from Database
 * Returns data from vw_AspNetUserRoles
 */
router.get('/', async (req, res) => {
    try {
        console.log('📊 Request received for /api/aspnet-user-roles');
        
        const pool = await getConnection();
        
        // Query the view - returns all active users with their roles
        const result = await pool.request().query(`
            SELECT Id, FullName, CNIC, UserName, Email, PasswordHash, Password, ISACT, Role, Gender
            FROM vw_AspNetUserRoles
            WHERE ISACT = 1
            ORDER BY UserName, Role
        `);
        
        console.log(`✅ Query successful: ${result.recordset.length} records found`);
        
        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('❌ Error in /api/aspnet-user-roles:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/aspnet-user-roles/user/:userId
 * Get all roles for a specific user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`📊 Request received for /api/aspnet-user-roles/user/${userId}`);
        
        const pool = await getConnection();
        
        // Query by Id column
        const result = await pool.request()
            .input('userId', userId)
            .query(`
                SELECT Id, FullName, CNIC, UserName, Email, Role, Gender, ISACT
                FROM vw_AspNetUserRoles
                WHERE Id = @userId AND ISACT = 1
                ORDER BY Role
            `);
        
        console.log(`✅ Query successful: ${result.recordset.length} record(s) found for user ${userId}`);
        
        res.json({
            success: true,
            userId: userId,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error(`❌ Error fetching roles for user ${req.params.userId}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/aspnet-user-roles/role/:roleName
 * Get all users with a specific role
 */
router.get('/role/:roleName', async (req, res) => {
    try {
        const { roleName } = req.params;
        console.log(`📊 Request received for /api/aspnet-user-roles/role/${roleName}`);
        
        const pool = await getConnection();
        
        // Query by Role column
        const result = await pool.request()
            .input('roleName', roleName)
            .query(`
                SELECT Id, FullName, CNIC, UserName, Email, Role, Gender, ISACT
                FROM vw_AspNetUserRoles
                WHERE Role = @roleName AND ISACT = 1
                ORDER BY UserName
            `);
        
        console.log(`✅ Query successful: ${result.recordset.length} users found with role ${roleName}`);
        
        res.json({
            success: true,
            roleName: roleName,
            count: result.recordset.length,
            data: result.recordset
        });
        
    } catch (error) {
        console.error(`❌ Error fetching users for role ${req.params.roleName}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
