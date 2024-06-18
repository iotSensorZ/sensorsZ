import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Message {
  id: string;
  receiverId: string;
  receiverEmail: string;
  senderId: string;
  senderEmail: string;
  subject: string;
  message: string;
  timestamp: any;
}

const Inbox:React.FC = ()=>{
const {currentUser} = useAuth();
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(()=>{
if(!currentUser)return; 

const fetchMessages = async()=>{
  try{
    const messagesRef = collection(firestore, 'messages');
    const q = query(messagesRef, where('receiverId', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const fetchedMessages: Message[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    
    setMessages(fetchedMessages);
    setLoading(false);
  }catch(err){
    console.log("err fetching",err);
  }
}
fetchMessages();
},[currentUser]);

if (loading) {
  return <p>Loading...</p>;
}

if (error) {
  return <p>{error}</p>;
}

if (messages.length === 0) {
  return <p>No messages found.</p>;
}
return (
    <>
   <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Inbox</h2>
      <ul>
        {messages.map((message) => (
          <li key={message.id} className="mb-2 p-1 border border-gray-300 rounded cursor-pointer  bg-gray-200">
              <Link href={`/inbox/${message.id}`}>
            <div className='flex '>
            <p className="text-lg font-medium">{message.subject}</p>
            {/* <p>{message.message}</p> */}
            <p className="text-sm text-gray-500 absolute right-20">
              {new Date(message.timestamp.seconds * 1000).toLocaleString()}
            </p>
            </div>
            <p className="text-sm text-gray-500">From: {message.senderEmail}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div> 
    </>
  )
}
export default Inbox; 