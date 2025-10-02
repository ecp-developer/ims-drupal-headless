# SQL Server API Test Commands

## Health Check
curl http://localhost:3001/api/health

## Offices API
# Get all offices
curl http://localhost:3001/api/offices

# Get office by ID
curl http://localhost:3001/api/offices/583

## Users API (AspNetUser)
# Get all users
curl http://localhost:3001/api/users

# Get user by ID
curl http://localhost:3001/api/users/YOUR_USER_ID

# Search users by username
curl http://localhost:3001/api/users/search/admin

## DEC_MST API
# Get all DEC_MST records
curl http://localhost:3001/api/dec-mst

# Get DEC_MST by ID
curl http://localhost:3001/api/dec-mst/1

## Wings API (WingsInformation)
# Get all wings
curl http://localhost:3001/api/wings

# Get wing by ID
curl http://localhost:3001/api/wings/1

# Get active/inactive wings
curl http://localhost:3001/api/wings/status/active
curl http://localhost:3001/api/wings/status/inactive

## Notes:
- Replace IDs with actual IDs from your database
- All endpoints return JSON format
- Error responses include error messages
