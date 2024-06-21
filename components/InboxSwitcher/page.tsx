'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const InboxSwitcher = ({ onSelectInbox }: { onSelectInbox: (email: string) => void }) => {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!currentUser) return;
      const emailsRef = collection(firestore, 'users', currentUser.uid, 'userEmails');
      const querySnapshot = await getDocs(emailsRef);
      const emailData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmails(emailData);
    };

    fetchEmails();
  }, [currentUser]);

  return (
    <div>
      <h2>Switch Inbox</h2>
      <ul>
        {emails.map((email) => (
          <li key={email.id} onClick={() => onSelectInbox(email.email)}>
            {email.email} {email.verified ? '(Verified)' : '(Pending)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InboxSwitcher;
