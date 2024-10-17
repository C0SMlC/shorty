import React from "react";
import DynamicCardGrid from "../../components/layout/CardGrid";
import SidebarElements from "../../components/elements/SidebarElements";

function Page() {
  return (
    <div className="flex h-screen">
      <div className="w-84 flex-shrink-0">
        <SidebarElements />
      </div>
      <div className="flex-grow overflow-auto">
        <DynamicCardGrid />
      </div>
    </div>
  );
}

export default Page;
