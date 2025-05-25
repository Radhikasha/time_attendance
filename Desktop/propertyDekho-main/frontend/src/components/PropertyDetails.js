import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useParams, Link } from 'react-router-dom'; // Removed unused useNavigate
import { FaArrowLeft, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEdit } from 'react-icons/fa';
import { getProperty } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './PropertyDetails.css';

// Fix for default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const PropertyDetails = () => {
  // All hooks must be called at the top level, before any conditional returns
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState([20.5937, 78.9629]); // Default to India center
  
  // Helper function to safely get property values with better handling
  const getPropertyValue = (value, fallback = 'N/A', isDescription = false) => {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    
    // Special handling for description to handle different formats
    if (isDescription) {
      // If it's an array, join it with line breaks
      if (Array.isArray(value)) {
        return value.map((line, index) => (
          <p key={index} className="description-line">{line}</p>
        ));
      }
      // If it's a string with newlines, split and render as paragraphs
      if (typeof value === 'string' && value.includes('\n')) {
        return value.split('\n').map((line, index) => (
          <p key={index} className="description-line">{line || <br />}</p>
        ));
      }
    }
    
    return value;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getProperty(id);
        console.log('API Response:', response); // Debug log
        
        // Check if response has data property and it's not empty
        const propertyData = response.data || response;
        console.log('Property Data:', propertyData); // Debug log
        
        if (!propertyData) {
          throw new Error('No property data received');
        }
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (property) {
      // Debug logging
      console.log('Current Property Data:', {
        ...property,
        hasDescription: !!property.description,
        descriptionType: typeof property.description,
        descriptionValue: property.description
      });

      // Update coordinates
      try {
        if (property?.coordinates) {
          let coords = property.coordinates;
          if (typeof coords === 'string') {
            coords = coords.split(',').map(coord => parseFloat(coord.trim()));
          }
          
          const [lat, lng] = coords;
          if (!isNaN(lat) && !isNaN(lng)) {
            setCoords([lat, lng]);
          }
        }
      } catch (err) {
        console.error('Error setting coordinates:', err);
      }
    }
  }, [property]);

  // Render the appropriate UI based on the current state
  let content;
  
  if (loading) {
    content = (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  } else if (!property) {
    content = (
      <div className="not-found">
        <h2>Property Not Found</h2>
        <p>The property you're looking for doesn't exist or may have been removed.</p>
        <Link to="/properties" className="back-to-list">
          Back to Properties
        </Link>
      </div>
    );
  } else {
    // Main content when we have property data
    content = (
      <div className="property-content">
        <div className="property-gallery">
          {property.image ? (
            <img 
              src={property.image} 
              alt={property.title || 'Property Image'} 
              className="main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x500?text=Image+Not+Available';
              }}
            />
          ) : (
            <div className="no-image">
              <div className="no-image-placeholder">
                <span>No Image Available</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="property-info">
          <div className="info-section">
            <h2>
              {property.price 
                ? `₹${Number(property.price).toLocaleString()}` 
                : 'Price not available'}
            </h2>
            
            <div className="property-address">
              <FaMapMarkerAlt className="icon" />
              <span>{getPropertyValue(property.location, 'Location not specified')}</span>
            </div>
            
            <div className="property-meta">
              <div className="meta-item">
                <FaBed className="meta-icon" />
                <span>{getPropertyValue(property.bedrooms)} Beds</span>
              </div>
              <div className="meta-item">
                <FaBath className="meta-icon" />
                <span>{getPropertyValue(property.bathrooms)} Baths</span>
              </div>
              <div className="meta-item">
                <FaRulerCombined className="meta-icon" />
                <span>
                  {property.size 
                    ? `${Number(property.size).toLocaleString()} sq.ft` 
                    : 'Size N/A'}
                </span>
              </div>
              
              {property.type && (
                <div className="meta-item">
                  <span className="property-type">
                    {property.type}
                  </span>
                </div>
              )}
            </div>
            
            {property.status && (
              <div className="property-status">
                <span className={`status-badge ${String(property.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {property.status}
                </span>
              </div>
            )}
            
            <div className="property-actions">
              <Link 
                to={`/properties/edit/${property._id}`} 
                className="btn btn-edit"
              >
                <FaEdit /> Edit Property
              </Link>
            </div>
            
            <div className="property-description">
              <h3>About This Property</h3>
              <div className="description-content">
                {property.description 
                  ? getPropertyValue(property.description, 'No description available.', true)
                  : <p className="no-description">No description available for this property.</p>
                }
              </div>
            </div>
          </div>
          
          <div className="map-container">
            <h3>Location</h3>
            <div className="map-wrapper">
              <MapContainer 
                center={coords} 
                zoom={14} 
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={coords}>
                  <Popup>
                    <strong>{getPropertyValue(property.title, 'Property')}</strong><br />
                    {getPropertyValue(property.location, 'Location not specified')}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-details">
      <div className="property-header">
        <Link to="/properties" className="back-link">
          <FaArrowLeft /> Back to Properties
        </Link>
        <h1>{property ? getPropertyValue(property.title, 'Untitled Property') : 'Property Details'}</h1>
      </div>
      {content}
    </div>
  );
};

export default PropertyDetails;
