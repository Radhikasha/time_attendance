import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, deleteProperty } from '../services/api';
import './PropertyDetail.css';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await getProperty(id);
        setProperty(response.data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Handle property deletion
  const handleDelete = async () => {
    try {
      await deleteProperty(id);
      navigate('/properties', { 
        state: { message: 'Property deleted successfully' } 
      });
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

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
      <div className="property-detail-container">
        <div className="loading">Loading property details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-detail-container">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-back"
        >
          ← Back to Properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail-container">
        <div className="not-found">
          <h2>Property Not Found</h2>
          <p>The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/properties')} 
            className="btn btn-primary"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="property-detail-container">
      <div className="property-detail">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-back"
        >
          ← Back to Properties
        </button>
        
        <div className="property-header">
          <h1>{property.title}</h1>
          <div className="property-meta">
            <span className={getStatusBadgeClass(property.status)}>
              {property.status}
            </span>
            <span className="property-price">₹{property.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="property-gallery">
          {property.image ? (
            <img 
              src={property.image} 
              alt={property.title} 
              className="main-image"
            />
          ) : (
            <div className="image-placeholder">
              <span>No Image Available</span>
            </div>
          )}
        </div>

        <div className="property-content">
          <div className="property-info">
            <div className="info-section">
              <h3>Property Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{property.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{property.size} sq.ft</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Price</span>
                  <span className="info-value price">₹{property.price.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value">
                    <span className={getStatusBadgeClass(property.status)}>
                      {property.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Location</h3>
              <div className="location-details">
                <p>{property.location}</p>
                {property.mapUrl && (
                  <div className="map-container">
                    <iframe
                      src={property.mapUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="Property Location"
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h3>Description</h3>
              <div className="property-description">
                {property.description || 'No description available.'}
              </div>
            </div>
          </div>

          <div className="property-sidebar">
            <div className="action-card">
              <h3>Actions</h3>
              <div className="action-buttons">
                <button 
                  onClick={() => navigate(`/properties/edit/${property._id}`)}
                  className="btn btn-edit"
                >
                  ✏️ Edit Property
                </button>
                
                {!showDeleteConfirm ? (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-delete"
                  >
                    🗑️ Delete Property
                  </button>
                ) : (
                  <div className="delete-confirmation">
                    <p>Are you sure?</p>
                    <div className="confirmation-buttons">
                      <button 
                        onClick={handleDelete}
                        className="btn btn-confirm-delete"
                      >
                        Yes, Delete
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <button className="btn btn-secondary">
                  📞 Contact Agent
                </button>
              </div>
            </div>

            <div className="agent-card">
              <h3>Contact Agent</h3>
              <div className="agent-info">
                <div className="agent-avatar">
                  {property.agent?.name?.charAt(0) || 'A'}
                </div>
                <div className="agent-details">
                  <h4>{property.agent?.name || 'Property Agent'}</h4>
                  <p className="agent-email">{property.agent?.email || 'radhikasharma790670@gmail.com'}</p>
                  <p className="agent-phone">{property.agent?.phone || '+91 9897446214'}</p>
                </div>
              </div>
              <button className="btn btn-primary">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
