// // pages/api/paraphrase.js

// import axios from 'axios';

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { text } = req.body;

//     try {
//       const response = await axios.post(
//         'https://api.prowritingaid.com/analysis/async',
//         { text, service: 'paraphrase' },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PROWRITINGAID_API_KEY}`,
//           },
//         }
//       );

//       res.status(200).json(response.data);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to paraphrase text', details: error.message });
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' });
//   }
// }
