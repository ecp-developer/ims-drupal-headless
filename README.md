# IMS - Inventory Management System (Drupal Headless)

Election Commission of Pakistan - Inventory Management System with Drupal 10 headless backend and React frontend.

## 🚀 Project Overview

This is a comprehensive Inventory Management System built with:
- **Backend**: Drupal 10 (Headless CMS) with JSON:API
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: MySQL (Drupal) + SQL Server (Legacy ERP Integration)

## 📦 Features

### Vendor Management Module
- ✅ Complete CRUD operations
- ✅ Dashboard with statistics
- ✅ Searchable vendor list with filters
- ✅ Taxonomy integration (Country, City)
- ✅ Professional tabbed interface
- ✅ Responsive design

### Upcoming Modules
- Stock Acquisition & Tenders
- Stock Issuance & Distribution
- Approval System & Workflow
- Analytics & Reports

## 🌿 Branch Structure

This repository follows a three-stage deployment strategy:

- **`development`** - Active development branch (default)
- **`testing`** - QA and testing environment
- **`production`** - Live production environment

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- CSS3 (Custom styling)

### Backend
- Drupal 10
- JSON:API
- RESTful Services
- DDEV (Local development)

## 📋 Prerequisites

- Node.js 18+
- PHP 8.1+
- Composer
- DDEV (for Drupal local development)
- Git

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ecp-developer/ims-drupal-headless.git
cd ims-drupal-headless
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup (Drupal)
```bash
ddev start
ddev composer install
ddev drush site:install
```

## 🌐 Environment Configuration

Create `.env` file in frontend directory:
```env
VITE_DRUPAL_BASE_URL=https://ims-drupal-headless.ddev.site
```

## 📂 Project Structure

```
ims-drupal-headless/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   └── types/         # TypeScript types
│   └── package.json
├── web/                   # Drupal root
├── vendor/               # Composer dependencies
└── composer.json
```

## 🔐 Authentication

The system uses CSRF token-based authentication for all write operations.

## 📝 Development Workflow

1. Create feature branch from `development`
2. Develop and test locally
3. Create pull request to `development`
4. After QA approval, merge to `testing`
5. After UAT approval, merge to `production`

## 👥 Team

**Election Commission of Pakistan - IT Department**

## 📄 License

Proprietary - Election Commission of Pakistan

## 🤝 Contributing

Internal development only. Contact IT department for access.

---

**Built with ❤️ for Election Commission of Pakistan**
