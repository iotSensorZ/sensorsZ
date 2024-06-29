'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Layout from '../dashlayout/page';

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noLayout = ['/login', '/register', '/changepassword'].includes(pathname);

  useEffect(() => {
    // Remove unwanted attributes added by extensions
    const cleanUpAttributes = () => {
      if (typeof document !== 'undefined') {
        document.body.removeAttribute('cz-shortcut-listen');
      }
    };

    cleanUpAttributes(); // Run cleanup on mount

    const intervalId = setInterval(cleanUpAttributes, 1000); // Periodic cleanup

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return noLayout ? <>{children}</> : <Layout>{children}</Layout>;
};

export default ClientSideLayout;
