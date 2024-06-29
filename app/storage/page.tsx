// pages/storage.js
'use client'
import FileList from '../../components/filelist/page';
import FileUpload from '../../components/fileupload/page';
import { useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


const StoragePage = () => {

  const router = useRouter();
  return (
    <div className="">
        <div
        className="relative overflow-hidden flex  px-10 py-10 md:p-10 bg-slate-200 text-black">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
             File Manager
            </h3>
          </div>
          <div>
            <p className="leading-7 text-slate-600 font-semibold">
            Your personal storage space
            </p>
          </div>
        </div>
      </div>


      <div className='mt-16 bg-slate-200 p-4 m-4 rounded-xl'>
      <FileList/>
      </div>
    </div>
  );
};

export default StoragePage;
