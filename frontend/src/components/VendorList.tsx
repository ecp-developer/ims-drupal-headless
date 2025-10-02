import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService-new';
import '../styles/VendorList.css';

interface VendorListProps {
  onNavigate: (view: string, vendorId?: string) => void;
  initialFilter?: string;
}

interface Vendor {
  id: string;
  vendorCode: string;
  title: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  country: string;
  city: string;
  status: boolean;
  created: string;
}

const VendorList: React.FC<VendorListProps> = ({ onNavigate, initialFilter = 'all' }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, statusFilter, sortField, sortOrder]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        pageSize: 10,
        sort: sortOrder === 'desc' ? `-${sortField}` : sortField
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter === 'active';
      }

      console.log('📋 Fetching vendors with filters:', filters);
      const response = await vendorService.getVendors(filters);
      console.log('✅ Vendors response:', response);
      
      setVendors(response.data || []);
      
      // Calculate total pages from meta data
      if (response.meta?.count) {
        const total = response.meta.count;
        const limit = filters.pageSize || 10;
        setTotalPages(Math.ceil(total / limit));
      } else {
        // Fallback if no meta
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchVendors();
      return;
    }

    try {
      setLoading(true);
      const response = await vendorService.searchVendors(searchTerm);
      setVendors(response.data);
      setTotalPages(1);
    } catch (error) {
      console.error('Error searching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map(v => v.id));
    }
  };

  const handleDelete = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorService.deleteVendor(vendorId);
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedVendors.length} vendor(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedVendors.map(id => vendorService.deleteVendor(id)));
      setSelectedVendors([]);
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendors:', error);
      alert('Failed to delete some vendors');
    }
  };

  return (
    <div className="vendor-list-container">
      {/* Header */}
      <div className="list-header">
        <div>
          <h1>Vendor Management</h1>
          <p>Manage your vendor database</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => onNavigate('vendor-create')}
        >
          <span className="btn-icon">➕</span>
          Add New Vendor
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search vendors by name, code, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">
            🔍 Search
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={() => onNavigate('vendor-dashboard')} className="btn-secondary">
            📊 Dashboard
          </button>

          {selectedVendors.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-danger">
              🗑️ Delete Selected ({selectedVendors.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="empty-state">
            <p>No vendors found</p>
            <button 
              className="btn-primary"
              onClick={() => onNavigate('vendor-create')}
            >
              Add Your First Vendor
            </button>
          </div>
        ) : (
          <table className="vendor-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.length === vendors.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('field_vendor_code')} style={{ cursor: 'pointer' }}>
                  Vendor Code {sortField === 'field_vendor_code' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                  Vendor Name {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Status</th>
                <th onClick={() => handleSort('created')} style={{ cursor: 'pointer' }}>
                  Created {sortField === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={() => handleSelectVendor(vendor.id)}
                    />
                  </td>
                  <td>
                    <code className="vendor-code">{vendor.vendorCode}</code>
                  </td>
                  <td>
                    <strong>{vendor.title}</strong>
                  </td>
                  <td>{vendor.contactPerson || '-'}</td>
                  <td>{vendor.email || '-'}</td>
                  <td>{vendor.phone || '-'}</td>
                  <td>{vendor.country || '-'}</td>
                  <td>
                    <span className={`badge ${vendor.status ? 'badge-success' : 'badge-inactive'}`}>
                      {vendor.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(vendor.created).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onNavigate('vendor-view', vendor.id)}
                        className="btn-icon-action"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => onNavigate('vendor-edit', vendor.id)}
                        className="btn-icon-action"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="btn-icon-action btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && vendors.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-secondary"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorList;
