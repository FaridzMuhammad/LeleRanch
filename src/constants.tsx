import { Icon } from '@iconify/react';
import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: 'Jadwal',
    path: '/jadwal',
    icon: <Icon icon="lucide:clock" width="24" height="24" />,
  },
  {
    title: 'Sensor',
    path: '/sensor',
    icon: <Icon icon="lucide:settings" width="24" height="24" />,
  },
  {
    title: 'branch',
    path: '/branch',
    icon: <Icon icon="carbon:branch" width="24" height="24" />,
  },
  // {
  //   title: 'laporan',
  //   path: '/laporan',
  //   icon: <Icon icon="lucide:file-text" width="24" height="24" />,
  // },
  {
    title: 'Users',
    path: '/users',
    icon: <Icon icon="lucide:users" width="24" height="24" />,
  },

];
