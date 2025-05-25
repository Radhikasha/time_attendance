import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ClientList = () => {
  // In a real app, this would come from an API
  const [clients, setClients] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '(123) 456-7890', type: 'Buyer', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '(123) 456-7891', type: 'Seller', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '(123) 456-7892', type: 'Buyer', status: 'Inactive' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       client.phone.includes(searchTerm);
    const matchesType = filterType === 'All' || client.type === filterType;
    const matchesStatus = filterStatus === 'All' || client.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const deleteClient = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      // In a real app, you would call an API to delete the client
      setClients(clients.filter(client => client.id !== id));
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Clients</h1>
        <Link to="/clients/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i> Add Client
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('All');
                  setFilterStatus('All');
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-person fs-5 text-muted"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">{client.name}</h6>
                          <small className="text-muted">ID: {client.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{client.email}</div>
                      <small className="text-muted">{client.phone}</small>
                    </td>
                    <td>
                      <span className={`badge bg-${client.type === 'Buyer' ? 'info' : 'success'} bg-opacity-10 text-${client.type === 'Buyer' ? 'info' : 'success'}`}>
                        {client.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${client.status === 'Active' ? 'success' : 'secondary'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/clients/${client.id}`} className="btn btn-outline-primary">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link to={`/clients/${client.id}/edit`} className="btn btn-outline-secondary">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => deleteClient(client.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="text-muted">No clients found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
