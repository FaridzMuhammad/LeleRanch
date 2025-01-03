'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { SIDENAV_ITEMS } from '@/constants';
import { SideNavItem } from '@/types';

const SideNav = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="md:w-60 h-screen flex-1 fixed hidden md:flex flex-col justify-between rounded-r-xl bg-secondary-color">
      <div className="flex flex-col space-y-6 w-full">
        <Link
          href="/dashboard" 
          className="flex flex-col items-center justify-center md:justify-start md:px-6 mt-6 w-full"
        >
          <Image src="/logo.png" alt="Lele Ranch Logo" className="h-24 w-24 rounded-full" width={96} height={96} />
          <span className="font-bold text-xl hidden md:flex text-white mt-2">Lele Ranch</span>
        </Link>

        <div className="flex flex-col space-y-2 md:px-6 mt-6">
          {SIDENAV_ITEMS.map((item, idx) => {
            return <MenuItem key={idx} item={item} />;
          })}
        </div>
      </div>

      {/* Modified profile and logout section */}
      <div className="flex flex-row items-center justify-between md:px-6 mb-6">
        <MenuItem 
          item={{ 
            path: '/profile', 
            title: 'Profile', 
            icon: <Image src="/logo.png" alt="Profile" className="h-10 w-10 rounded-full" width={40} height={40} /> 
          }} 
        />
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-white hover:text-red-500 hover:rounded-xl"
          title="Logout"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SideNav;

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();

  return (
    <Link
      href={item.path}
      className={`flex flex-row space-x-4 items-center p-2 rounded-lg ${
        item.path === pathname ? 'bg-tertiary-color rounded-xl' : ''
      } text-white hover:bg-tertiary-color hover:rounded-xl`}
    >
      {item.icon}
      <span className="font-semibold text-xl flex">{item.title}</span>
    </Link>
  );
};