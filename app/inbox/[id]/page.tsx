'use client'
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Grip, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react"; 


interface Message {
    id: string;
    receiverId: string;
    receiverEmail: string;
    senderId: string;
    senderEmail: string;
    subject: string;
    message: string;
    timestamp: any;
  }


const Page: React.FC=()=>{
    const { id } = useParams() as { id: string };
    const [message, setMessage] = useState<Message | null>(null);
const {currentUser}=useAuth();

//fetch message 
useEffect(()=>{
const fetchMessage = async()=>{
  if(!currentUser)return;
if(id){
    const docRef = doc(firestore,'users',currentUser.uid,'messages',id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        setMessage(docSnap.data() as Message);
    }
    
}
}
fetchMessage();
},[id]);
if (!message) {
    return <p className="flex justify-center"> <Loader2 className="animate-spin" /></p>
  }
    return(
        <>
    
      <div className="my-10 container mx-auto p-4 bg-white h-screen rounded-2xl"> 
            <Grip style={{ color: "gray" }} />  
            <p className="my-10 text-sm text-gray-500 text-right">
              {new Date(message.timestamp.seconds * 1000).toLocaleString()}
            </p>
            <p className="my-10 font-light text-gray-800">From: {message.senderEmail}</p>
       <p className="text-lg font-bold">{message.subject}</p>
            <p className="my-5">{message.message}</p>
            </div>
            
        </>
    )
}

export default  Page;