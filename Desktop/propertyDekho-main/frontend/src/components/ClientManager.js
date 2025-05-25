import React, { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient } from '../services/api';

function ClientManager() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({
    name: '',
    contact: '',
    budget: '',
    preferredLocation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await getClients();
      setClients(response.data);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const addClient = async () => {
    if (!newClient.name || !newClient.contact) {
      setError('Name and contact are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await createClient({
        name: newClient.name,
        contact: newClient.contact,
        budget: parseFloat(newClient.budget) || 0,
        preferredLocation: newClient.preferredLocation || '',
        email: '',
        notes: ''
      });
      
      // Update local state with the new client from the server
      setClients([...clients, response.data]);
      
      // Reset form
      setNewClient({
        name: '',
        contact: '',
        budget: '',
        preferredLocation: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add client');
      console.error('Error adding client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteClient(id);
      setClients(clients.filter(client => client._id !== id));
    } catch (err) {
      setError('Failed to delete client');
      console.error('Error deleting client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="client-manager" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Client Manager</h2>
      
      {/* Error Message */}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      
      {/* Add Client Form */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Add New Client</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={newClient.name}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label>Contact *</label>
            <input
              type="text"
              name="contact"
              value={newClient.contact}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={newClient.budget}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Enter budget"
            />
          </div>
          <div>
            <label>Preferred Location</label>
            <input
              type="text"
              name="preferredLocation"
              value={newClient.preferredLocation}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Enter preferred location"
            />
          </div>
        </div>
        <button 
          onClick={addClient}
          disabled={isLoading}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Adding...' : 'Add Client'}
        </button>
      </div>

      {/* Client List */}
      <div>
        <h3>Client List</h3>
        {isLoading && clients.length === 0 ? (
          <p>Loading clients...</p>
        ) : clients.length === 0 ? (
          <p>No clients found. Add your first client!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {clients.map((client) => (
              <div 
                key={client._id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '5px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{client.name}</h3>
                  <button 
                    onClick={() => handleDeleteClient(client._id)}
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                <p><strong>Contact:</strong> {client.contact}</p>
                {client.budget > 0 && <p><strong>Budget:</strong> ₹{client.budget.toLocaleString()}</p>}
                {client.preferredLocation && <p><strong>Location:</strong> {client.preferredLocation}</p>}
                {client.email && <p><strong>Email:</strong> {client.email}</p>}
                {client.notes && <p><strong>Notes:</strong> {client.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientManager;
