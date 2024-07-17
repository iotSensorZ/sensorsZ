import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailOpen } from 'lucide-react';

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

const InboxWindow: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmails, setUserEmails] = useState<{ id: string, email: string }[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string | 'All'>('All');
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserEmails = async () => {
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
          throw new Error('User not found');
        }

        const userData = userDocSnapshot.data();
        const emails = userData.emails || [];

        if (!emails.includes(currentUser.email)) {
          emails.unshift(currentUser.email);
        }

        const emailsCollectionRef = collection(firestore, 'users', currentUser.uid, 'emails');
        const emailSnapshot = await getDocs(emailsCollectionRef);
        const fetchedEmails = emailSnapshot.docs.map(doc => {
          const data = doc.data();
          return data.email;
        });

        const combinedEmails = Array.from(new Set([...emails, ...fetchedEmails]));
        const emailObjects = combinedEmails.map((email: string) => ({ id: email, email }));
        setUserEmails([{ id: 'All', email: 'All' }, ...emailObjects]);

        if (combinedEmails.length > 0) {
          setCurrentEmail('All');
        }
      } catch (err) {
        console.error('Error fetching user emails:', err);
      }
    };

    fetchUserEmails();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        let fetchedMessages: Message[] = [];
        const messagesRef = collection(firestore, 'users', currentUser.uid, 'messages');
        const q = currentEmail === 'All'
          ? query(messagesRef, orderBy('timestamp', 'desc'))
          : query(messagesRef, where('receiverEmail', '==', currentEmail), orderBy('timestamp', 'desc'));
        
        const querySnapshot = await getDocs(q);
        fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Error fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser, currentEmail]);

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
  };

  const handleMessageClick = (messageId: string) => {
    router.push(`/inbox?messageId=${messageId}`);
  };

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

  return (
    <div className='w-3/4'>
      <div className="bg-white h-screen rounded-2xl">
        <div className="relative overflow-hidden flex px-10 py-5 md:p-5 bg-slate-50 text-black">
          <div className="flex flex-col mx-auto w-full">
            <h3 className="text-[#4F46E5] scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">Inbox</h3>
            <div className="mb-4 text-right">
              <label htmlFor="emailSelect" className="mr-2">Select Email:</label>
              <select
                id="emailSelect"
                value={currentEmail || ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              >
                {userEmails.map((email) => (
                  <option key={email.id} value={email.email}>{email.email}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ul className='mt-5'>
          {messages.map((message) => (
            <li
              key={message.id}
              className="grid grid-cols-5 gap-4 p-3 hover:bg-slate-100 rounded cursor-pointer"
            >
              <Link href={`/inbox?messageId=${message.id}`} className="contents">
                <div className='flex items-center col-span-2'>
                  <MailOpen className='w-5 h-5' style={{ color: "gray" }} />
                  <p className="ml-3 text-sm font-semibold text-gray-800">{message.senderEmail}</p>
                </div>
                <div className='col-span-2 flex items-center'>
                  <p className="text-slate-600">{message.subject}</p>
                </div>
                <div className='flex items-center justify-end col-span-1'>
                  <p className="text-sm text-gray-500">
                    {message.timestamp && message.timestamp.seconds ? new Date(message.timestamp.seconds * 1000).toLocaleString() : 'No date'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {messages.length === 0 && <p>Your Inbox is Empty!</p>}
      </div>
    </div>
  );
};

export default InboxWindow;
