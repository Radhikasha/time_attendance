import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty } from '../services/api';
import './EditProperty.css';

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    location: '',
    type: 'Plot',
    status: 'Available',
    mapUrl: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getProperty(id);
        const property = response.data;
        setFormData({
          title: property.title || '',
          description: property.description || '',
          price: property.price || '',
          size: property.size || '',
          location: property.location || '',
          type: property.type || 'Plot',
          status: property.status || 'Available',
          mapUrl: property.mapUrl || ''
        });
        if (property.image) {
          setImagePreview(property.image);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.price || !formData.size) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      console.log('Form data before sending:', {
        ...formData,
        image: formData.image ? '[Image data]' : 'No image'
      });
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        // Skip null/undefined values
        if (value === null || value === undefined) return;
        
        // Convert to string and trim
        const stringValue = String(value).trim();
        if (stringValue !== '') {
          formDataToSend.append(key, stringValue);
        }
      });
      
      // Append image file if a new one was selected
      if (image) {
        formDataToSend.append('image', image);
        console.log('Included new image in form data');
      } else if (imagePreview && !imagePreview.startsWith('data:image')) {
        // If there's an existing image URL and no new image was selected
        formDataToSend.append('image', imagePreview);
        console.log('Included existing image URL in form data');
      }

      console.log('Sending update request...');
      const response = await updateProperty(id, formDataToSend);
      console.log('Update response:', response);
      
      // Redirect to property detail page after successful update
      navigate(`/properties/${id}`, { 
        state: { message: 'Property updated successfully!' } 
      });
    } catch (err) {
      console.error('Error updating property:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to update property. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-property-container">
        <div className="loading">Loading property data...</div>
      </div>
    );
  }

  return (
    <div className="edit-property-container">
      <div className="edit-property-header">
        <h1>Edit Property</h1>
        <p>Update the property details below</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Property Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter property title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Property Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Plot">Plot</option>
                <option value="Flat">Flat</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Available">Available</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="size">Size (sq.ft) *</label>
              <input
                type="number"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Enter size in square feet"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label htmlFor="location">Address *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapUrl">Google Maps Embed URL</label>
            <input
              type="text"
              id="mapUrl"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleChange}
              placeholder="Paste Google Maps embed URL"
            />
            <p className="hint">
              To get an embed URL, open Google Maps, find the location, click "Share", 
              then "Embed a map" and copy the iframe src URL.
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3>Media</h3>
          <div className="form-group">
            <label>Property Image</label>
            <div className="image-upload-container">
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Property preview" />
                ) : (
                  <div className="no-image">No image selected</div>
                )}
              </div>
              <div className="image-upload-controls">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="image" className="btn btn-upload">
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    className="btn btn-remove"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Description</h3>
          <div className="form-group">
            <label htmlFor="description">Property Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed property description"
              rows="5"
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProperty;
