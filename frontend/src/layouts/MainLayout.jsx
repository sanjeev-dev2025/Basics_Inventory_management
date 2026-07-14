import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-secondary">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
