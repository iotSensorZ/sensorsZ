import { useAuth } from '@/context/AuthContext';
import { auth, firestore } from '@/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, orderBy, query, limit, where, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Avatar from '@/public/images/avatar.jpg';
import Image from 'next/image';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
}

interface UserWithTimestamp extends User {
  latestTimestamp: number;
  unreadCount: number; // Add this field
}

interface UserListProps {
  users: User[];
  setSelectedUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, setSelectedUser }) => {
  const { currentUser } = useAuth();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [sortedUsers, setSortedUsers] = useState<UserWithTimestamp[]>([]);

  if (!currentUser) return null;

  useEffect(() => {
    const fetchCurrentUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.firstName} ${userData.lastName}`);
            setUserEmail(userData.email);
          }
        }
      });
      return () => unsubscribe();
    };

    fetchCurrentUserDetails();
  }, [currentUser]);

  useEffect(() => {
    const fetchLatestTimestamps = async () => {
      const userWithTimestamps: UserWithTimestamp[] = await Promise.all(
        users.map(async (user) => {
          const chatId = [currentUser.uid, user.id].sort().join('_');
          const q = query(
            collection(firestore, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );

          let latestTimestamp = 0;
          let unreadCount = 0;

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const latestMessage = snapshot.docs[0];
            if (latestMessage) {
              latestTimestamp = latestMessage.data().createdAt.seconds;
            }

            const unreadQuery = query(
              collection(firestore, 'chats', chatId, 'messages'),
              where('isRead', '==', false),
              where('receiverId', '==', currentUser.uid)
            );

            getDocs(unreadQuery).then(unreadSnapshot => {
              unreadCount = unreadSnapshot.size;
              setSortedUsers((prevUsers) => {
                const updatedUsers = prevUsers.map((u) =>
                  u.id === user.id ? { ...u, latestTimestamp, unreadCount } : u
                );
                updatedUsers.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
                return updatedUsers;
              });
            });
          });

          return { ...user, latestTimestamp, unreadCount };
        })
      );

      userWithTimestamps.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
      setSortedUsers(userWithTimestamps);
    };

    fetchLatestTimestamps();
  }, [users, currentUser]);

  return (
    <div className="w-1/4 pr-1 bg-white overflow-y-auto">
      <div className='p-3 bg-gray-100 mb-4'>
        <h3 className="scroll-m-20 text-2xl font-light">{userName}</h3>
        <p className="scroll-m-20 mt-4 text-xs font-light">{userEmail}</p>
      </div>
      <div>
        <h2 className="text-[#4F46E5] border-b text-xl mt-10 p-2 font-medium my-4">Chats</h2>
        {sortedUsers.map(user => (
          <div
            key={user.id}
            className="pl-3 p-3 border-b cursor-pointer hover:bg-gray-200 flex justify-between items-center"
            onClick={() => setSelectedUser(user)}
          >
            <div className='flex gap-4'>
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="Profile" className="h-12 w-12 rounded-full cursor-pointer" />
              ) : (
                <Image
                  src={Avatar}
                  alt="User Avatar"
                  className="rounded-full h-10 w-10 cursor-pointer"
                />
              )}
              <div>
                <p className='flex justify-between'>{user.firstName} {user.lastName}
                {user.unreadCount > 0 && (
              <div className="bg-purple-800 text-white rounded-full h-6 w-6 flex justify-center">
                {user.unreadCount}
              </div>
            )}
                </p>
                <p>{user.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
