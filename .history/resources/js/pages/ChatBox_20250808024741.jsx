// resources/js/Pages/Chat/ChatBox.jsx
import React, { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

const ChatBox = ({ auth, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef(null);

  const currentUserId = auth.user.id;

  useEffect(() => {
    window.Pusher = Pusher;
    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: 'your-app-key',
      cluster: 'mt1',
      forceTLS: true,
      encrypted: true,
    });

    const ids = [currentUserId, receiverId].sort();
    const channelName = `chat.${ids[0]}.${ids[1]}`;

    window.Echo.private(channelName).listen('MessageSent', (e) => {
      setMessages((prev) => [...prev, e.message]);
    });

    return () => {
      window.Echo.leave(channelName);
    };
  }, [currentUserId, receiverId]);

  useEffect(() => {
    axios
      .get(`/api/messages/${receiverId}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const res = await axios.post('/api/messages/send', {
        receiver_id: receiverId,
        message: newMsg,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto">
      <div className="h-64 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.sender_id === currentUserId ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
