import React, { useState, useEffect } from 'react';
import categoryService, { type Category, type CategoryStats } from '../services/categoryService';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import '../styles/DashboardCategories.css';

interface DashboardCategoriesProps {
  onNavigate: (view: string, categoryId?: string) => void;
}

const DashboardCategories: React.FC<DashboardCategoriesProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CategoryStats>({ total: 0, active: 0, inactive: 0 });
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, categories] = await Promise.all([
        categoryService.getCategoryStats(),
        categoryService.getCategories()
      ]);
      
      setStats(statsData);
      // Get the 5 most recent categories
      setRecentCategories(categories.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      );
    }

    return (
      <div className="dashboard-stats-section">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">📂</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Categories</div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active Categories</div>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">⏸️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.inactive}</div>
              <div className="stat-label">Inactive Categories</div>
            </div>
          </div>
        </div>

        {/* Recent Categories Table */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Categories</h3>
            <button className="view-all-btn" onClick={() => setActiveTab('all')}>
              View All →
            </button>
          </div>

          {recentCategories.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Parent</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <button 
                          className="category-name-link" 
                          onClick={() => onNavigate('category-view', category.id)}
                        >
                          {category.name}
                        </button>
                      </td>
                      <td>
                        {category.description ? (
                          <span className="category-description-preview">
                            {category.description.length > 50 
                              ? `${category.description.substring(0, 50)}...` 
                              : category.description
                            }
                          </span>
                        ) : (
                          <span className="text-muted">No description</span>
                        )}
                      </td>
                      <td>
                        {category.parent_name ? (
                          <span className="parent-badge">{category.parent_name}</span>
                        ) : (
                          <span className="text-muted">Root</span>
                        )}
                      </td>
                      <td>{category.weight || 0}</td>
                      <td>
                        <span className={`status-badge ${category.status ? 'active' : 'inactive'}`}>
                          {category.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            onClick={() => onNavigate('category-view', category.id)}
                            title="View"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => onNavigate('category-edit', category.id)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Categories Yet</h3>
              <p>Create your first category to get started</p>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('create')}
              >
                Create First Category
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'all':
        return <CategoryList onNavigate={onNavigate} initialFilter="all" />;
      case 'active':
        return <CategoryList onNavigate={onNavigate} initialFilter="active" />;
      case 'create':
        return <CategoryForm onNavigate={onNavigate} mode="create" onSuccess={() => {
          setActiveTab('dashboard');
          fetchData();
        }} />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="dashboard-categories">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📂</span>
            Category Management
          </h1>
          <p className="dashboard-subtitle">Manage your IMS categories and hierarchies</p>
        </div>
        {activeTab === 'dashboard' && (
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            🔄 Refresh
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📂 All Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          ✅ Active Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create New
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardCategories;
