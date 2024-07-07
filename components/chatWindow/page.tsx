import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { FaRocketchat } from "@react-icons/all-files/fa/FaRocketchat";
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import EmojiPicker,{ EmojiClickData }  from 'emoji-picker-react';
import { FaRegSmile } from '@react-icons/all-files/fa/FaRegSmile';
import Image from 'next/image';
import Avatar from '@/public/images/avatar.jpg'

interface User {
  id: string;
  firstName: string;
 lastName: string;
 profilePicUrl:string;
}

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Timestamp;
}

interface ChatWindowProps {
  currentUser: { uid: string };
  selectedUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [emoji, setemoji] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => doc.data() as Message));
    });

    return () => unsubscribe();
  }, [currentUser.uid, selectedUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Ensure message is not empty
    const db = getFirestore();
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: currentUser.uid,
        receiverId: selectedUser.id,
        text: newMessage,
        createdAt: Timestamp.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
      toast.error('Failed to send message');
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setemoji(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setemoji(false);
  };


  return (
    <div className=" text-gray-500 w-3/4 h-full flex flex-col">
     
     <div className="border-b border-slate-300 relative overflow-hidden flex  px-5 py-5 md:p-5 bg-slate-50 text-slate-800">
        <div className="flex gap-4 mx-auto w-full">
        {selectedUser.profilePicUrl ? (
   <img src={selectedUser.profilePicUrl} alt="Profile" className=" h-12 w-12 rounded-full cursor-pointer" />
  ):(
    <Image
    src={Avatar}
    alt="User Avatar"
    className="rounded-full h-10 w-10 cursor-pointer"
    />
  )}
            <p className="content-center  text-slate-700 font-semibold">
            {selectedUser.firstName} {selectedUser.lastName}
            </p>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto ">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${msg.senderId === currentUser.uid ? 'bg-[#4F46E5] text-white' : 'bg-slate-700 text-white'}`}>
              {msg.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
        {new Date(msg.createdAt.seconds * 1000).toLocaleString()}
      </div>
          </div>
        ))}
        
      </div>

      {emoji && (
        <div ref={emojiPickerRef} className="z-50 " style={{    width: 'fit-content'}}>
      <EmojiPicker onEmojiClick={handleEmojiClick} />
    </div>
  )}
      <div style={{    width:' -webkit-fill-available'}}
       className="fixed bottom-0 p-2 overflow-hidden bg-gray-200 flex items-center gap-5">
  <button onClick={()=>setemoji(!emoji)}><FaRegSmile/></button>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border border-gray-300 rounded"
          rows={1}
        />
        <Button variant='purple' onClick={handleSendMessage} className="">
          Send
        </Button>
      </div>


    </div>
  );
};

export default ChatWindow;
