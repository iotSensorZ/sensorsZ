// // pages/api/sendEmail.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import mailgun from 'mailgun-js';

// const mg = mailgun({
//   apiKey: '51356527-06cfcc59' || '',
//   domain: 'sandbox5028a11da5f946e59712090352d026a4.mailgun.org '|| '',
// });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { to, subject, text, html } = req.body;

//     if (!to || !subject || !text || !html) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const data = {
//       from: 'Your Name <your-email@example.com>',
//       to,
//       subject,
//       text,
//       html,
//     };

//     try {
//       await mg.messages().send(data);
//       return res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//       console.error('Error sending email:', error);
//       return res.status(500).json({ message: 'Error sending email' });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }