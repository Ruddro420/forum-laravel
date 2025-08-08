// resources/js/Pages/AdminChat.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  is_admin: boolean;
}

interface Message {
  sender_id: number;
  receiver_id: number;
  message: string;
  sender_name: string;
  timestamp: string;
}

const AdminChat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ably, setAbly] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Static admin user
  const adminUser = {
    id: 1,
    name: 'Admin',
    is_admin: true,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      initAbly();
      loadMessages();
    }
  }, [selectedUser]);

  const initAbly = async () => {
    try {
      // Dynamically import Ably to avoid SSR issues
      const Ably = (await import('ably')).default;
      
      // Create Ably client with authCallback
      const ablyClient = new Ably.Realtime({
        authCallback: async (tokenParams: any, callback: any) => {
          try {
            const response = await axios.post('/api/ably/auth', { 
              user_id: adminUser.id 
            });
            callback(null, response.data);
          } catch (error) {
            callback(error, null);
          }
        }
      });
      
      setAbly(ablyClient);
      
      // Wait for connection
      ablyClient.connection.once('connected', () => {
        // Connect to user's channel
        const userChannel = ablyClient.channels.get(`chat:user_${selectedUser.id}`);
        setChannel(userChannel);
        
        // Subscribe to messages
        userChannel.subscribe('message', (message: any) => {
          setMessages(prev => [...prev, message.data]);
        });
      });
    } catch (error) {
      console.error('Error initializing Ably:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axios.get(`/api/chat/messages/${selectedUser.id}`, {
        params: { current_user_id: adminUser.id }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channel || !selectedUser) return;
    
    const messageData = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage,
      sender_name: adminUser.name,
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Send to Ably
      channel.publish('message', messageData);
      
      // Save to database
      await axios.post('/api/chat/send', {
        message: newMessage,
        receiver_id: selectedUser.id,
        sender_id: adminUser.id,
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return <div className="admin-chat-loading">Loading users...</div>;
  }

  return (
    <div className="admin-chat-container">
      <div className="users-list">
        <h3>Users</h3>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map(user => (
            <div 
              key={user.id} 
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              {user.name}
            </div>
          ))
        )}
      </div>
      
      <div className="chat-area">
        {selectedUser ? (
          <div className="chat-container">
            <div className="chat-header">
              <h2>Chat with {selectedUser.name}</h2>
            </div>
            
            <div className="messages">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.sender_id === adminUser.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <strong>{msg.sender_name}: </strong> {msg.message}
                  </div>
                  <div className="time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="select-user-prompt">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;