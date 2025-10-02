import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService-new';
import VendorList from './VendorList';
import VendorForm from './VendorForm';
import '../styles/DashboardVendors.css';

interface DashboardVendorsProps {
  onNavigate?: (view: string, vendorId?: string) => void;
}

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  recentCount: number;
}

interface RecentVendor {
  id: string;
  name: string;
  code: string;
  created: string;
  status: boolean;
}

type TabType = 'dashboard' | 'all-vendors' | 'active-vendors' | 'create-vendor';

const DashboardVendors: React.FC<DashboardVendorsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const handleNavigate = (view: string, id?: string) => {
    if (onNavigate) {
      onNavigate(view, id);
    }
  };
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    inactive: 0,
    recentCount: 0,
  });
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsData = await vendorService.getVendorStats();
      setStats(statsData);
      
      // Load recent vendors (last 5)
      const response = await vendorService.getVendors({ page: 1, pageSize: 5 });
      console.log('📊 Dashboard vendors response:', response);
      
      const recent = response.data?.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.title,  // Already transformed
        code: vendor.vendorCode,  // Already transformed
        created: vendor.created,  // Already transformed
        status: vendor.status,  // Already transformed
      })) || [];
      
      console.log('✅ Recent vendors:', recent);
      setRecentVendors(recent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Vendors</h3>
                  <p className="stat-number">{stats.total}</p>
                </div>
              </div>

              <div className="stat-card active">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Active</h3>
                  <p className="stat-number">{stats.active}</p>
                </div>
              </div>

              <div className="stat-card inactive">
                <div className="stat-icon">⏸️</div>
                <div className="stat-content">
                  <h3>Inactive</h3>
                  <p className="stat-number">{stats.inactive}</p>
                </div>
              </div>

              <div className="stat-card recent">
                <div className="stat-icon">🆕</div>
                <div className="stat-content">
                  <h3>Recent (7 days)</h3>
                  <p className="stat-number">{stats.recentCount}</p>
                </div>
              </div>
            </div>

            {/* Recent Vendors */}
            <div className="recent-vendors">
              <div className="section-header">
                <h2>Recent Vendors</h2>
                <button 
                  className="link-btn"
                  onClick={() => setActiveTab('all-vendors')}
                >
                  View All →
                </button>
              </div>

              {recentVendors.length === 0 ? (
                <div className="empty-state">
                  <p>No vendors found. Create your first vendor to get started!</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('create-vendor')}
                  >
                    Create Vendor
                  </button>
                </div>
              ) : (
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Vendor Code</th>
                      <th>Vendor Name</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td><code>{vendor.code}</code></td>
                        <td><strong>{vendor.name}</strong></td>
                        <td>{formatDate(vendor.created)}</td>
                        <td>
                          <span className={`badge ${vendor.status ? 'badge-success' : 'badge-inactive'}`}>
                            {vendor.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-inline">
                            <button
                              className="btn-sm btn-view"
                              onClick={() => handleNavigate('vendor-view', vendor.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="btn-sm btn-edit"
                              onClick={() => handleNavigate('vendor-edit', vendor.id)}
                              title="Edit Vendor"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );
      
      case 'all-vendors':
        return <VendorList onNavigate={handleNavigate} initialFilter="all" />;
      
      case 'active-vendors':
        return <VendorList onNavigate={handleNavigate} initialFilter="active" />;
      
      case 'create-vendor':
        return <VendorForm onNavigate={handleNavigate} mode="create" />;
      
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Vendor Management</h1>
            <p>Manage your vendor database efficiently</p>
          </div>
          {activeTab === 'dashboard' && (
            <button
              className="refresh-btn"
              onClick={loadDashboardData}
              title="Refresh Dashboard Data"
            >
              <span className="refresh-icon">🔄</span>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span>
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'all-vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-vendors')}
        >
          <span className="tab-icon">📋</span>
          All Vendors
        </button>
        <button
          className={`tab-btn ${activeTab === 'active-vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('active-vendors')}
        >
          <span className="tab-icon">✅</span>
          Active Vendors
        </button>
        <button
          className={`tab-btn ${activeTab === 'create-vendor' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-vendor')}
        >
          <span className="tab-icon">➕</span>
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

export default DashboardVendors;
