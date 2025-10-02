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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const itemsPerPage = 20; // Increased for better hierarchy view

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

  // Build hierarchical structure
  const buildHierarchy = (cats: Category[]) => {
    const rootCategories = cats.filter(cat => !cat.parent_id);
    const childrenMap = new Map<string, Category[]>();

    // Group children by parent
    cats.forEach(cat => {
      if (cat.parent_id) {
        if (!childrenMap.has(cat.parent_id)) {
          childrenMap.set(cat.parent_id, []);
        }
        childrenMap.get(cat.parent_id)!.push(cat);
      }
    });

    return { rootCategories, childrenMap };
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const expandAll = () => {
    const allParents = filteredCategories
      .filter(cat => !cat.parent_id)
      .map(cat => cat.id);
    setExpandedCategories(allParents);
  };

  const collapseAll = () => {
    setExpandedCategories([]);
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
    const { rootCategories } = buildHierarchy(filteredCategories);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return rootCategories.slice(startIndex, endIndex);
  };

  const getTotalRootCategories = () => {
    const { rootCategories } = buildHierarchy(filteredCategories);
    return rootCategories.length;
  };

  const totalPages = Math.ceil(getTotalRootCategories() / itemsPerPage);

  const renderCategoryRow = (category: Category, level: number = 0, childrenMap: Map<string, Category[]>) => {
    const hasChildren = childrenMap.has(category.id) && childrenMap.get(category.id)!.length > 0;
    const isExpanded = expandedCategories.includes(category.id);
    const children = childrenMap.get(category.id) || [];

    return (
      <React.Fragment key={category.id}>
        <tr className={`category-row level-${level}`}>
          <td className="name-cell">
            <div className="category-name-wrapper" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <button 
                  className="expand-toggle" 
                  onClick={() => toggleExpand(category.id)}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    {isExpanded ? (
                      <path d="M3 5l5 5 5-5H3z"/> // Down arrow
                    ) : (
                      <path d="M5 3l5 5-5 5V3z"/> // Right arrow
                    )}
                  </svg>
                </button>
              ) : (
                <span className="no-children-spacer"></span>
              )}
              <button 
                className="category-name-link" 
                onClick={() => onNavigate('category-view', category.id)}
              >
                {category.name}
              </button>
            </div>
          </td>
          <td className="status-cell">
            <span className={`status-badge ${category.status ? 'published' : 'unpublished'}`}>
              {category.status ? 'Published' : 'Unpublished'}
            </span>
          </td>
          <td className="operations-cell">
            <div className="operations-dropdown">
              <button className="edit-btn">Edit</button>
              <button 
                className="dropdown-toggle"
                onClick={(e) => {
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown?.classList.toggle('show');
                }}
              >
                ▼
              </button>
              <div className="dropdown-menu">
                <button onClick={() => onNavigate('category-view', category.id)}>View</button>
                <button onClick={() => onNavigate('category-edit', category.id)}>Edit</button>
                <button 
                  className="delete-option"
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
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && children.map(child => 
          renderCategoryRow(child, level + 1, childrenMap)
        )}
      </React.Fragment>
    );
  };

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
          <button className="btn-expand" onClick={expandAll} title="Expand All">
            ⊕ Expand All
          </button>
          <button className="btn-collapse" onClick={collapseAll} title="Collapse All">
            ⊖ Collapse All
          </button>
          
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {getTotalRootCategories()} categories ({filteredCategories.length} total with children)
      </div>

      {/* Categories Table */}
      {filteredCategories.length > 0 ? (
        <>
          <div className="table-container drupal-style">
            <table className="data-table category-tree">
              <thead>
                <tr>
                  <th className="name-header">Name</th>
                  <th className="status-header">Status</th>
                  <th className="operations-header">Operations</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const { rootCategories, childrenMap } = buildHierarchy(filteredCategories);
                  const paginatedRoots = rootCategories.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  );
                  return paginatedRoots.map(category => 
                    renderCategoryRow(category, 0, childrenMap)
                  );
                })()}
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
