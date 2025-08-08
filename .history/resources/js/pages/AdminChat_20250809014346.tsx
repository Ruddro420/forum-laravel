import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as Ably from 'ably';

const AdminChat = () => {
  const adminUser = { id: 1, name: 'Admin', is_admin: true };
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ablyClient, setAblyClient] = useState(null);
  const channelRef = useRef(null);

  // Load users
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Initialize Ably
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: 'http://127.0.0.1:8000/api/ably/auth',
      authMethod: 'POST',
      authHeaders: { 'Content-Type': 'application/json' },
      authParams: { user_id: adminUser.id }
    });
    setAblyClient(client);
  }, []);

  // Clear messages when switching user
  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);

  // Load messages and subscribe to channel for selected user
  useEffect(() => {
    if (!selectedUser || !ablyClient) return;

    let channel = ablyClient.channels.get(`chat:user_${adminUser.id}`);

    // Fetch previous messages
    axios.get(`http://127.0.0.1:8000/api/chat/messages/${selectedUser.id}`, {
      params: { current_user_id: adminUser.id }
    })
      .then(res => setMessages(res.data || []))
      .catch(err => console.error('Error fetching messages:', err));

    // Message handler
    const handleMessage = (msg) => {
      const data = msg.data;
      if (!data) return;

      // Only show messages sent to/from the selected user
      if (data.sender_id === selectedUser.id || data.receiver_id === selectedUser.id) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m =>
            m.timestamp === data.timestamp &&
            m.sender_id === data.sender_id &&
            m.message === data.message
          );
          if (exists) return prev;
          return [...prev, data];
        });
      }
    };

    // Subscribe to admin's channel
    channel.subscribe('message', handleMessage);
    channelRef.current = channel;

    // Cleanup on user change/unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe('message', handleMessage);
      }
    };
  }, [selectedUser, ablyClient]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const timestamp = new Date().toISOString();
    const payload = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage.trim(),
      sender_name: adminUser.name,
      timestamp
    };

    try {
      // Send message to backend (which publishes to Ably)
      await axios.post('http://127.0.0.1:8000/api/chat/send', payload);

      // Add message locally (optional — could skip and rely on Ably)
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
            {/* Show full user name */}
            {user.id}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, padding: '0 16px' }}>
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.first_name} {selectedUser.last_name}</h2>
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
