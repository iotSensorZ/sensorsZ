'use client'
import { firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
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

//fetch message 
useEffect(()=>{
const fetchMessage = async()=>{
if(id){
    const docRef = doc(firestore,'messages',id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        setMessage(docSnap.data() as Message);
    }
}
}
fetchMessage();
},[id]);
if (!message) {
    return <p>Loading...</p>;
  }
    return(
        <>
       <div>
       <p className="text-lg font-medium">{message.subject}</p>
            <p className="text-sm text-gray-500">From: {message.senderEmail}</p>
            <p className="mt-5 text-sm">{message.message}</p>
            <p className="mt-5 text-sm text-gray-500 absolute right-20">
              {new Date(message.timestamp.seconds * 1000).toLocaleString()}
            </p>
            </div>
            
        </>
    )
}

export default  Page;