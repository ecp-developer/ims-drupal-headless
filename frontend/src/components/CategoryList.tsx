import React, { useState, useEffect } from 'react';
import categoryService, { type Category } from '../services/categoryService';
import '../styles/CategoryList.css';

interface CategoryListProps {
  onNavigate: (view: string, categoryId?: string) => void;
  initialFilter?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ onNavigate, initialFilter = 'all' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, statusFilter, currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cat => 
        statusFilter === 'active' ? cat.status : !cat.status
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower)) ||
        (cat.parent_name && cat.parent_name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredCategories(filtered);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentPageCategories = getPaginatedCategories().map(cat => cat.id);
      setSelectedCategories(currentPageCategories);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedCategories.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      return;
    }

    try {
      await Promise.all(selectedCategories.map(id => categoryService.deleteCategory(id)));
      alert('Categories deleted successfully!');
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting categories:', error);
      alert('Failed to delete some categories');
    }
  };

  const getPaginatedCategories = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="category-list">
      {/* Header with Search and Filters */}
      <div className="list-header">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search" onClick={fetchCategories}>
            🔍 Search
          </button>
        </div>

        <div className="filter-section">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {selectedCategories.length > 0 && (
            <button className="btn-delete-selected" onClick={handleDeleteSelected}>
              🗑️ Delete Selected ({selectedCategories.length})
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {getPaginatedCategories().length} of {filteredCategories.length} categories
      </div>

      {/* Categories Table */}
      {filteredCategories.length > 0 ? (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedCategories.length === getPaginatedCategories().length && getPaginatedCategories().length > 0}
                    />
                  </th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Parent</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedCategories().map((category) => (
                  <tr key={category.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                      />
                    </td>
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
                        <span className="category-description">
                          {category.description.length > 60 
                            ? `${category.description.substring(0, 60)}...` 
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
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={async () => {
                            if (confirm(`Delete category "${category.name}"?`)) {
                              try {
                                await categoryService.deleteCategory(category.id);
                                alert('Category deleted successfully!');
                                fetchCategories();
                              } catch (error) {
                                alert('Failed to delete category');
                              }
                            }
                          }}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No Categories Found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button className="btn-primary" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
