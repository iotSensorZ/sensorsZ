import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, firestore } from "@/firebase/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { addDoc, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface UserEmail {
  id: string;
  email: string;
  verified: boolean;
}

const EmailManagement: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState<UserEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!currentUser) return;
      const emailsRef = collection(firestore, "users", currentUser.uid, "emails");
      const querySnapshot = await getDocs(emailsRef);
      const emailData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserEmail[];

      // Ensure current user's primary email is at the 0th index
      if (currentUser.email) {
        emailData.unshift({ id: "currentUser", email: currentUser.email, verified: currentUser.emailVerified });
      }

      setEmails(emailData);
    };

    fetchEmails();
  }, [currentUser]);

  const handleAddEmail = async () => {
    if (!currentUser || !newEmail.trim()) return;

    const emailsRef = collection(firestore, "users", currentUser.uid, "emails");
    const newEmailDoc = await addDoc(emailsRef, { email: newEmail, verified: false });

    // Send verification email
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      alert("Verification email sent. Please check your inbox.");
    }

    setNewEmail("");
    fetchEmails();
  };

  const fetchEmails = async () => {
    if (!currentUser) return;
    const emailsRef = collection(firestore, "users", currentUser.uid, "emails");
    const querySnapshot = await getDocs(emailsRef);
    const emailData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserEmail[];

    // Ensure current user's primary email is at the 0th index
    if (currentUser.email) {
      emailData.unshift({ id: "currentUser", email: currentUser.email, verified: currentUser.emailVerified });
    }

    setEmails(emailData);
  };

  const handleVerifyEmail = async (emailId: string, email: string) => {
    if (!currentUser) return;

    try {
      await reload(currentUser); // Reload user data from Firebase Auth

      if (currentUser.emailVerified) {
        const updatedEmails = emails.map(emailObj => {
          if (emailObj.email === email) {
            return { ...emailObj, verified: true };
          }
          return emailObj;
        });

        setEmails(updatedEmails);

        // Update Firestore document
        const emailDoc = doc(firestore, "users", currentUser.uid, "emails", emailId);
        await updateDoc(emailDoc, { verified: true });
      } else {
        alert("Please verify your email from the link sent to your inbox.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={cardRef} className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Email Accounts</h2>
      <input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Add email"
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <Button variant="blue" onClick={handleAddEmail} className="w-full mb-4">
        Add
      </Button>

      <ul>
        {emails.map((email) => (
          <li key={email.id} className="flex justify-between items-center mb-2 text-blue-600">
            {email.email} {email.verified ? "(Verified)" : "(Pending)"}
            {!email.verified && email.id !== "currentUser" && (
              <button onClick={() => handleVerifyEmail(email.id, email.email)}>Verify</button>
            )}
          </li>
        ))}
      </ul>
      {emails.length === 0 && <p className="flex justify-center"> <Loader2 className="animate-spin" /></p>}
    </div>
  );
};

export default EmailManagement;
