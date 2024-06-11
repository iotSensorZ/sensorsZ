/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.notifyOnNewReport = functions.firestore
  .document('reports/{reportId}')
  .onCreate((snap:any, context:any) => {
    const newReport = snap.data();
    const notification = {
      title: 'New Report Added',
      content: newReport.title,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    return admin.firestore().collection('notifications').add(notification)
      .then(() => {
        console.log('Notification added successfully');
      })
      .catch((error:any) => {
        console.error('Error adding notification:', error);
      });
  });
