import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService-new';
import '../styles/VendorView.css';

interface VendorViewProps {
  onNavigate: (view: string, vendorId?: string) => void;
  vendorId: string;
}

interface VendorDetails {
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

const VendorView: React.FC<VendorViewProps> = ({ onNavigate, vendorId }) => {
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorById(vendorId);
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      alert('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorService.deleteVendor(vendorId);
      alert('Vendor deleted successfully!');
      onNavigate('vendor-list');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  if (loading) {
    return (
      <div className="vendor-view-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="vendor-view-container">
        <div className="error-state">
          <p>Vendor not found</p>
          <button onClick={() => onNavigate('vendor-list')} className="btn-primary">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1>{vendor.title}</h1>
          <p className="vendor-code-badge">
            <code>{vendor.vendorCode}</code>
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => onNavigate('vendor-edit', vendorId)}
            className="btn-primary"
          >
            ✏️ Edit Vendor
          </button>
          <button 
            onClick={handleDelete}
            className="btn-danger"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="status-section">
        <span className={`status-badge ${vendor.status ? 'active' : 'inactive'}`}>
          {vendor.status ? '✓ Active' : '✗ Inactive'}
        </span>
        <span className="created-date">
          Created: {new Date(vendor.created).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Details Cards */}
      <div className="details-grid">
        {/* Contact Information */}
        <div className="detail-card">
          <h2>📞 Contact Information</h2>
          <div className="detail-row">
            <span className="detail-label">Contact Person:</span>
            <span className="detail-value">{vendor.contactPerson || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">
              {vendor.email ? (
                <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
              ) : '-'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              {vendor.phone ? (
                <a href={`tel:${vendor.phone}`}>{vendor.phone}</a>
              ) : '-'}
            </span>
          </div>
        </div>

        {/* Location Information */}
        <div className="detail-card">
          <h2>📍 Location Information</h2>
          <div className="detail-row">
            <span className="detail-label">Country:</span>
            <span className="detail-value">{vendor.country || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">City:</span>
            <span className="detail-value">{vendor.city || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address:</span>
            <span className="detail-value">{vendor.address || '-'}</span>
          </div>
        </div>

        {/* Business Information */}
        <div className="detail-card">
          <h2>💼 Business Information</h2>
          <div className="detail-row">
            <span className="detail-label">Tax Number:</span>
            <span className="detail-value">{vendor.taxNumber || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Vendor Code:</span>
            <span className="detail-value">
              <code>{vendor.vendorCode}</code>
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="view-actions">
        <button 
          onClick={() => onNavigate('vendor-list')}
          className="btn-secondary"
        >
          ← Back to List
        </button>
        <button 
          onClick={() => onNavigate('vendor-dashboard')}
          className="btn-secondary"
        >
          📊 Dashboard
        </button>
      </div>
    </div>
  );
};

export default VendorView;
