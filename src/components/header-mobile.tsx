'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDENAV_ITEMS } from '@/constants';
import { motion, useCycle, SVGMotionProps } from 'framer-motion';
import { LogOut } from 'lucide-react';

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const HeaderMobile = () => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(containerRef);
  const [isOpen, toggleOpen] = useCycle(false, true);

  const handleLogout = () => {
    // Hapus token atau sesi pengguna dari localStorage/sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('branch_id');
    // Redirection setelah logout
    window.location.href = '/login'; // atau Anda bisa menggunakan Next.js router untuk redirect
  };

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      custom={height}
      className={`fixed inset-0 z-50 w-full md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      ref={containerRef}
    >
      <motion.div className="absolute inset-0 right-0 w-full bg-primary-color" variants={sidebar} />
      <motion.div className="absolute flex flex-col justify-between w-full h-full px-10 py-16 text-white">
        <motion.ul
          variants={variants}
          className="grid gap-3 overflow-y-auto list-none p-0 m-0"
        >
          {SIDENAV_ITEMS.map((item, idx) => {
            const isLastItem = idx === SIDENAV_ITEMS.length - 1;
            return (
              <div key={idx}>
                <MenuItem>
                  <Link
                    href={item.path}
                    onClick={() => toggleOpen()}
                    className={`flex w-full text-2xl ${item.path === pathname ? 'font-bold' : ''}`}
                  >
                    {item.title}
                  </Link>
                </MenuItem>
                {!isLastItem && <MenuItem className="my-3 h-px w-full bg-gray-300" />}
              </div>
            );
          })}
          {/* Menambahkan menu logout */}
          <MenuItem className="my-3 h-px w-full bg-gray-300" />
          <MenuItem>
            <button
              onClick={handleLogout}
              className="flex w-full text-2xl font-bold text-red-500"
            >
              Logout  
              <LogOut className="h-6 w-6 ml-2" />
            </button>

          </MenuItem>
        </motion.ul>
      </motion.div>
      <MenuToggle toggle={toggleOpen} />
    </motion.nav>
  );
};

export default HeaderMobile;

const MenuToggle = ({ toggle }: { toggle: () => void }) => (
  <button onClick={toggle} className="pointer-events-auto absolute right-4 top-[14px] z-30">
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: 'M 2 2.5 L 20 2.5' },
          open: { d: 'M 3 16.5 L 17 2.5' },
        }}
        stroke="white"
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
        stroke="white"
      />
      <Path
        variants={{
          closed: { d: 'M 2 16.346 L 20 16.346' },
          open: { d: 'M 3 2.5 L 17 16.346' },
        }}
        stroke="white"
      />
    </svg>
  </button>
);

const Path = (props: SVGMotionProps<SVGPathElement>) => (
  <motion.path fill="transparent" strokeWidth="2" strokeLinecap="round" {...props} />
);

const MenuItem = ({ className, children }: { className?: string; children?: ReactNode }) => {
  return (
    <motion.li variants={MenuItemVariants} className={className}>
      {children}
    </motion.li>
  );
};

const MenuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
      duration: 0.02,
    },
  },
};

const variants = {
  open: {
    transition: { staggerChildren: 0.02, delayChildren: 0.15 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};

const useDimensions = (ref: React.RefObject<HTMLDivElement>) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};
