// resources/js/Pages/AdminChat.jsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import * as Ably from 'ably';

const AdminChat = ({ auth, users }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ably, setAbly] = useState(null);
    const [channel, setChannel] = useState(null);
    const admin = auth.user;

    useEffect(() => {
        // Initialize Ably
        const initAbly = async () => {
            const response = await fetch('/ably/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            
            const tokenRequest = await response.json();
            const ablyClient = new Ably.Realtime({ authCallback: tokenRequest });
            setAbly(ablyClient);
        };
        
        initAbly();
        
        return () => {
            if (channel) channel.unsubscribe();
            if (ably) ably.close();
        };
    }, []);

    useEffect(() => {
        if (selectedUser && ably) {
            // Connect to user's channel
            const userChannel = ably.channels.get(`chat:user_${selectedUser.id}`);
            setChannel(userChannel);
            
            // Subscribe to messages
            userChannel.subscribe('message', (message) => {
                setMessages(prev => [...prev, message.data]);
            });
            
            // Load message history
            loadMessages();
        }
    }, [selectedUser, ably]);

    const loadMessages = async () => {
        if (!selectedUser) return;
        
        const response = await fetch(`/chat/messages/${selectedUser.id}`);
        const data = await response.json();
        setMessages(data);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !channel || !selectedUser) return;
        
        const messageData = {
            sender_id: admin.id,
            receiver_id: selectedUser.id,
            message: newMessage,
            sender_name: admin.name,
            timestamp: new Date().toISOString(),
        };
        
        // Send to Ably
        channel.publish('message', messageData);
        
        // Save to database
        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
                message: newMessage,
                receiver_id: selectedUser.id,
            }),
        });
        
        setNewMessage('');
    };

    return (
        <div className="admin-chat-container">
            <div className="users-list">
                <h3>Users</h3>
                {users.map(user => (
                    <div 
                        key={user.id} 
                        className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                        onClick={() => setSelectedUser(user)}
                    >
                        {user.name}
                    </div>
                ))}
            </div>
            
            {selectedUser && (
                <div className="chat-container">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender_id === admin.id ? 'sent' : 'received'}`}>
                                <strong>{msg.sender_name}: </strong> {msg.message}
                                <div className="time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
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
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminChat;