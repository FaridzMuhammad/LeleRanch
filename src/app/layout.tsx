<<<<<<< HEAD
import '../styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Header from '@/components/header';
import HeaderMobile from '@/components/header-mobile';
import MarginWidthWrapper from '@/components/margin-width-wrapper';
import PageWrapper from '@/components/page-wrapper';
import SideNav from '@/components/side-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lele Ranch',
=======
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Home, AlarmClock, FishSymbol, Wrench } from "lucide-react";
import { SidebarDesktop } from "@/components/sidebar-desktop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
>>>>>>> origin/dev
};

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-primary-color ${inter.className}`}>
        <div className="flex">
          <SideNav />
          <main className="flex-1 bg-primary-color">
            <MarginWidthWrapper>
              <Header />
              <HeaderMobile />
              <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
          </main>
        </div>
      </body>
    </html>
  );
}
=======
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>

        <SidebarDesktop sidebarItems={{

          links: [
            {
              label: "Dashboard",
              href: "/",
              icon: Home,
            },
            {
              label: "Jadwal",
              href: "/jadwal",
              icon: AlarmClock,
            },
            {
              label: "Pakan",
              href: "/pakan",
              icon: FishSymbol,
            },
            {
              label: "Alat",
              href: "/alat",
              icon: Wrench,
            },
          ],
        }} />

        <main className='ml-[300px] mt-3'>{children}</main>
      </body>
    </html>
  );
}
>>>>>>> origin/dev
