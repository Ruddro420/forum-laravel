import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import * as Ably from 'ably';
import axios from 'axios'; // Add axios import

interface AuthProps {
    user: {
        id: number;
        name: string;
        is_admin: boolean;
    };
}

interface User {
    id: number;
    name: string;
}

interface Message {
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_name: string;
    timestamp: string;
}

const AdminChat = ({ auth, users }: { auth: AuthProps; users: User[] }) => {
    const [selectedUser, setSelectedUser] = useState(1);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ably, setAbly] = useState<Ably.Realtime | null>(null);
    const [channel, setChannel] = useState<Ably.Types.Channel | null>(null);
    const admin = auth.user;

    useEffect(() => {
        // Initialize Ably
        const initAbly = async () => {
            try {
                // Use axios instead of fetch to automatically handle CSRF
                const response = await axios.post('/ably/auth');
                const tokenRequest = response.data;
                const ablyClient = new Ably.Realtime({ authCallback: tokenRequest });
                setAbly(ablyClient);
            } catch (error) {
                console.error('Error initializing Ably:', error);
            }
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
        
        try {
            const response = await axios.get(`/chat/messages/${selectedUser.id}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !channel || !selectedUser) return;
        
        const messageData = {
            sender_id: admin.id,
            receiver_id: selectedUser.id,
            message: newMessage,
            sender_name: admin.name,
            timestamp: new Date().toISOString(),
        };
        
        try {
            // Send to Ably
            channel.publish('message', messageData);
            
            // Save to database using axios
            await axios.post('/chat/send', {
                message: newMessage,
                receiver_id: selectedUser.id,
            });
            
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
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