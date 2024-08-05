import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const firestore = getFirestore();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
console.log("id",id);

  if (req.method === 'GET') {
    try {
      const docRef = doc(firestore, 'resources', id as string);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        res.status(404).json({ error: 'Resource not found' });
      } else {
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  } else if (req.method === 'PUT') {
    const updatedData = req.body;
    try {
      const docRef = doc(firestore, 'resources', id as string);
      await updateDoc(docRef, updatedData);
      res.status(200).json({ id, ...updatedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update resource' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const docRef = doc(firestore, 'resources', id as string);
      await deleteDoc(docRef);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
