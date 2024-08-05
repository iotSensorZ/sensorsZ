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


import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await getDocs(collection(firestore, 'resources'));
    const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(resources, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const resource = await req.json();
    const docRef = await addDoc(collection(firestore, 'resources'), resource);
    return NextResponse.json({ id: docRef.id, ...resource }, { status: 201 });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing resource ID' }, { status: 400 });
  }

  const updatedData = await req.json();
  
  try {
    const docRef = doc(firestore, 'resources', id);

    if (updatedData.imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${updatedData.imageFile.name}`);
      await uploadBytes(storageRef, updatedData.imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      updatedData.image = downloadURL;
      delete updatedData.imageFile; // Remove the imageFile from the updatedData
    }

    await updateDoc(docRef, updatedData);
    return NextResponse.json({ id, ...updatedData }, { status: 200 });
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing resource ID' }, { status: 400 });
  }

  try {
    const docRef = doc(firestore, 'resources', id);
    await deleteDoc(docRef);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}



export async function OPTIONS() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
