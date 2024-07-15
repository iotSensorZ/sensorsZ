'use client'
import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase/firebase';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface MessageDetailProps {
  messageId: string;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ messageId }) => {
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {currentUser}=useAuth();
  useEffect(() => {
    if (!messageId) return;

    const fetchMessage = async () => {
      if(!currentUser)return;
      try {
        const docRef = doc(firestore,'users',currentUser.uid,'messages', String(messageId));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMessage(docSnap.data());
        } else {
          setError('Message not found');
        }
      } catch (err) {
        console.error('Error fetching message:', err);
        setError('Error fetching message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [messageId]);

  if (loading) {
    return (
      <div className="text-gray-500 h-full flex-col w-3/4 flex justify-center items-center mt-4">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!message) {
    return <p>No message found</p>;
  }

  return (
    <div className='w-3/4 '>
    <div className="bg-slate-50 h-screen rounded-2xl">
      <div className="relative overflow-hidden flex px-10 py-5 md:p-5 bg-slate-50 text-black">
        <div className="flex flex-col mx-auto w-full">
          <h3 className="text-[#4F46E5] scroll-m-20 pb-2 text-3xl font-light tracking-tight first:mt-0"></h3>
        </div>
      </div>
      <div className="relative overflow-hidden flex px-10 py-5 md:p-5 bg-white text-black">
        <div className="flex flex-col mx-auto w-full">
          <h3 className="text-[#4F46E5] pb-2 text-3xl font-semibold mx-3">{message.subject}</h3>
        </div>
      </div>
          <div className="m-4 bg-white rounded-lg p-5">
            <p><strong>From:</strong> {message.senderEmail}</p>
            <p><strong>To:</strong> {message.receiverEmail}</p>
            <div className='mt-5'>
            <p>{message.message}</p>
            </div>
          </div>
    </div>
  </div>
  );
};

export default MessageDetail;
