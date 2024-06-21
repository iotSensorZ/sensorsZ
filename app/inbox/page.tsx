'use client'
import Chat from '@/components/Chat/page'
import EmailManagement from '@/components/EmailManagement/page'
import Inbox from '@/components/Inbox/page'
import InboxSwitcher from '@/components/InboxSwitcher/page'
import React, { useState } from 'react'

const page = () => {
const [currentInbox, setCurrentInbox] = useState<string | null>(null);
  return (
    <div>
           {/* <EmailManagement/> */}
     {/* <InboxSwitcher onSelectInbox={setCurrentInbox}/> */}
     {/* {currentInbox && <Chat currentInbox={currentInbox}/>} */}
        <Inbox/>
    </div>
  )
}

export default page