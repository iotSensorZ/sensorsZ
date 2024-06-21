// components/Chat.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: any;
}

const Chat = ({ currentInbox }: { currentInbox: string }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUser || !currentInbox) return;

    const messagesRef = collection(firestore, 'users', currentUser.uid, 'userEmails', currentInbox, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [currentUser, currentInbox]);

  const handleSendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;

    const messagesRef = collection(firestore, 'users', currentUser.uid, 'userEmails', currentInbox, 'messages');

    await addDoc(messagesRef, {
      sender: currentInbox,
      receiver: currentUser.email, // Assuming sending to current user's primary email
      message: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === currentInbox ? 'sent' : 'received'}`}>
            <p>{msg.message}</p>
            <span>
              {msg.timestamp && msg.timestamp.seconds 
                ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() 
                : 'No timestamp available'}
            </span>
          </div>
        ))}
      </div>
      <div className="new-message">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
