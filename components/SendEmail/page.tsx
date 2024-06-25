import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from '@/context/AuthContext';
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

interface EmailFormData {
  receiverId: string;
  subject: string;
  message: string;
}

interface EmailModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

interface UserEmail {
  id: string;
  email: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, closeModal }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmailFormData>();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [emailNotFound, setEmailNotFound] = useState(false);
  const { currentUser } = useAuth();
  const [senderEmails, setSenderEmails] = useState<UserEmail[]>([]);
  const [selectedSenderEmail, setSelectedSenderEmail] = useState<string>('');

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const q = query(collection(firestore, "users"));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (err) {
        console.log("Error fetching users", err);
      }
    };

    // Fetch user's added emails and include current user's email
    const fetchSenderEmails = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            throw new Error('User not found');
          }

          const userData = userDocSnapshot.data();
          console.log("User data:", userData);

          // Retrieve the emails array from the user document
          const emails = userData.emails || [];

          // Ensure current user's email is included
          if (!emails.includes(currentUser.email)) {
            emails.unshift(currentUser.email); // Add the primary email to the start of the list
          }

          // Fetching the emails under emails collection
          const emailsCollectionRef = collection(firestore, 'users', currentUser.uid, 'emails');
          const emailSnapshot = await getDocs(emailsCollectionRef);
          const fetchedEmails = emailSnapshot.docs.map(doc => {
            const data = doc.data();
            return data.email;
          });

          // Combine both email sources
          const combinedEmails = Array.from(new Set([...emails, ...fetchedEmails]));
          const emailObjects = combinedEmails.map((email: string) => ({ id: email, email })); // Map to objects with id and email

          console.log("Emails:", emailObjects);

          setSenderEmails(emailObjects);
          if (combinedEmails.length > 0) {
            setSelectedSenderEmail(combinedEmails[0]);
          }
        }
      } catch (err) {
        console.log("Error fetching sender emails", err);
      }
    };

    fetchUsers();
    fetchSenderEmails();
  }, [currentUser]);

  const onSubmit = async (data: EmailFormData) => {
    console.log("form", data);

    try {
        let receiverId = null;

        // Check in the users collection
        const userQuery = query(collection(firestore, "users"), where("email", "==", data.receiverId));
        const userQuerySnapshot = await getDocs(userQuery);
        if (!userQuerySnapshot.empty) {
            receiverId = userQuerySnapshot.docs[0].id;
        }

        // If not found in users, check in the emails sub-collection
        if (!receiverId) {
            const usersSnapshot = await getDocs(collection(firestore, "users"));
            for (const userDoc of usersSnapshot.docs) {
                const emailsCollectionRef = collection(firestore, 'users', userDoc.id, 'emails');
                const emailSnapshot = await getDocs(emailsCollectionRef);
                const emailDoc = emailSnapshot.docs.find(emailDoc => emailDoc.data().email === data.receiverId);
                if (emailDoc) {
                    receiverId = userDoc.id;
                    break;
                }
            }
        }

        if (!receiverId) {
            setEmailNotFound(true);
            console.error("Receiver email not found in the user's emails");
            toast.error("Receiver email not found in the user's emails");
            return;
        }

        console.log("Receiver ID found", receiverId);

        if (!currentUser) return;
        await addDoc(collection(firestore, 'users', receiverId, 'messages'), {
            receiverId: receiverId,
            receiverEmail: data.receiverId,
            subject: data.subject,
            message: data.message,
            senderId: currentUser.uid,
            senderEmail: selectedSenderEmail,
            timestamp: serverTimestamp(),
        });
        toast.success("Message Sent");
        reset();
        closeModal();
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmail(value);
    if (value.trim() === '') {
      setFilteredUsers([]);
      setEmailNotFound(false);
      return;
    }
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setEmailNotFound(filtered.length === 0);
  };

  const handleSelectEmail = (email: string) => {
    setSearchEmail(email);
    setValue('receiverId', email);
    setFilteredUsers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-medium">Send Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="senderEmail" className="text-right">
                From:
              </Label>
              <div className="col-span-3">
                <select
                  id="senderEmail"
                  value={selectedSenderEmail}
                  onChange={(e) => setSelectedSenderEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {senderEmails.map((email) => (
                    <option key={email.id} value={email.email}>{email.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiverId" className="text-right">
                To:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="receiverId"
                  {...register('receiverId', { required: true })}
                  value={searchEmail}
                  onChange={handleSearch}
                  className="w-full"
                />
                {filteredUsers.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full max-h-40 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectEmail(user.email)}
                        className="cursor-pointer p-2 hover:bg-gray-200"
                      >
                        {user.email}
                      </li>
                    ))}
                  </ul>
                )}
                {/* {emailNotFound && <p className="text-red-500">Email not found</p>} */}
              </div>
              {errors.receiverId && <span className="text-red-500">This field is required</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject:
              </Label>
              <Input
                id="subject"
                {...register('subject', { required: true })}
                className="col-span-3"
              />
              {errors.subject && <span className="text-red-500 col-span-4 text-right">This field is required</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Description:
              </Label>
              <Textarea
                id="message"
                {...register('message', { required: true })}
                className="col-span-3"
                rows={3}
              />
              {errors.message && <span className="text-red-500 col-span-4 text-right">This field is required</span>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="blue" type="submit">Send</Button>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
