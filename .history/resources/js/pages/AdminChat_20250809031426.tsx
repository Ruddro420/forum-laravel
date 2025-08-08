import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Ably from 'ably';

const API_URL = 'http://192.168.1.104:8000/api';

const adminUser = { id: 1, name: 'Admin', is_admin: true };

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ablyClient, setAblyClient] = useState(null);

  // Load users on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  // Initialize Ably client on mount
  useEffect(() => {
    const client = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        try {
          const res = await axios.post(`${API_URL}/ably/auth`, { user_id: adminUser.id });
          callback(null, res.data);
        } catch (err) {
          callback(err, null);
        }
      },
    });

    setAblyClient(client);

    return () => {
      client.close();
    };
  }, []);

  // Load messages and subscribe when selectedUser or ablyClient changes
  useEffect(() => {
    if (!selectedUser || !ablyClient) return;

    // Load historical messages
    axios
      .get(`${API_URL}/chat/messages/${selectedUser.id}`, {
        params: { current_user_id: adminUser.id },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error('Error fetching messages:', err));

    // Subscribe to admin channel for realtime messages
    const channel = ablyClient.channels.get(`chat:user_${adminUser.id}`);

    const handleMessage = (msg) => {
      if (msg.data.sender_id === selectedUser.id) {
        setMessages((prev) => {
          // Avoid duplicates by comparing timestamp + message text
          const exists = prev.some(
            (m) =>
              m.timestamp === msg.data.timestamp &&
              m.sender_id === msg.data.sender_id &&
              m.message === msg.data.message
          );
          if (exists) return prev;
          return [...prev, msg.data];
        });
      }
    };

    channel.subscribe('message', handleMessage);

    return () => {
      channel.unsubscribe('message', handleMessage);
    };
  }, [selectedUser, ablyClient]);

  // Send message with optimistic update
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageToSend = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage.trim(),
      sender_name: adminUser.name,
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(`${API_URL}/chat/send`, messageToSend);

      setMessages((prev) => [...prev, messageToSend]);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '80vh' }}>
      <div
        style={{
          width: 200,
          borderRight: '1px solid #ccc',
          overflowY: 'auto',
          padding: 10,
        }}
      >
        <h3>Users</h3>
        {users.length === 0 && <p>No users found</p>}
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: selectedUser?.id === user.id ? '#eee' : '',
            }}
            onClick={() => setSelectedUser(user)}
          >
            {user.first_name} {user.last_name}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <h2>
              Chat with {selectedUser.first_name} {selectedUser.last_name}
            </h2>
            <div
              style={{
                flexGrow: 1,
                overflowY: 'auto',
                border: '1px solid #ddd',
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#f9f9f9',
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{msg.sender_name}:</strong> {msg.message}
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flexGrow: 1, padding: '8px' }}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div>Select a user to chat</div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
