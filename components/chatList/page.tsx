import { useAuth } from '@/context/AuthContext';
import { auth, firestore } from '@/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email:string
}

interface UserListProps {
  users: User[];
  setSelectedUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, setSelectedUser }) => {
  const {currentUser} = useAuth();
  const [userEmail, setuserEmail] = useState('')
  const [userName, setUserName] = useState<string | null>(null);

  if(!currentUser)return null;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setuserEmail(userData.email);
        }
  console.log(currentUser.email)
} else {
}
});
return () => unsubscribe();
}, []);

  return (
    <div className="w-1/4 pr-1 bg-white  overflow-y-auto">
     <div className=' p-3 bg-gray-100 mb-4'>
      <h3 className="scroll-m-20 text-2xl font-light">
              {userName}
            </h3>
      <p className="scroll-m-20 mt-4 text-xs font-light">
              {userEmail}
            </p>
     </div>
     <div>
      <h2 className="text-[#4F46E5] border-b text-xl mt-10 p-2 font-medium my-4">Chats</h2>
      {users.map(user => (
        <div
          key={user.id}
          className="pl-3 p-3  border-b cursor-pointer hover:bg-gray-200"
          onClick={() => setSelectedUser(user)}
        >
          <p>{user.firstName} {user.lastName}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
    </div>
  );
};

export default UserList;
