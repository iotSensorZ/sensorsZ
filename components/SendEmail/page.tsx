// components/SendEmail/page.tsx
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from '@/context/AuthContext';

interface EmailFormData {
  receiverId: string;
  subject: string;
  message: string;
}

interface EmailModalProps{
  isOpen:boolean;
  closeModal:()=>void;
}

const EmailModal: React.FC<EmailModalProps> = ({isOpen,closeModal})=> {
const { register, handleSubmit, reset,setValue, formState: { errors } } = useForm<EmailFormData>();
const [users, setUsers] = useState<any[]>([]);
const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
const [searchEmail, setSearchEmail] = useState('');
const [emailNotFound, setEmailNotFound] = useState(false);
const { currentUser } = useAuth();

useEffect(()=>{
//fetch users
const fetchUsers=async()=>{
try{
  const q = query(collection(firestore, "users"));
  const querySnapshot = await getDocs(q);
  const usersdata = querySnapshot.docs.map((doc) => ({
    id:doc.id,
    ...doc.data(),
  }));
  console.log(usersdata);
  setUsers(usersdata);

}catch(err){
  console.log("err fetching",err);
}
};
fetchUsers();
},[]);

const onSubmit=async(data:EmailFormData)=>{
console.log("form",data);
 // Query Firestore for the user ID using the email address
 const userQuery = query(collection(firestore, "users"), where("email", "==", data.receiverId));  
 const querySnapshot = await getDocs(userQuery);
 if(querySnapshot.empty){
  setEmailNotFound(true);
  return;
 }
 const receiverId=querySnapshot.docs[0].id;
 console.log("id milgyi",receiverId);
 try {
  await addDoc(collection(firestore, 'messages'), {
    receiverId: receiverId,
    receiverEmail: data.receiverId,
    subject: data.subject,
    message: data.message,
    senderId: currentUser?.uid,
    senderEmail: currentUser?.email,
    timestamp: serverTimestamp(),
  });
  alert("Message added to Firestore");
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
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Send Email</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
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
              {emailNotFound && <p className="text-red-500">Email not found</p>}
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
            <Input
              id="message"
              {...register('message', { required: true })}
              className="col-span-3"
            />
            {errors.message && <span className="text-red-500 col-span-4 text-right">This field is required</span>}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Send</Button>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
};

export default EmailModal;

