// pages/dashboard.tsx
"use client";

import Layout from '@/components/dashlayout/page';
import FileList from '../../components/filelist/page';
import Link from 'next/link';

const Dashboard = () => {
  return (
<>

      <h1 className="text-4xl font-bold mb-4 ">Dashboard</h1>
     
      <p className="text-lg mb-4">Welcome to your dashboard</p>
      <FileList />
</>
    
  );
};

export default Dashboard;
