'use client'
import React from 'react';
import { useSearchParams } from 'next/navigation';
import InboxList from '@/components/inboxList/page';
import InboxWindow from '@/components/inboxWindow/page';
import MessageDetail from './[messageId]/page';

const Inbox: React.FC = () => {
  const searchParams = useSearchParams();
  const messageId = searchParams.get('messageId');

  return (
    <div className="flex h-screen overflow-hidden">
      <InboxList />
      {messageId ? <MessageDetail messageId={messageId} /> : <InboxWindow />}
    </div>
  );
};

export default Inbox;
