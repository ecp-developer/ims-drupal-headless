import React, { useState, useEffect } from 'react';
import categoryService, { type Category } from '../services/categoryService';
import '../styles/CategoryView.css';

interface CategoryViewProps {
  onNavigate: (view: string, categoryId?: string) => void;
  categoryId: string;
}

const CategoryView: React.FC<CategoryViewProps> = ({ onNavigate, categoryId }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryById(categoryId);
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      alert('Category deleted successfully!');
      onNavigate('category-dashboard');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading category details...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="error-container">
        <h2>Category Not Found</h2>
        <p>The requested category could not be found.</p>
        <button className="btn-primary" onClick={() => onNavigate('category-dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="category-view">
      {/* Header */}
      <div className="view-header">
        <div className="header-content">
          <h1 className="category-title">
            <span className="title-icon">📂</span>
            {category.name}
          </h1>
          <span className={`status-badge-large ${category.status ? 'active' : 'inactive'}`}>
            {category.status ? '✅ Active' : '⏸️ Inactive'}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn-back" onClick={() => onNavigate('category-dashboard')}>
            ← Back
          </button>
          <button className="btn-edit" onClick={() => onNavigate('category-edit', categoryId)}>
            ✏️ Edit
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="info-grid">
        {/* Basic Information Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>📋 Basic Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Category Name:</span>
              <span className="info-value">{category.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Description:</span>
              <span className="info-value">
                {category.description || <em className="text-muted">No description</em>}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${category.status ? 'active' : 'inactive'}`}>
                {category.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Hierarchy Information Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>🌳 Hierarchy</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Parent Category:</span>
              <span className="info-value">
                {category.parent_name ? (
                  <span className="parent-badge">{category.parent_name}</span>
                ) : (
                  <em className="text-muted">Root Category</em>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Weight (Order):</span>
              <span className="info-value">{category.weight || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Level:</span>
              <span className="info-value">
                {category.parent_id ? 'Subcategory' : 'Top Level'}
              </span>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>⚙️ System Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Category ID:</span>
              <span className="info-value mono">{category.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {category.created ? new Date(category.created).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Modified:</span>
              <span className="info-value">
                {category.changed ? new Date(category.changed).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description Section */}
      {category.description && category.description.length > 100 && (
        <div className="description-section">
          <h3>📝 Full Description</h3>
          <div className="description-content">
            {category.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
