// app/components/Layout.js
import React from "react";
import { FiEdit, FiDownload, FiBox } from "react-icons/fi";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-16 bg-white shadow-md">
        <div className="flex flex-col items-center py-4 space-y-4">
          <SidebarIcon icon={<FiEdit />} tooltip="Editor" />
          <SidebarIcon icon={<FiDownload />} tooltip="Download" />
          <SidebarIcon icon={<FiBox />} tooltip="Feature 1" />
          <SidebarIcon icon={<FiBox />} tooltip="Feature 2" />
          <SidebarIcon icon={<FiBox />} tooltip="Feature 3" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon, tooltip }) => {
  return (
    <div className="relative group">
      <div className="p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
        {icon}
      </div>
      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {tooltip}
      </span>
    </div>
  );
};

export default Layout;
