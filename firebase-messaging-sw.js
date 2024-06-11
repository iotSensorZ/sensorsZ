// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAKZtOMo3aDGy-EzIZPmnVUh5jOv0f6cio",
    authDomain: "upload-79a0b.firebaseapp.com",
    projectId: "upload-79a0b",
    storageBucket: "upload-79a0b.appspot.com",
    messagingSenderId: "766016582835",
    appId: "1:766016582835:web:b3ac4141894a7db50b6cc6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
