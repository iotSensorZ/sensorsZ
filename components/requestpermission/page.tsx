// components/RequestPermission.tsx
'use client'
import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, firestore } from '@/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'your-vapid-key' });
      console.log('FCM Token:', token);
      // Save the token to Firestore
      await addDoc(collection(firestore, 'fcmTokens'), { token });
    }
  } catch (error) {
    console.error('Error getting permission or token:', error);
  }
};

const RequestPermission = () => {
  useEffect(() => {
    requestPermission();
  }, []);

  return null;
};

export default RequestPermission;
