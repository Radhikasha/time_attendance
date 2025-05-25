import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProperties, deleteProperty } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PropertyList.css';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(6);
  const navigate = useNavigate();

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getProperties();
        setProperties(response.data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Delete property
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(property => property._id !== id));
        toast.success('Property deleted successfully!');
      } catch (err) {
        console.error('Error deleting property:', err);
        toast.error('Failed to delete property. Please try again.');
      }
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || property.status === filterStatus;
    const matchesType = filterType === 'All' || property.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get current properties for pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available':
        return 'status-badge status-available';
      case 'Under Negotiation':
        return 'status-badge status-negotiation';
      case 'Sold':
        return 'status-badge status-sold';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="property-list">
        <h2>Property Listings</h2>
        <div className="loading">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-list">
        <h2>Property Listings</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="property-list">
      <div className="property-list-header">
        <h2>Properties</h2>
        <Link to="/properties/add" className="add-property-btn">
          Add Property
        </Link>
      </div>
      
      {/* Filters and Search */}
      <div className="property-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="search-icon">🔍</i>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Under Negotiation">Under Negotiation</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Plot">Plot</option>
            <option value="Flat">Flat</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>
      
      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <div className="no-results">
          <p>No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="property-grid">
          {currentProperties.map((property) => (
            <div key={property._id} className="property-card">
              <img 
                src={property.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={property.title} 
                className="property-image"
              />
              <div className="property-info">
                <h3>{property.title}</h3>
                <p className="property-location">{property.location}</p>
                <div className="property-meta">
                  <span className={`status-badge ${property.status.toLowerCase().replace(' ', '-')}`}>
                    {property.status}
                  </span>
                  <span className="property-type">{property.type}</span>
                  <span className="property-size">{property.size} sq.ft</span>
                  <span className="property-price">₹{property.price?.toLocaleString()}</span>
                </div>
                <div className="property-actions">
                  <button 
                    onClick={() => navigate(`/properties/${property._id}`)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredProperties.length > propertiesPerPage && (
        <div className="pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            &laquo;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-button ${currentPage === number ? 'active' : ''}`}
              aria-label={`Page ${number}`}
              aria-current={currentPage === number ? 'page' : null}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default PropertyList;
