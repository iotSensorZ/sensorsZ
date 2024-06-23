'use client';
import React, { useEffect, useState } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifications: React.FC = () => {
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    console.log('Setting up Firestore listener for notifications...');

    const q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const report = change.doc.data();
        
        if (report.createdAt) {
          if (report.createdAt.seconds != null) {
            const reportTimestamp = report.createdAt.seconds * 1000;

            // Show notification only for new reports added after the last seen timestamp
            if (change.type === 'added' && reportTimestamp > lastSeenTimestamp) {
              console.log('New report added:', report);
              toast.info(`New Report Added: ${report.title}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });

              // Update the last seen timestamp to the current report's timestamp
              setLastSeenTimestamp(reportTimestamp);
            }
          } else {
            console.log('Invalid createdAt.seconds:', report.createdAt);
          }
        } else {
          console.log('Missing createdAt field in report:', report);
        }
      });
    });

    return () => unsubscribe();
  }, [lastSeenTimestamp]);

  return <ToastContainer />;
};

export default Notifications;
