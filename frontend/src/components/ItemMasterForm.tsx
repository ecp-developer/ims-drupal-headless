import React, { useState, useEffect } from 'react';
import itemMasterService, { type ItemMasterFormData, type TaxonomyTerm } from '../services/itemMasterService';
import '../styles/ItemMasterForm.css';

interface ItemMasterFormProps {
  onNavigate: (view: string, itemId?: string) => void;
  mode: 'create' | 'edit';
  itemId?: string;
  onSuccess?: () => void;
}

const ItemMasterForm: React.FC<ItemMasterFormProps> = ({ onNavigate, mode, itemId, onSuccess }) => {
  const [formData, setFormData] = useState<ItemMasterFormData>({
    title: '',
    item_code: '',
    specifications: '',
    category_id: '',
    unit_of_measure_id: '',
    status: true,
  });

  const [categories, setCategories] = useState<TaxonomyTerm[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDropdownData();
    if (mode === 'edit' && itemId) {
      loadItemData();
    }
  }, [mode, itemId]);

  const loadDropdownData = async () => {
    try {
      const [categoriesData, uomData] = await Promise.all([
        itemMasterService.getCategories(),
        itemMasterService.getUnitsOfMeasure()
      ]);
      setCategories(categoriesData);
      setUnitsOfMeasure(uomData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const loadItemData = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      const item = await itemMasterService.getItemMasterById(itemId);
      if (item) {
        setFormData({
          title: item.title,
          item_code: item.item_code,
          specifications: item.specifications || '',
          category_id: item.category_id || '',
          unit_of_measure_id: item.unit_of_measure_id || '',
          status: item.status,
        });
      }
    } catch (error) {
      console.error('Error loading item data:', error);
      alert('Failed to load item data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.item_code.trim()) {
      newErrors.item_code = 'Item code is required';
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
      setSaving(true);
      
      if (mode === 'create') {
        const newItem = await itemMasterService.createItemMaster(formData);
        alert('Item master created successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('item-master-view', newItem.id);
        }
      } else if (mode === 'edit' && itemId) {
        await itemMasterService.updateItemMaster(itemId, formData);
        alert('Item master updated successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('item-master-view', itemId);
        }
      }
    } catch (error) {
      console.error('Error saving item master:', error);
      alert('Failed to save item master');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && itemId) {
      onNavigate('item-master-view', itemId);
    } else {
      onNavigate('item-master-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item data...</p>
      </div>
    );
  }

  return (
    <div className="item-master-form-container">
      <div className="form-header">
        <h2>{mode === 'create' ? 'Create New Item Master' : 'Edit Item Master'}</h2>
        <p className="form-subtitle">
          {mode === 'create' 
            ? 'Add a new item to the inventory system' 
            : 'Update item master information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="item-master-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label required">
            Title
          </label>
          <input
            type="text"
            id="title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter item title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Item Code */}
        <div className="form-group">
          <label htmlFor="item_code" className="form-label required">
            Item Code
          </label>
          <input
            type="text"
            id="item_code"
            className={`form-input ${errors.item_code ? 'error' : ''}`}
            value={formData.item_code}
            onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
            placeholder="Enter unique item code"
          />
          {errors.item_code && <span className="error-message">{errors.item_code}</span>}
          <span className="form-help">Unique identifier for this item</span>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-select"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          >
            <option value="">-- Select Category --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="form-help">Assign this item to a category</span>
        </div>

        {/* Unit of Measure */}
        <div className="form-group">
          <label htmlFor="unit_of_measure" className="form-label">
            Unit of Measure
          </label>
          <select
            id="unit_of_measure"
            className="form-select"
            value={formData.unit_of_measure_id}
            onChange={(e) => setFormData({ ...formData, unit_of_measure_id: e.target.value })}
          >
            <option value="">-- Select Unit --</option>
            {unitsOfMeasure.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <span className="form-help">Standard unit for measuring this item</span>
        </div>

        {/* Specifications */}
        <div className="form-group">
          <label htmlFor="specifications" className="form-label">
            Specifications
          </label>
          <textarea
            id="specifications"
            className="form-textarea"
            value={formData.specifications}
            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
            placeholder="Enter detailed specifications..."
            rows={5}
          />
          <span className="form-help">Detailed technical specifications or description</span>
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
            />
            <span>Published</span>
          </label>
          <span className="form-help">Published items are visible in the system</span>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={saving}
          >
            {saving ? 'Saving...' : (mode === 'create' ? 'Create Item' : 'Update Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemMasterForm;
