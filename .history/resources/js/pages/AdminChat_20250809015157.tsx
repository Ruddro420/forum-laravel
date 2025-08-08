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

  // Load users once
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Initialize Ably once
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: 'http://127.0.0.1:8000/api/ably/auth',
      authMethod: 'POST',
      authHeaders: { 'Content-Type': 'application/json' },
      authParams: { user_id: adminUser.id }
    });
    setAblyClient(client);

    return () => client.close();
  }, []);

  // Load messages + subscribe to Ably when selectedUser or ablyClient changes
  useEffect(() => {
    if (!selectedUser || !ablyClient) return;

    // Fetch previous messages from backend
    axios.get(`http://127.0.0.1:8000/api/chat/messages/${selectedUser.id}`, {
      params: { current_user_id: adminUser.id }
    })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages:', err));

    // Subscribe to admin's own channel to receive incoming messages
    const channel = ablyClient.channels.get(`chat:user_${adminUser.id}`);

    const handleMessage = (msg) => {
      const data = msg.data;
      if (!data) return;

      // Only add messages related to selectedUser
      if (data.sender_id === selectedUser.id || data.receiver_id === selectedUser.id) {
        setMessages(prev => {
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

    channel.subscribe('message', handleMessage);

    return () => {
      channel.unsubscribe('message', handleMessage);
    };
  }, [selectedUser, ablyClient]);

  // Send message (no local setMessages here to avoid duplicates)
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const payload = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage.trim(),
      sender_name: adminUser.name,
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/chat/send', payload);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Users list */}
      <div style={{ width: 220, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <h3 style={{ padding: '10px' }}>Users</h3>
        {users.length === 0 && <p style={{ padding: '10px' }}>No users found</p>}
        {users.map(user => (
          <div
            key={user.id}
            style={{
              padding: '10px',
              cursor: 'pointer',
              background: selectedUser?.id === user.id ? '#eee' : 'transparent',
              borderBottom: '1px solid #ddd'
            }}
            onClick={() => setSelectedUser(user)}
          >
            User #{user.id}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
        {selectedUser ? (
          <>
            <h2>Chat with User #{selectedUser.id}</h2>
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: 10,
              marginBottom: 8,
              backgroundColor: '#f9f9f9'
            }}>
              {messages.length === 0 && <div>No messages yet</div>}
              {messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <strong>{m.sender_name}:</strong> {m.message}
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flexGrow: 1, padding: '8px' }}
              />
              <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ padding: 16 }}>Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
