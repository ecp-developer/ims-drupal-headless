import React, { useState, useEffect } from 'react';
import categoryService, { type Category, type CategoryFormData } from '../services/categoryService';
import '../styles/CategoryForm.css';

interface CategoryFormProps {
  onNavigate: (view: string, categoryId?: string) => void;
  mode: 'create' | 'edit';
  categoryId?: string;
  onSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onNavigate, mode, categoryId, onSuccess }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    weight: 0,
    status: true,
    parent_id: undefined,
  });
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchParentCategories();
    
    if (mode === 'edit' && categoryId) {
      fetchCategory();
    }
  }, [mode, categoryId]);

  const fetchParentCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      // Filter out the current category if editing (to prevent circular references)
      const filteredCategories = mode === 'edit' && categoryId
        ? categories.filter(cat => cat.id !== categoryId)
        : categories;
      setParentCategories(filteredCategories);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchCategory = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      const category = await categoryService.getCategoryById(categoryId);
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || '',
          weight: category.weight || 0,
          status: category.status,
          parent_id: category.parent_id,
        });
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (mode === 'create') {
        await categoryService.createCategory(formData);
        alert('Category created successfully!');
      } else if (mode === 'edit' && categoryId) {
        await categoryService.updateCategory(categoryId, formData);
        alert('Category updated successfully!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('category-dashboard');
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to ${mode} category: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="category-form-container">
      <div className="form-header">
        <h2>{mode === 'create' ? '➕ Create New Category' : '✏️ Edit Category'}</h2>
        <button className="btn-back" onClick={() => onNavigate('category-dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Category Name <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={errors.name ? 'error' : ''}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter category name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter category description (optional)"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Organization</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parent_id">Parent Category</label>
              <select
                id="parent_id"
                value={formData.parent_id || ''}
                onChange={(e) => handleChange('parent_id', e.target.value || undefined)}
              >
                <option value="">-- Root Category --</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <small className="form-help">Select a parent category to create a subcategory</small>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (Order)</label>
              <input
                id="weight"
                type="number"
                value={formData.weight || 0}
                onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <small className="form-help">Lower numbers appear first</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => handleChange('status', e.target.checked)}
                />
                <span>Active Category</span>
              </label>
              <small className="form-help">Inactive categories are hidden from users</small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => onNavigate('category-dashboard')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (mode === 'create' ? 'Create Category' : 'Update Category')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
