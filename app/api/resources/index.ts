// import { NextApiRequest, NextApiResponse } from 'next';

// const resources = [
//   {
//     id: '1',
//     name: 'Hospital A',
//     description: 'A leading healthcare facility.',
//     address: '123 Main St, City, Country',
//     latitude: 38.89511,
//     longitude: -77.03637,
//     openingHours: 'Mon-Fri 8am-8pm',
//     rating: 4.5,
//     image: 'https://via.placeholder.com/200',
//     type: 'hospital'
//   },
//   {
//     id: '2',
//     name: 'School B',
//     description: 'An excellent educational institution.',
//     address: '456 Elm St, City, Country',
//     latitude: 40.7128,
//     longitude: -74.0060,
//     openingHours: 'Mon-Fri 8am-3pm',
//     rating: 4.8,
//     image: 'https://via.placeholder.com/200',
//     type: 'school'
//   },
//   // Add more resources as needed
// ];

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { filter } = req.query;

//   let filteredResources = resources;

//   if (filter !== 'all') {
//     filteredResources = resources.filter(resource => resource.type === filter);
//   }

//   res.status(200).json(filteredResources);
// }



import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/firebase/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { filter } = req.query;
    let resourceCollection = collection(firestore, 'resources');

    try {
      const snapshot = await getDocs(resourceCollection);
      const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(resources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  } else if (req.method === 'POST') {
    const resource = req.body;
    try {
      const docRef = await addDoc(collection(firestore, 'resources'), resource);
      res.status(201).json({ id: docRef.id, ...resource });
    } catch (error) {
      console.error('Failed to create resource:', error);
      res.status(500).json({ error: 'Failed to create resource' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;