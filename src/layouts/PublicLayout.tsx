/*
 * PlanBium public layout.
 * Wraps all public pages with the floating header and footer.
 * The fluid background variant is controlled by the page.
 */

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
