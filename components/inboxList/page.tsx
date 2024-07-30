import React, { useState } from 'react';
import EmailManagement from '../EmailManagement/page';
import EmailModal from '../SendEmail/page';
import { FaMailBulk } from '@react-icons/all-files/fa/FaMailBulk';
import Link from 'next/link';
import { motion } from "framer-motion"


const fadeInAnimationsVariants={
  initial:{
    opacity:0,
    y:100
  },
  animate: (index:number) => ({
    opacity:1,
    y:0,
    transition:{
      delay:0.05*index
    }
  }
)
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
}

const InboxList: React.FC = () => {
  const [showEmailCard, setShowEmailCard] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
    const handleCloseCard = () => {
        setShowEmailCard(false);
      };
  return (
    <div className="w-1/4 pr-1 overflow-y-auto mx-auto bg-white h-screen">
      <div className="relative overflow-hidden flex px-10 py-10 md:p-10 bg-slate-100 text-black">
        <div className="flex flex-col mx-auto w-full">
          <h3 className="scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">MailBox</h3>
        </div>
      </div>
    
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-6 rounded-full shadow-lg hover:bg-blue-700"
        onClick={openModal}
      >
        <FaMailBulk className='text-lg' />
      </button>
      <EmailModal isOpen={isModalOpen} closeModal={closeModal} />
      <motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={15} >
      <p className="text-[#4F46E5] p-2 font-semibold">MAILBOXES</p>
      <ul className="text-slate-600 p-2">  
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">
          <Link href='/inbox'>
          Inbox
          </Link>
          </li>
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">Sent</li>
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">Starred</li>
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">Drafts</li>
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">Spam</li>
        <li className="p-2 m-1 rounded-md hover:text-black hover:bg-slate-100 cursor-pointer">Trash</li>
      </ul>
      </motion.div>
      {showEmailCard && (
          <div className=' fixed right-5 top-12 p-5 z-50'>
            <EmailManagement onClose={handleCloseCard} />
          </div>
        )}
    </div>
  );
};

export default InboxList;
