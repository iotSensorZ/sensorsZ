// components/ClientSideLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Layout from '../dashlayout/page';

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noLayout = ['/login', '/register','/changepassword'].includes(pathname);

  return noLayout ? children : <Layout>{children}</Layout>;
};

export default ClientSideLayout;
