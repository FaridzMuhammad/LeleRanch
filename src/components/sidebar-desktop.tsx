import { Home } from "lucide-react";
import { SidebarButton } from "./sidebar-button";
import { SidebarItems } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { link } from "fs";

interface SidebarDesktopProps {

  sidebarItems: SidebarItems;

}

export function SidebarDesktop(props: SidebarDesktopProps) {
  return (
    <aside className="w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r rounded-r-sm bg-[#1F2937]">
      <div className="h-full px-3 py-4">
        <div className="mt-3 flex flex-col items-center">
          <Avatar className="w-36 h-36">
            <AvatarImage src="https://media.discordapp.net/attachments/855432118723936276/1230474517886013480/Logo_Fix.png?ex=663373b2&is=6620feb2&hm=4d9795c3d9e1a8643c1adc20c5c3dd105e5372c0a05042e8c5cbd579918c76ec&=&format=webp&quality=lossless&width=525&height=525" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="mt-2 mx-3 text-xl font-bold text-foreground"> Lele Ranch </h1>
        </div>
        <div className="mt-6">
          <div className="flex flex-col gap-4 w-full">
            {props.sidebarItems.links.map((link, index) => (
              <SidebarButton key={index} icon={link.icon} className="box-content hover:bg-[#22D3EE] opacity-75">
                {link.label}
              </SidebarButton>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}