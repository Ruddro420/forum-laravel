// resources/js/Pages/UserChat.jsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import * as Ably from 'ably';
import { Channel } from 'ably';

interface AuthProps {
    user: {
        id: number;
        name: string;
        // Add other user properties if needed
    };
}

interface Message {
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_name: string;
    timestamp: string;
}

const UserChat = ({ auth }: { auth: AuthProps }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [channel, setChannel] = useState<Ably.Types.Channel | null>(null);
    const user = auth.user;

    useEffect(() => {
        // Initialize Ably
        const initAbly = async () => {
            const response = await fetch('/ably/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
            });
            
            const tokenRequest = await response.json();
            const ablyClient = new Ably.Realtime({ authCallback: tokenRequest });
            setAbly(ablyClient);
            
            // Connect to user's channel
            const userChannel = ablyClient.channels.get(`chat:user_${user.id}`);
            setChannel(userChannel);
            
            // Subscribe to messages
            userChannel.subscribe('message', (message) => {
                setMessages(prev => [...prev, message.data]);
            });
            
            // Load message history
            loadMessages();
        };
        
        initAbly();
        
        return () => {
            if (channel) channel.unsubscribe();
            if (ably) ably.close();
        };
    }, [user.id]);

    const loadMessages = async () => {
        const response = await fetch(`/chat/messages/${user.id}`);
        const data = await response.json();
        setMessages(data);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !channel) return;
        
        const messageData = {
            sender_id: user.id,
            receiver_id: 1, // Assuming admin has ID 1
            message: newMessage,
            sender_name: user.name,
            timestamp: new Date().toISOString(),
        };
        
        // Send to Ably
        channel.publish('message', messageData);
        
        // Save to database
        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            body: JSON.stringify({
                message: newMessage,
                receiver_id: 1, // Admin ID
            }),
        });
        
        setNewMessage('');
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
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
    );
};

export default UserChat;

function setAbly(ablyClient: Ably.Realtime) {
    throw new Error('Function not implemented.');
}
