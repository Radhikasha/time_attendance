import React, { useState } from 'react';
import { createProperty } from '../services/api';
import './AddProperty.css';

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    location: '',
    description: '',
    size: '',
    price: '',
    type: 'Plot',
    status: 'Available',
    coordinates: '20.5937, 78.9629' // Default to center of India
  });
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      // Convert to base64 and set preview
      const base64String = reader.result;
      setPreview(base64String);
      setFormData(prev => ({ ...prev, image: base64String }));
    };
    reader.onerror = () => {
      setMessage({ text: 'Error reading image file', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Adding property...', type: 'info' });
    
    try {
      console.log('Submitting form data:', formData);
      
      // Basic validation
      if (!formData.title || !formData.location || !formData.coordinates) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate coordinates format
      const coords = formData.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length !== 2 || coords.some(isNaN)) {
        throw new Error('Please enter valid coordinates in the format: latitude, longitude');
      }
      
      const response = await createProperty({
        ...formData,
        size: parseFloat(formData.size) || 0,
        price: parseFloat(formData.price) || 0
      });
      
      console.log('Property added successfully:', response);
      setMessage({ text: 'Property added successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        title: '',
        image: '',
        location: '',
        size: '',
        price: '',
        type: 'Plot',
        status: 'Available',
        coordinates: '20.5937, 78.9629'
      });
      setPreview('');
      
    } catch (error) {
      console.error('Error adding property:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to add property. Please try again.';
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="add-property">
      <h2>Add New Property</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label>Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter property title"
          />
        </div>

        <div className="form-group">
          <label>Property Image*</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Property preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Location*</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter property description..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Size (sq. ft.)*</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="e.g., 1200"
            />
          </div>

          <div className="form-group">
            <label>Price (₹)*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="e.g., 5000000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Property Type*</label>
            <select 
              name="type" 
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Plot">Plot</option>
              <option value="Flat">Flat</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status*</label>
            <select 
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
        </div>

        <button type="submit" className="submit-btn">
          Add Property
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
