import React, { useState, useEffect } from 'react';
import itemMasterService, { type ItemMaster } from '../services/itemMasterService';
import '../styles/ItemMasterList.css';

interface ItemMasterListProps {
  onNavigate: (view: string, itemId?: string) => void;
  initialFilter?: string;
}

const ItemMasterList: React.FC<ItemMasterListProps> = ({ onNavigate, initialFilter = 'all' }) => {
  const [items, setItems] = useState<ItemMaster[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemMasterService.getItemMasters();
      setItems(data);
    } catch (error) {
      console.error('Error fetching item masters:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        statusFilter === 'active' ? item.status : !item.status
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.item_code.toLowerCase().includes(searchLower) ||
        (item.specifications && item.specifications.toLowerCase().includes(searchLower)) ||
        (item.category_name && item.category_name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredItems(filtered);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item masters...</p>
      </div>
    );
  }

  return (
    <div className="item-master-list">
      {/* Header with Search and Filters */}
      <div className="list-header">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search items by title, code, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search" onClick={fetchItems}>
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
            <option value="active">Published Only</option>
            <option value="inactive">Unpublished Only</option>
          </select>
          
          <button className="btn-create" onClick={() => onNavigate('item-master-create')}>
            + Add New Item
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {paginatedItems.length} of {filteredItems.length} item masters
      </div>

      {/* Item Masters Table */}
      {filteredItems.length > 0 ? (
        <>
          <div className="table-container drupal-style">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="code-header">Item Code</th>
                  <th className="title-header">Title</th>
                  <th className="category-header">Category</th>
                  <th className="uom-header">Unit</th>
                  <th className="status-header">Status</th>
                  <th className="operations-header">Operations</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
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
                    <td className="uom-cell">
                      {item.unit_of_measure_name ? (
                        <span className="uom-badge">{item.unit_of_measure_name}</span>
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
                          <button 
                            className="delete-option"
                            onClick={async () => {
                              if (confirm(`Delete item "${item.title}"?`)) {
                                try {
                                  await itemMasterService.deleteItemMaster(item.id);
                                  alert('Item deleted successfully!');
                                  fetchItems();
                                } catch (error) {
                                  alert('Failed to delete item');
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
          <div className="empty-icon">📦</div>
          <h3>No Item Masters Found</h3>
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

export default ItemMasterList;
