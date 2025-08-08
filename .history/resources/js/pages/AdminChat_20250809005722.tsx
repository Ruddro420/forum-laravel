import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminChat = () => {
  const adminUser = { id: 1, name: 'Admin', is_admin: true };
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_name: string;
    timestamp: string;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load users
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Load messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    axios.get(`http://127.0.0.1:8000/api/chat/messages/${selectedUser.id}`, {
      params: { current_user_id: adminUser.id }
    })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages:', err));
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const payload = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage,
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/chat/send', payload);
      setMessages(prev => [...prev, {
        ...payload,
        sender_name: adminUser.name,
        timestamp: new Date().toISOString()
      }]);
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

      {/* Chat window */}
      <div style={{ flex: 1, padding: '0 16px' }}>
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>
            <div style={{ height: 300, overflowY: 'auto', border: '1px solid #ddd', padding: 10 }}>
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
