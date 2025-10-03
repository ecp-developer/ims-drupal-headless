import React, { useState, useEffect } from 'react';
import itemMasterService, { type ItemMaster, type ItemMasterStats } from '../services/itemMasterService';
import ItemMasterList from './ItemMasterList';
import ItemMasterForm from './ItemMasterForm';
import '../styles/DashboardItemMaster.css';

interface DashboardItemMasterProps {
  onNavigate: (view: string, itemId?: string) => void;
}

const DashboardItemMaster: React.FC<DashboardItemMasterProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<ItemMasterStats>({ total: 0, active: 0, inactive: 0 });
  const [recentItems, setRecentItems] = useState<ItemMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, items] = await Promise.all([
        itemMasterService.getItemMasterStats(),
        itemMasterService.getItemMasters()
      ]);
      
      setStats(statsData);
      // Get the 5 most recent items
      setRecentItems(items.slice(0, 5));
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
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Published Items</div>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">⏸️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.inactive}</div>
              <div className="stat-label">Unpublished Items</div>
            </div>
          </div>
        </div>

        {/* Recent Items Table */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Item Masters</h3>
            <button className="view-all-btn" onClick={() => setActiveTab('all')}>
              View All →
            </button>
          </div>

          {recentItems.length > 0 ? (
            <div className="table-container drupal-style">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="code-header">Item Code</th>
                    <th className="title-header">Title</th>
                    <th className="category-header">Category</th>
                    <th className="status-header">Status</th>
                    <th className="operations-header">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map((item) => (
                    <tr key={item.id} className="item-row">
                      <td className="code-cell">
                        <span className="item-code-badge">{item.item_code}</span>
                      </td>
                      <td className="title-cell">
                        <button 
                          className="item-title-link" 
                          onClick={() => onNavigate('item-master-view', item.id)}
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="category-cell">
                        {item.category_name ? (
                          <span className="category-badge">{item.category_name}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${item.status ? 'published' : 'unpublished'}`}>
                          {item.status ? 'Published' : 'Unpublished'}
                        </span>
                      </td>
                      <td className="operations-cell">
                        <div className="operations-dropdown">
                          <button 
                            className="edit-btn"
                            onClick={() => onNavigate('item-master-view', item.id)}
                          >
                            Edit
                          </button>
                          <button 
                            className="dropdown-toggle"
                            onClick={(e) => {
                              const menu = e.currentTarget.nextElementSibling;
                              menu?.classList.toggle('show');
                            }}
                          >
                            ▼
                          </button>
                          <div className="dropdown-menu">
                            <button onClick={() => onNavigate('item-master-view', item.id)}>View</button>
                            <button onClick={() => onNavigate('item-master-edit', item.id)}>Edit</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No items found. Create your first item master!</p>
              <button className="btn-primary" onClick={() => setActiveTab('create')}>
                + Create Item Master
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => setActiveTab('create')}>
            <span className="btn-icon">+</span>
            <div className="btn-content">
              <div className="btn-title">Add New Item</div>
              <div className="btn-subtitle">Create a new item master</div>
            </div>
          </button>
          <button className="action-btn secondary" onClick={() => setActiveTab('all')}>
            <span className="btn-icon">📋</span>
            <div className="btn-content">
              <div className="btn-title">View All Items</div>
              <div className="btn-subtitle">Browse complete inventory</div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'all':
        return <ItemMasterList onNavigate={onNavigate} initialFilter="all" />;
      case 'active':
        return <ItemMasterList onNavigate={onNavigate} initialFilter="active" />;
      case 'create':
        return <ItemMasterForm onNavigate={onNavigate} mode="create" onSuccess={() => {
          setActiveTab('dashboard');
          fetchData();
        }} />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="dashboard-item-master">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📦</span>
            Item Master Management
          </h1>
          <p className="dashboard-subtitle">Manage your inventory item masters</p>
        </div>
        {activeTab === 'dashboard' && (
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            🔄 Refresh
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span>
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">📦</span>
          All Items
        </button>
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="tab-icon">✅</span>
          Published Items
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className="tab-icon">+</span>
          Create New
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardItemMaster;
