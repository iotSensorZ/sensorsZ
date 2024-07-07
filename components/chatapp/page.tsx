import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import UserList from '../chatList/page';
import ChatWindow from '../chatWindow/page';
import { FaRocketchat } from "@react-icons/all-files/fa/FaRocketchat";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email:string;
  profilePicUrl:string;
}

const ChatApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    };

    fetchUsers();
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>; // Or any other loading state
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <UserList users={users} setSelectedUser={setSelectedUser} />
      {selectedUser ?
      (
        <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
      ) : (
        <div className=" flex gap-6 text-center align-middle items-center justify-center w-2/3 h-full">
          <FaRocketchat className='text-7xl text-gray-500'/>
        <p className="text-gray-500">Select a conversation or start a new chat</p>
      </div>
      )
    }
    </div>
  );
};

export default ChatApp;
