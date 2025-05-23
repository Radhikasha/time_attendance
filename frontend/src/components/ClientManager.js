import React, { useState } from 'react';

function ClientManager() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({
    name: '',
    contact: '',
    budget: '',
    preferredLocation: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const addClient = () => {
    if (Object.values(newClient).every(field => field !== '')) {
      setClients([...clients, { ...newClient, id: Date.now() }]);
      // Reset form
      setNewClient({
        name: '',
        contact: '',
        budget: '',
        preferredLocation: ''
      });
    }
  };

  const deleteClient = (id) => {
    setClients(clients.filter(client => client.id !== id));
  };

  return (
    <div className="client-manager">
      <h2>Client Manager</h2>
      
      {/* Add Client Form */}
      <div className="add-client-form">
        <input
          type="text"
          name="name"
          placeholder="Client Name"
          value={newClient.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={newClient.contact}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget"
          value={newClient.budget}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="preferredLocation"
          placeholder="Preferred Location"
          value={newClient.preferredLocation}
          onChange={handleInputChange}
        />
        <button onClick={addClient}>Add Client</button>
      </div>

      {/* Client List */}
      <div className="clients">
        {clients.map((client) => (
          <div key={client.id} className="client-card">
            <h3>{client.name}</h3>
            <p>Contact: {client.contact}</p>
            <p>Budget: ₹{client.budget}</p>
            <p>Preferred Location: {client.preferredLocation}</p>
            <button onClick={() => deleteClient(client.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientManager;
