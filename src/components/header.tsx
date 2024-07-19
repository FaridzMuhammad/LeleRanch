'use client';

import React from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/breadcrumb';

const Header = () => {
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all flex flex-row`,
        {
          'bg-primary-color backdrop-blur-lg': scrolled,
          'bg-primary-color': selectedLayout,
        },
      )}
    >
      <div className="px-4 py-2">
        <Breadcrumb />
      </div>  
    </div>
  );
};

export default Header;
