'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import homeIcon from '@iconify/icons-lucide/home';

const Breadcrumb = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Menghilangkan segment "/dashboard" jika berada di "/dashboard"
  if (segments[0] === 'dashboard') {
    segments.shift();
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex space-x-2 text-2xl text-white"> {/* Updated class to text-2xl */}
        <li>
          <Link href="/dashboard" className="hover:white flex items-center rounded-xl">
            <Icon icon={homeIcon} className="w-7 h-7" />
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2"> {'>'} </span>
              {isLast ? (
                <span className="text-white capitalize">{segment}</span>
              ) : (
                <Link href={href} className="hover:text-white capitalize rounded-xl">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;