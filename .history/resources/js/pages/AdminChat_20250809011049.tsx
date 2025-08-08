import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Ably from 'ably';

const AdminChat = () => {
  const adminUser = { id: 1, name: 'Admin', is_admin: true };
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ablyClient, setAblyClient] = useState(null);

  // Load users from backend
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Initialize Ably client
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: 'http://127.0.0.1:8000/api/ably/auth',
      authMethod: 'POST',
      authHeaders: { 'Content-Type': 'application/json' },
      authParams: { user_id: adminUser.id }
    });
    setAblyClient(client);
  }, []);

  // Load previous messages & subscribe to real-time updates
  useEffect(() => {
    if (!selectedUser || !ablyClient) return;

    // Fetch previous messages from backend
    axios.get(`http://127.0.0.1:8000/api/chat/messages/${selectedUser.id}`, {
      params: { current_user_id: adminUser.id }
    })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages:', err));

    // Subscribe to admin's incoming messages channel
    const channel = ablyClient.channels.get(`chat:user_${adminUser.id}`);
    const handleMessage = (msg) => {
      if (msg.data.sender_id === selectedUser.id) {
        setMessages(prev => [...prev, msg.data]);
      }
    };
    channel.subscribe('message', handleMessage);

    return () => {
      channel.unsubscribe('message', handleMessage);
    };
  }, [selectedUser, ablyClient]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const payload = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage,
      sender_name: adminUser.name,
      timestamp: new Date().toISOString()
    };

    try {
      // Send to backend (also publishes to Ably from backend)
      await axios.post('http://127.0.0.1:8000/api/chat/send', payload);

      // Add message locally
      setMessages(prev => [...prev, payload]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Users list */}
      <div style={{ width: 200, borderRight: '1px solid #ccc' }}>
        <h3>Users</h3>
        {users.length === 0 && <p>No users found</p>}
        {users.map(user => (
          <div
            key={user.id}
            style={{
              padding: '8px',
              cursor: 'pointer',
              background: selectedUser?.id === user.id ? '#eee' : ''
            }}
            onClick={() => setSelectedUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, padding: '0 16px' }}>
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>
            <div style={{
              height: 300,
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: 10
            }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <strong>{m.sender_name}: </strong>{m.message}
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{ marginTop: 8 }}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type message..."
                style={{ width: '70%' }}
              />
              <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div>Select a user</div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
