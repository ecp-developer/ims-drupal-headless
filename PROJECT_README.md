# IMS Drupal Headless Project

This project combines a Drupal backend with a React frontend for a headless CMS architecture.

## Project Structure

```
ims-drupal-headless/
├── web/                    # Drupal 10 backend
│   ├── core/              # Drupal core files
│   ├── modules/           # Custom and contributed modules
│   ├── sites/             # Site configuration
│   └── themes/            # Drupal themes
├── frontend/               # React frontend application
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   ├── public/            # Static assets
│   └── dist/              # Built frontend files
├── vendor/                 # Composer dependencies
└── composer.json          # PHP dependencies
```

## Prerequisites

- PHP 8.1 or higher
- Node.js 18 or higher
- npm or yarn
- Composer
- MySQL/MariaDB or PostgreSQL
- Web server (Apache/Nginx) or DDEV/Lando

## Installation & Setup

### Backend (Drupal)

1. **Install Drupal dependencies:**
   ```bash
   composer install
   ```

2. **Set up your database and configure Drupal:**
   - Copy `web/sites/default/default.settings.php` to `web/sites/default/settings.php`
   - Configure your database connection in `settings.php`
   - Install Drupal via web interface or drush

3. **Enable required modules for headless setup:**
   ```bash
   cd web
   ../vendor/bin/drush en jsonapi cors hal serialization -y
   ```

4. **Configure CORS (Cross-Origin Resource Sharing):**
   Add to your `settings.php`:
   ```php
   $settings['cors_allowed_headers'] = ['x-csrf-token','authorization','content-type','accept','origin','x-requested-with', 'access-control-allow-origin','x-allowed-header','*'];
   ```

### Frontend (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your Drupal site URL.

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

### Running Both Services

1. **Start Drupal backend:**
   ```bash
   # If using built-in PHP server
   cd web && php -S localhost:8080
   
   # Or configure your web server to serve the web/ directory
   ```

2. **Start React frontend:**
   ```bash
   cd frontend && npm run dev
   ```

The React app will be available at `http://localhost:3000` and will proxy API requests to the Drupal backend.

## API Integration

### Drupal JSON:API

This project uses Drupal's JSON:API module for data exchange. Key endpoints:

- **Articles:** `/jsonapi/node/article`
- **Pages:** `/jsonapi/node/page`
- **Users:** `/jsonapi/user/user`

### React API Service

The frontend includes a configured API service (`src/services/apiService.js`) with methods for:
- `getContent(contentType)` - Fetch content by type
- `getContentById(contentType, id)` - Fetch specific content
- `createContent(contentType, data)` - Create new content
- `updateContent(contentType, id, data)` - Update existing content
- `deleteContent(contentType, id)` - Delete content

### Example Usage

```javascript
import { apiService } from './services/apiService';

// Fetch all articles
const articles = await apiService.getContent('article');

// Fetch specific article with related data
const article = await apiService.getContentById('article', 'uuid', ['field_image', 'uid']);
```

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

### Drupal

Configure your web server to serve the `web/` directory as the document root.

## Drupal Configuration for Headless

### Required Modules

- **JSON:API** - Core API functionality
- **CORS** - Cross-origin resource sharing
- **HAL** - Hypertext Application Language
- **Serialization** - Data serialization

### Permissions

Ensure anonymous users have permission to:
- Access GET to JSON:API
- View published content

### Content Types

Create your content types in Drupal and they'll be automatically available via JSON:API at:
`/jsonapi/node/{content-type-machine-name}`

## Security Considerations

1. **CORS Configuration:** Properly configure CORS for production
2. **Authentication:** Implement proper authentication for write operations
3. **Permissions:** Set appropriate permissions for API access
4. **Rate Limiting:** Consider implementing rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors:** Ensure CORS is properly configured in Drupal
2. **API 404 Errors:** Check that JSON:API module is enabled
3. **Permission Denied:** Verify user permissions for content access

### Debugging

- Enable Drupal debug mode for detailed error messages
- Use browser dev tools Network tab to inspect API requests
- Check Drupal logs for backend errors

## Contributing

1. Create feature branches for new development
2. Test both frontend and backend changes
3. Update documentation for new features
4. Ensure API changes are backward compatible

## Additional Resources

- [Drupal JSON:API Documentation](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)