import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // In a real app, you would fetch the client data using the id
    const fetchClient = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real app, this would come from your API
        const mockClient = {
          id: id,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(123) 456-7890',
          type: 'Buyer',
          status: 'Active',
          address: '123 Main St, New York, NY 10001',
          notes: 'Interested in properties with 3+ bedrooms and a backyard.',
          budget: '$800,000 - $1,200,000',
          preferredLocations: ['Manhattan', 'Brooklyn'],
          timeline: '3-6 months',
          lastContact: '2023-05-15',
          propertiesViewed: [
            { id: 1, address: '456 Park Ave, New York, NY', date: '2023-05-10', status: 'Interested' },
            { id: 2, address: '789 Broadway, New York, NY', date: '2023-04-28', status: 'Not Interested' }
          ]
        };
        
        setClient(mockClient);
      } catch (err) {
        console.error('Error fetching client:', err);
        toast.error('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      // In a real app, you would call an API to delete the client
      toast.success('Client deleted successfully');
      navigate('/clients');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">Client not found</div>
        <Link to="/clients" className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-left me-2"></i> Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/clients">Clients</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{client.name}</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 mt-2">{client.name}</h1>
        </div>
        <div>
          <Link to={`/clients/${id}/edit`} className="btn btn-outline-secondary me-2">
            <i className="bi bi-pencil me-1"></i> Edit
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="avatar-xxl mb-3 mx-auto">
                <div className="avatar-title bg-light rounded-circle text-primary">
                  <i className="bi bi-person-fill fs-1"></i>
                </div>
              </div>
              <h4 className="mb-1">{client.name}</h4>
              <p className="text-muted mb-3">{client.type} • <span className={`text-${client.status === 'Active' ? 'success' : 'secondary'}`}>{client.status}</span></p>
              
              <div className="d-flex justify-content-center gap-2 mb-3">
                <button className="btn btn-primary">
                  <i className="bi bi-envelope me-1"></i> Email
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-telephone me-1"></i> Call
                </button>
              </div>
              
              <div className="text-start mt-4">
                <h6 className="text-uppercase text-muted mb-3">Contact Information</h6>
                <div className="mb-2">
                  <i className="bi bi-envelope me-2 text-muted"></i>
                  <a href={`mailto:${client.email}`} className="text-reset">{client.email}</a>
                </div>
                <div className="mb-2">
                  <i className="bi bi-telephone me-2 text-muted"></i>
                  <a href={`tel:${client.phone.replace(/[^0-9]/g, '')}`} className="text-reset">{client.phone}</a>
                </div>
                <div className="mb-2">
                  <i className="bi bi-geo-alt me-2 text-muted"></i>
                  <span>{client.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title mb-3">Client Details</h6>
              <div className="mb-3">
                <p className="text-muted mb-1">Client Since</p>
                <p className="mb-0">May 5, 2023</p>
              </div>
              <div className="mb-3">
                <p className="text-muted mb-1">Budget</p>
                <p className="mb-0">{client.budget}</p>
              </div>
              <div className="mb-3">
                <p className="text-muted mb-1">Timeline</p>
                <p className="mb-0">{client.timeline}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Preferred Locations</p>
                <div className="d-flex flex-wrap gap-1">
                  {client.preferredLocations.map((location, index) => (
                    <span key={index} className="badge bg-light text-dark">{location}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <i className="bi bi-info-circle me-1"></i> Details
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
                    onClick={() => setActiveTab('properties')}
                  >
                    <i className="bi bi-house me-1"></i> Properties
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    <i className="bi bi-clock-history me-1"></i> Activity
                  </button>
                </li>
              </ul>

              <div className="tab-content pt-3">
                {activeTab === 'details' && (
                  <div>
                    <h5 className="mb-3">Client Notes</h5>
                    <p className="text-muted">{client.notes}</p>
                    
                    <h5 className="mt-4 mb-3">Last Contact</h5>
                    <p className="text-muted">
                      {new Date(client.lastContact).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    
                    <button className="btn btn-outline-primary mt-2">
                      <i className="bi bi-plus-circle me-1"></i> Add Note
                    </button>
                  </div>
                )}

                {activeTab === 'properties' && (
                  <div>
                    <h5 className="mb-3">Properties Viewed</h5>
                    {client.propertiesViewed.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Property</th>
                              <th>Date Viewed</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {client.propertiesViewed.map((property, index) => (
                              <tr key={index}>
                                <td>{property.address}</td>
                                <td>{property.date}</td>
                                <td>
                                  <span className={`badge bg-${property.status === 'Interested' ? 'success' : 'secondary'}`}>
                                    {property.status}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <Link to={`/properties/${property.id}`} className="btn btn-sm btn-outline-primary">
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-house-x fs-1 d-block mb-2"></i>
                        <p>No properties viewed yet</p>
                        <Link to="/properties" className="btn btn-primary">
                          Browse Properties
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    <h5 className="mb-3">Recent Activity</h5>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-badge bg-primary">
                          <i className="bi bi-house"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Property Viewed</h6>
                          <p className="mb-1">Viewed property at 456 Park Ave</p>
                          <small className="text-muted">2 days ago</small>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-badge bg-success">
                          <i className="bi bi-telephone"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Phone Call</h6>
                          <p className="mb-1">Discussed property preferences</p>
                          <small className="text-muted">1 week ago</small>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-badge bg-info">
                          <i className="bi bi-envelope"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Email Sent</h6>
                          <p className="mb-1">Sent property listings</p>
                          <small className="text-muted">2 weeks ago</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
