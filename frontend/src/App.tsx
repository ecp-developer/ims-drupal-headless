import { useState } from 'react';
import ContentList from './components/ContentList';
import DashboardVendors from './components/DashboardVendors';
import VendorList from './components/VendorList';
import VendorForm from './components/VendorForm';
import VendorView from './components/VendorView';
import DashboardCategories from './components/DashboardCategories';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import CategoryView from './components/CategoryView';
import DashboardItemMaster from './components/DashboardItemMaster';
import ItemMasterList from './components/ItemMasterList';
import ItemMasterForm from './components/ItemMasterForm';
import ItemMasterView from './components/ItemMasterView';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedItemMasterId, setSelectedItemMasterId] = useState<string | undefined>();
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [itemMasterFilter, setItemMasterFilter] = useState<string>('all');

  const handleNavigate = (view: string, vendorId?: string) => {
    setCurrentView(view);
    setSelectedVendorId(vendorId);
    setSelectedCategoryId(vendorId); // Can reuse for categories too
    setSelectedItemMasterId(vendorId); // Can reuse for item masters too
    
    // Set filter based on view
    if (view === 'vendor-list-active') {
      setVendorFilter('active');
      setCurrentView('vendor-list');
    } else if (view === 'vendor-list') {
      setVendorFilter('all');
    } else if (view === 'category-list-active') {
      setCategoryFilter('active');
      setCurrentView('category-list');
    } else if (view === 'category-list') {
      setCategoryFilter('all');
    } else if (view === 'item-master-list-active') {
      setItemMasterFilter('active');
      setCurrentView('item-master-list');
    } else if (view === 'item-master-list') {
      setItemMasterFilter('all');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'vendor-dashboard':
        return <DashboardVendors onNavigate={handleNavigate} />;
      case 'vendor-list':
        return <VendorList onNavigate={handleNavigate} initialFilter={vendorFilter} />;
      case 'vendor-view':
        return selectedVendorId ? (
          <VendorView onNavigate={handleNavigate} vendorId={selectedVendorId} />
        ) : (
          <div>No vendor selected</div>
        );
      case 'vendor-create':
        return <VendorForm onNavigate={handleNavigate} mode="create" />;
      case 'vendor-edit':
        return <VendorForm onNavigate={handleNavigate} mode="edit" vendorId={selectedVendorId} />;
      
      // Category routes
      case 'category-dashboard':
        return <DashboardCategories onNavigate={handleNavigate} />;
      case 'category-list':
        return <CategoryList onNavigate={handleNavigate} initialFilter={categoryFilter} />;
      case 'category-view':
        return selectedCategoryId ? (
          <CategoryView onNavigate={handleNavigate} categoryId={selectedCategoryId} />
        ) : (
          <div>No category selected</div>
        );
      case 'category-create':
        return <CategoryForm onNavigate={handleNavigate} mode="create" />;
      case 'category-edit':
        return <CategoryForm onNavigate={handleNavigate} mode="edit" categoryId={selectedCategoryId} />;
      
      // Item Master routes
      case 'item-master-dashboard':
        return <DashboardItemMaster onNavigate={handleNavigate} />;
      case 'item-master-list':
        return <ItemMasterList onNavigate={handleNavigate} initialFilter={itemMasterFilter} />;
      case 'item-master-view':
        return selectedItemMasterId ? (
          <ItemMasterView onNavigate={handleNavigate} itemId={selectedItemMasterId} />
        ) : (
          <div>No item selected</div>
        );
      case 'item-master-create':
        return <ItemMasterForm onNavigate={handleNavigate} mode="create" />;
      case 'item-master-edit':
        return <ItemMasterForm onNavigate={handleNavigate} mode="edit" itemId={selectedItemMasterId} />;
      
      case 'dashboard':
      default:
        return (

          <div className="modules-grid">
            {/* IMS Module */}
            <div className="module-card teal">
              <div className="module-header">
                <div className="module-info">
                  <h3>IMS</h3>
                  <p>Inventory Management System</p>
                </div>
                <div className="module-icon teal">📦</div>
              </div>
              <div className="module-description">
                Complete inventory tracking and management
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Stock Acquisition */}
            <div className="module-card red">
              <div className="module-header">
                <div className="module-info">
                  <h3>Stock Acquisition</h3>
                  <p>Procurement & Tenders</p>
                </div>
                <div className="module-icon red">📄</div>
              </div>
              <div className="module-description">
                Manage stock acquisitions and tenders
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Stock Issuance */}
            <div className="module-card orange">
              <div className="module-header">
                <div className="module-info">
                  <h3>Stock Issuance</h3>
                  <p>Issue & Distribution</p>
                </div>
                <div className="module-icon orange">📤</div>
              </div>
              <div className="module-description">
                Handle stock issuance requests and approvals
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Approval System */}
            <div className="module-card green">
              <div className="module-header">
                <div className="module-info">
                  <h3>Approval System</h3>
                  <p>Workflow Management</p>
                </div>
                <div className="module-icon green">✅</div>
              </div>
              <div className="module-description">
                Manage pending approvals and forwarding
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Analytics */}
            <div className="module-card purple">
              <div className="module-header">
                <div className="module-info">
                  <h3>Analytics</h3>
                  <p>Reports & Insights</p>
                </div>
                <div className="module-icon purple">📊</div>
              </div>
              <div className="module-description">
                View detailed reports and analytics
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Vendor Management - Clickable */}
            <div className="module-card orange" onClick={() => setCurrentView('vendor-dashboard')} style={{ cursor: 'pointer' }}>
              <div className="module-header">
                <div className="module-info">
                  <h3>Vendor Management</h3>
                  <p>Manage Vendors</p>
                </div>
                <div className="module-icon orange">🏢</div>
              </div>
              <div className="module-description">
                Manage vendor information and contacts
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Category Management - Clickable */}
            <div className="module-card blue" onClick={() => setCurrentView('category-dashboard')} style={{ cursor: 'pointer' }}>
              <div className="module-header">
                <div className="module-info">
                  <h3>Category Management</h3>
                  <p>Organize Categories</p>
                </div>
                <div className="module-icon blue">📂</div>
              </div>
              <div className="module-description">
                Manage IMS categories and hierarchies
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Item Master Management - Clickable */}
            <div className="module-card teal" onClick={() => setCurrentView('item-master-dashboard')} style={{ cursor: 'pointer' }}>
              <div className="module-header">
                <div className="module-info">
                  <h3>Item Master</h3>
                  <p>Inventory Items</p>
                </div>
                <div className="module-icon teal">📦</div>
              </div>
              <div className="module-description">
                Manage item masters and inventory catalog
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>

            {/* Drupal Content - Articles */}
            <div className="module-card teal">
              <div className="module-header">
                <div className="module-info">
                  <h3>Articles</h3>
                  <p>Drupal Content</p>
                </div>
                <div className="module-icon teal">📰</div>
              </div>
              <ContentList contentType="article" />
            </div>

            {/* Notifications */}
            <div className="module-card blue">
              <div className="module-header">
                <div className="module-info">
                  <h3>Notifications</h3>
                  <p>Alert Management</p>
                </div>
                <div className="module-icon blue">🔔</div>
              </div>
              <div className="module-description">
                View system notifications and alerts
              </div>
              <div className="module-arrow">
                <span className="arrow-icon">→</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📦
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '2px' }}>
                ELECTION COMMISSION OF PAKISTAN
              </div>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            My Dashboard
          </button>
          <button 
            className={`nav-item ${currentView === 'vendor-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('vendor-dashboard')}
          >
            <span className="nav-icon">🏢</span>
            Vendor Management
          </button>
          <button 
            className={`nav-item ${currentView === 'category-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('category-dashboard')}
          >
            <span className="nav-icon">📂</span>
            Category Management
          </button>
          <button 
            className={`nav-item ${currentView === 'item-master-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('item-master-dashboard')}
          >
            <span className="nav-icon">📦</span>
            Item Master
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1 className="header-title">
              {currentView === 'vendors' ? 'Vendor Management' : 
               currentView === 'offices' ? 'Office Management (SQL Server)' : 
               'Inventory Management System'}
            </h1>
          </div>
          
          <div className="header-right">
            <button className="header-button">
              🔔
              <span className="notification-badge">9+</span>
            </button>
            <button className="header-button">✉️</button>
            <button className="header-button">🌙</button>
            
            <button className="export-button">
              <span>⬇️</span>
              Export Data
            </button>
            
            <div className="user-menu">
              <div className="user-info">
                <div className="user-name">Test Administrator</div>
                <div className="user-role">Admin (IMS)</div>
              </div>
              <div className="user-avatar">T</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {currentView === 'dashboard' && (
            <div className="dashboard-header">
              <h2 className="dashboard-title">
                <div className="dashboard-title-icon">📦</div>
                My IMS Dashboard
              </h2>
              <p className="dashboard-subtitle">Welcome back, Test Administrator</p>
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;

// Add this import at the top
// import VendorTest from './components/VendorTest';

// Add this component inside the vendor management view before the form
// <VendorTest />
