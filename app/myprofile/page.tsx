'use client'
import Image from 'next/image'
import React from 'react'
import Ship from '@/public/images/ship.jpeg';
import ProfilePage from '@/components/profileform/page';
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
const page = () => {
  return (
    <div>
        
        <motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={2}
        className="relative overflow-hidden flex  px-40 py-10 md:p-40 bg-slate-200 text-black">

      <Image src={Ship} alt=''  layout="fill"
            quality={100} className="w-30 h-screen absolute inset-0 pointer-events-none"/>
   
        </motion.div>
        {/* <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-10 text-3xl font-bold tracking-tight first:mt-0">
             File Manager
            </h3>
          </div>
          <div>
            <p className="leading-7 text-slate-600 font-semibold">
            Your personal storage space
            </p>
          </div>
        </div> */}
        <ProfilePage/>
    </div>
  )
}

export default page