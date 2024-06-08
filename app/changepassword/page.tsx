"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import Link from 'next/link';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [message, setMessage] = useState<string|null>(null);
  const router = useRouter();

  const handleChangePassword = async (event:React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if(newPassword !== confirmPassword){
        setError("New passwords do not match");
        return;
    }
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // Re-authenticate user to change the password if necessary
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword,
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setMessage("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push("/dashboard");
      } else {
        setError("No user is currently signed in");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
            <div className="bg-gradient-to-b from-gray-500 to-black flex justify-center items-center h-screen w-screen">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-4xl font-bold mb-4">Change Password</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      <form onSubmit={handleChangePassword} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="currentPassword" className="text-sm font-medium block mb-2">
            Current Password
          </label>
          <Input
            type="password"
            id="currentPassword"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newPassword" className="text-sm font-medium block mb-2">
            New Password
          </label>
          <Input
            type="password"
            id="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
            Confirm Password
          </label>
          <Input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">Change Password</Button>
      </form>
    </div>
    </div>
  );
};

export default ChangePassword;
