import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User { id:number; name:string; is_admin?:boolean }
interface Message { sender_id:number; receiver_id:number; message:string; sender_name:string; timestamp:string }

const adminUser = { id: 1, name: 'Admin', is_admin: true };

const AdminChat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ablyClient, setAblyClient] = useState<any>(null);
  const [userChannel, setUserChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user list on mount
  useEffect(() => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Init Ably on mount
  useEffect(() => {
    const initAbly = async () => {
      const Ably = (await import('ably')).Realtime;
      const client = new Ably({
        authCallback: async (tokenParams: any, callback: any) => {
          try {
            const res = await axios.post('/api/ably/auth', { user_id: adminUser.id });
            callback(null, res.data);
          } catch (err) {
            callback(err, null);
          }
        }
      });
      setAblyClient(client);
    };
    initAbly();
  }, []);

  // When a user is selected, load messages and subscribe to their channel
  useEffect(() => {
    if (!selectedUser || !ablyClient) return;

    // 1. Load previous messages from DB
    const loadMessages = async () => {
      try {
        const res = await axios.get(`/api/chat/messages/${selectedUser.id}`, {
          params: { current_user_id: adminUser.id }
        });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMessages();

    // 2. Subscribe to selected user's channel
    const chan = ablyClient.channels.get(`chat:user_${adminUser.id}`); // admin receives here
    chan.subscribe('message', (msg: any) => {
      // Only push messages from this selected user
      if (msg.data.sender_id === selectedUser.id) {
        setMessages(prev => [...prev, msg.data]);
      }
    });

    setUserChannel(chan);

    // Cleanup old subscription when switching users
    return () => {
      chan.unsubscribe();
    };

  }, [selectedUser, ablyClient]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !ablyClient) return;

    const payload = {
      sender_id: adminUser.id,
      receiver_id: selectedUser.id,
      message: newMessage,
      sender_name: adminUser.name,
      timestamp: new Date().toISOString(),
    };

    try {
      // Publish to user's channel so they receive it instantly
      const receiverChan = ablyClient.channels.get(`chat:user_${selectedUser.id}`);
      receiverChan.publish('message', payload);

      // Save in DB
      await axios.post('/api/chat/send', {
        message: newMessage,
        receiver_id: selectedUser.id,
        sender_id: adminUser.id
      });

      // Show in admin's view immediately
      setMessages(prev => [...prev, payload]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div style={{ display: 'flex' }}>
      {/* User list */}
      <div style={{ width: 200 }}>
        <h3>Users</h3>
        {users.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              cursor: 'pointer',
              padding: 8,
              background: selectedUser?.id === u.id ? '#eee' : 'transparent'
            }}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, marginLeft: 16 }}>
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>
            <div style={{
              height: 300,
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: 10
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
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
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message..."
                style={{ width: '70%' }}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : <div>Select a user</div>}
      </div>
    </div>
  );
};

export default AdminChat;
