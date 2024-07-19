import { Icon } from '@iconify/react';

import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: 'Jadwal',
    path: '/jadwal',
    icon: <Icon icon="lucide:folder" width="24" height="24" />,
  },
  {
    title: 'Alat',
    path: '/alat',
    icon: <Icon icon="lucide:mail" width="24" height="24" />,
  },
  {
    title: 'Laporan',
    path: '/laporan',
    icon: <Icon icon="lucide:settings" width="24" height="24" />,
  },
];
