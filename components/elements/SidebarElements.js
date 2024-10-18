"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  StickyNote,
  Layers,
  Flag,
  Calendar,
  LifeBuoy,
  Settings,
} from "lucide-react";
import Sidebar, { SidebarItem } from "./Sidebar";

function SidebarElements() {
  const [activeItem, setActiveItem] = useState("Home");

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  return (
    <Sidebar>
      <SidebarItem
        icon={<Home size={20} />}
        text="Home"
        active={activeItem === "Home"}
        onClick={() => handleItemClick("Home")}
      />
      <SidebarItem
        icon={<LayoutDashboard size={20} />}
        text="Dashboard"
        active={activeItem === "Dashboard"}
        onClick={() => handleItemClick("Dashboard")}
        subItems={[
          {
            text: "Analytics",
            onClick: () => console.log("Analytics clicked"),
          },
          { text: "Reports", onClick: () => console.log("Reports clicked") },
        ]}
      />
      <SidebarItem
        icon={<StickyNote size={20} />}
        text="Projects"
        active={activeItem === "Projects"}
        onClick={() => handleItemClick("Projects")}
        subItems={[
          {
            text: "Active",
            onClick: () => console.log("Active projects clicked"),
          },
          {
            text: "Archived",
            onClick: () => console.log("Archived projects clicked"),
          },
        ]}
      />
      <SidebarItem
        icon={<Calendar size={20} />}
        text="Calendar"
        active={activeItem === "Calendar"}
        onClick={() => handleItemClick("Calendar")}
      />
      <SidebarItem
        icon={<Layers size={20} />}
        text="Tasks"
        active={activeItem === "Tasks"}
        onClick={() => handleItemClick("Tasks")}
        subItems={[
          { text: "My Tasks", onClick: () => console.log("My Tasks clicked") },
          {
            text: "Team Tasks",
            onClick: () => console.log("Team Tasks clicked"),
          },
        ]}
      />
      <SidebarItem
        icon={<Flag size={20} />}
        text="Reporting"
        active={activeItem === "Reporting"}
        onClick={() => handleItemClick("Reporting")}
      />
      <hr className="my-3" />
      <SidebarItem
        icon={<Settings size={20} />}
        text="Settings"
        active={activeItem === "Settings"}
        onClick={() => handleItemClick("Settings")}
      />
      <SidebarItem
        icon={<LifeBuoy size={20} />}
        text="Help"
        active={activeItem === "Help"}
        onClick={() => handleItemClick("Help")}
      />
    </Sidebar>
  );
}

export default SidebarElements;
