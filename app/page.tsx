"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import type { User } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // If no user document exists, create one from local storage data
            const registrationData = localStorage.getItem("registrationData");
            if (registrationData) {
              const { firstName="", lastName="", email="" } = registrationData? JSON.parse(registrationData):{};
              

              //creating an document under collection users
              const newUserDoc = {
                firstName,
                lastName,
                email:user.email,
                uid: user.uid,
                verified: user.emailVerified,
              };
              await setDoc(doc(firestore,"users",user.uid),newUserDoc)
              // await setDoc(userDocRef, newUserDoc);
              
              //clear registration data form local storage
              localStorage.removeItem("registrationData")

              setUserData(newUserDoc);
            }
          }
          setUser(user);
          setLoading(false);
          router.push("/dashboard")
        } else {
          // User not verified, redirect or show a message
          setLoading(false);
          setUser(null)
          router.push("/verify-email");
        }
      } else {
        // User not logged in, redirect to login
        setLoading(false);
        setUser(null)
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {user?"dashboard":"login"}
      <h1>Welcome, {userData?.firstName}!</h1>
      <p>Your email: {userData?.email}</p>
      <p>Your UID: {user?.uid}</p>
    </main>
  );
}
