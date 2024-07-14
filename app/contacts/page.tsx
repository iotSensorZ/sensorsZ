'use client'
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { firestore } from "@/firebase/firebase";
import { collection, writeBatch, doc, getDocs, updateDoc, deleteDoc, DocumentReference, getDoc } from "firebase/firestore";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface Contact {
  id?: string; // Include the document ID for editing and deleting
  Name: string;
  Phone: string;
  Email: string;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the file input

  useEffect(() => {
    if (currentUser) {
      fetchUserContacts();
    }
  }, [currentUser]);

  const fetchUserContacts = async () => {
    if (!currentUser) return;

    const userContactsCollection = collection(firestore, 'users', currentUser.uid, 'contacts');
    const contactsSnapshot = await getDocs(userContactsCollection);

    const fetchedContacts: Contact[] = contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contact[];
    setContacts(fetchedContacts);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsedContacts = results.data.map((row: any) => ({
            Name: row['Name'] || '',
            Phone: row['Phone 1 - Value'] ? Number(row['Phone 1 - Value']).toString() : '',
            Email: row['E-mail 1 - Value'] || '',
          }));
          setContacts(parsedContacts);
        }
      });
    }
  };

  const handleSaveContacts = async () => {
    setLoading(true);
    if (!currentUser) return;

    const batch = writeBatch(firestore);
    const userContactsCollection = collection(firestore, 'users', currentUser.uid, 'contacts');

    contacts.forEach(contact => {
      if (contact.Name) {
        const docRef: DocumentReference = doc(userContactsCollection); // Create a new document reference
        batch.set(docRef, contact); // Add the document to the batch
      } else {
        console.error('Invalid contact data:', contact);
      }
    });

    try {
      await batch.commit(); // Commit the batch
    //   alert('Contacts saved successfully!');
      setContacts([]); // Reset contacts to prevent duplicate saving
      fetchUserContacts(); // Fetch the contacts again after saving

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input to null
      }
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Failed to save contacts. Please check the console for more details.');
    }

    setLoading(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditContact(contact);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!currentUser || !contactId) return;

    const contactDocRef = doc(firestore, 'users', currentUser.uid, 'contacts', contactId);
    try {
      await deleteDoc(contactDocRef);
      fetchUserContacts(); // Fetch the contacts again after deletion
    //   alert('Contact deleted successfully!');
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please check the console for more details.');
    }
  };

  const handleUpdateContact = async () => {
    if (!currentUser || !editContact || !editContact.id) return;

    const contactDocRef = doc(firestore, 'users', currentUser.uid, 'contacts', editContact.id);
    try {
      const docSnapshot = await getDoc(contactDocRef);
      if (docSnapshot.exists()) {
        await updateDoc(contactDocRef, editContact as { [key: string]: any });
        setEditContact(null); // Clear the edit state
        fetchUserContacts(); // Fetch the contacts again after updating
        // alert('Contact updated successfully!');
      } else {
        console.error('No document to update:', contactDocRef);
        alert('No document to update. Please check if the contact still exists.');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please check the console for more details.');
    }
  };

  return (
    <div className="">
          <div
        className="relative overflow-hidden flex  px-10 py-10 md:p-10 bg-slate-200 text-black">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
            Import Contacts
            </h3>
          </div>
          <div>
          <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4"
        ref={fileInputRef} // Set the ref to the input element
      />
      <Button
        onClick={handleSaveContacts}
        disabled={loading || contacts.length === 0} // Disable if no contacts to save
        variant='purple'
      >
        {loading ? 'Saving...' : 'Save Contacts'}
      </Button>
          </div>
        </div>
      </div>
   
      <div className="mt-4">
        <h2 className="text-xl font-semibold m-5"> Contacts</h2>
        <ul>
          {contacts.map((contact, index) => (
            <li key={index} className="border-b py-4 flex justify-between p-4 items-center bg-white  border-gray-300 hover:bg-gray-100">
              {editContact && editContact.id === contact.id ? (
                <div className="flex ">
                  <input
                    type="text"
                    value={editContact.Name}
                    onChange={(e) => setEditContact({ ...editContact, Name: e.target.value })}
                    placeholder="Name"
                    className="mb-2"
                  />
                  <input
                    type="text"
                    value={editContact.Email}
                    onChange={(e) => setEditContact({ ...editContact, Email: e.target.value })}
                    placeholder="Email"
                    className="mb-2"
                  />
                  <input
                    type="text"
                    value={editContact.Phone}
                    onChange={(e) => setEditContact({ ...editContact, Phone: e.target.value })}
                    placeholder="Phone"
                    className="mb-2"
                  />
                  <Button onClick={handleUpdateContact} variant='purple'>Update</Button>
                </div>
              ) : (
                <>
                  <div>
                    {contact.Name} 
                    {contact.Email?' - ' + contact.Email:''}
                    {contact.Phone? ' - '+contact.Phone:''}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditContact(contact)} variant='outline'>Edit</Button>
                    <Button onClick={() => handleDeleteContact(contact.id!)} variant='default'>Delete</Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Contacts;
