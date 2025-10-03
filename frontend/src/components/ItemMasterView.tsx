import React, { useState, useEffect } from 'react';
import itemMasterService, { type ItemMaster } from '../services/itemMasterService';
import '../styles/ItemMasterView.css';

interface ItemMasterViewProps {
  onNavigate: (view: string, itemId?: string) => void;
  itemId: string;
}

const ItemMasterView: React.FC<ItemMasterViewProps> = ({ onNavigate, itemId }) => {
  const [item, setItem] = useState<ItemMaster | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await itemMasterService.getItemMasterById(itemId);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await itemMasterService.deleteItemMaster(itemId);
        alert('Item deleted successfully!');
        onNavigate('item-master-dashboard');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="error-container">
        <h2>Item Not Found</h2>
        <p>The requested item could not be found.</p>
        <button className="btn-back" onClick={() => onNavigate('item-master-dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="item-master-view">
      {/* Header */}
      <div className="view-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => onNavigate('item-master-dashboard')}>
            ← Back
          </button>
          <div className="header-title">
            <h1>{item.title}</h1>
            <span className={`status-badge ${item.status ? 'published' : 'unpublished'}`}>
              {item.status ? 'Published' : 'Unpublished'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-edit" onClick={() => onNavigate('item-master-edit', itemId)}>
            ✏️ Edit
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Content Cards */}
      <div className="view-content">
        {/* Basic Information */}
        <div className="info-card">
          <h2 className="card-title">
            <span className="card-icon">📋</span>
            Basic Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Title</span>
              <span className="info-value">{item.title}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Item Code</span>
              <span className="info-value">
                <span className="code-badge">{item.item_code}</span>
              </span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Specifications</span>
              <span className="info-value">
                {item.specifications || <span className="text-muted">No specifications provided</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="info-card">
          <h2 className="card-title">
            <span className="card-icon">📂</span>
            Classification
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Category</span>
              <span className="info-value">
                {item.category_name ? (
                  <span className="category-badge">{item.category_name}</span>
                ) : (
                  <span className="text-muted">No category assigned</span>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Unit of Measure</span>
              <span className="info-value">
                {item.unit_of_measure_name ? (
                  <span className="uom-badge">{item.unit_of_measure_name}</span>
                ) : (
                  <span className="text-muted">No unit assigned</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="info-card">
          <h2 className="card-title">
            <span className="card-icon">ℹ️</span>
            System Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Created</span>
              <span className="info-value">
                {item.created ? new Date(item.created).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Modified</span>
              <span className="info-value">
                {item.changed ? new Date(item.changed).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value">
                <span className={`status-badge ${item.status ? 'published' : 'unpublished'}`}>
                  {item.status ? 'Published' : 'Unpublished'}
                </span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Item ID</span>
              <span className="info-value text-muted">{item.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterView;
