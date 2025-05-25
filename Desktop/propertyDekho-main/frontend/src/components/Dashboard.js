import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Find Your Dream Property</span>
          </h1>
          <p className="hero-subtitle">Search properties by location, price, and area</p>
          
          {/* Search Form */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      
      {/* Featured Properties Section - Can be added later */}
      {/* <section className="featured-properties">
        <h2>Featured Properties</h2>
        <div className="property-grid">
          {featuredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section> */}
    </div>
  );
}

export default Dashboard;
