import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2, MailOpen, UsersRound } from 'lucide-react';

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

const Inbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [userEmails, setUserEmails] = useState<{ id: string, email: string }[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string | 'All'>('All');

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
        console.log("User data:", userData);

        // Retrieve the emails array from the user document
        const emails = userData.emails || [];

        // Ensure current user's email is included
        if (!emails.includes(currentUser.email)) {
          emails.unshift(currentUser.email); // Add the primary email to the start of the list
        }

        // Fetching the emails under emails collection
        const emailsCollectionRef = collection(firestore, 'users', currentUser.uid, 'emails');
        const emailSnapshot = await getDocs(emailsCollectionRef);
        const fetchedEmails = emailSnapshot.docs.map(doc => {
          const data = doc.data();
          return data.email;
        });

        // Combine both email sources
        const combinedEmails = Array.from(new Set([...emails, ...fetchedEmails]));
        const emailObjects = combinedEmails.map((email: string) => ({ id: email, email })); // Map to objects with id and email
        setUserEmails([{ id: 'All', email: 'All' }, ...emailObjects]); 
        console.log("Emails:", emailObjects);

        // setUserEmails(emailObjects);
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
        if (currentEmail === 'All') {
          const messagesRef = collection(firestore, 'users', currentUser.uid, 'messages');
          const q = query(messagesRef, orderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);

          fetchedMessages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
        } else {
          const messagesRef = collection(firestore, 'users', currentUser.uid, 'messages');
          const q = query(messagesRef, where('receiverEmail', '==', currentEmail), orderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);

          fetchedMessages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
        }

        console.log("Fetched messages:", fetchedMessages);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  // if (messages.length === 0) {
  //   return <p>No messages found.</p>;
  // }

  return (
    <>
      <div className="container mx-auto p-4 bg-white h-screen rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Inbox</h2>
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
        <ul>
  {messages.map((message) => (
    <li key={message.id} className="grid grid-cols-4 gap-4 mb-2 p-1 border border-gray-200 hover:bg-slate-100 rounded cursor-pointer">
      <Link href={`/inbox/${message.id}`} className="contents">
        <div className='flex items-center col-span-1'>
          <MailOpen style={{ color: "gray" }} />
          <p className="ml-3 text-sm text-gray-500">From: {message.senderEmail}</p>
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
{messages.length == 0 && <p>Your Inbox is Empty!</p>}

      </div>
    </>
  );
};

export default Inbox;
