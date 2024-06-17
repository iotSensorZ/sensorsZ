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












import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

admin.initializeApp();
const firestore = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

app.post('/sendMessage', async (req: express.Request, res: express.Response) => {
  const { recipient, subject, body } = req.body;

  // Default user handling (for example purposes)
  const sender = 'defaultUserId'; // Replace this with actual user ID logic

  const newMessage = {
    sender,
    recipient,
    subject,
    body,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await firestore.collection('messages').add(newMessage);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Unable to send message');
  }
});

exports.sendMessage = functions.https.onRequest(app);



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



