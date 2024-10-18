"use client";

import {
  ChevronFirst,
  ChevronLast,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { createContext, useContext, useState } from "react";
import logo from "../../public/logo.png";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const toggleFixed = () => {
    setIsFixed(!isFixed);
    if (!isFixed) {
      setExpanded(true);
    }
  };

  return (
    <aside
      className={`h-screen ${isFixed ? "" : "hover:w-64"}`}
      onMouseEnter={() => !isFixed && setExpanded(true)}
      onMouseLeave={() => !isFixed && setExpanded(false)}
    >
      <nav
        className={`h-full flex flex-col bg-white border-r shadow-sm ${
          expanded ? "w-64" : "w-16"
        } ${isFixed ? "w-64" : ""} transition-all duration-300`}
      >
        <div className="p-4 pb-2 flex justify-between items-center">
          <Image
            src={logo}
            alt="logo"
            className={`overflow-hidden transition-all ${
              expanded || isFixed ? "w-32" : "w-0"
            }`}
          />
          <button
            onClick={toggleFixed}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {isFixed ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded, isFixed }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded || isFixed ? "w-52 ml-3" : "w-0"
            } `}
          >
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, onClick, subItems }) {
  const { expanded, isFixed } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubItems = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <li
        onClick={onClick}
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group
          ${
            active
              ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
              : "hover:bg-indigo-50 text-gray-600"
          }
        `}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded || isFixed ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
              expanded || isFixed ? "" : "top-2"
            }`}
          />
        )}
        {subItems && (expanded || isFixed) && (
          <button
            onClick={toggleSubItems}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
        {!expanded && !isFixed && (
          <div
            className={`
              absolute left-full rounded-md px-2 py-1 ml-6
              bg-indigo-100 text-indigo-800 text-sm
              invisible opacity-20 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            `}
          >
            {text}
          </div>
        )}
      </li>
      {subItems && isOpen && (expanded || isFixed) && (
        <ul className="ml-4">
          {subItems.map((item, index) => (
            <li
              key={index}
              onClick={() => item.onClick && item.onClick()}
              className="py-2 px-3 text-sm text-gray-600 hover:bg-indigo-50 rounded-md cursor-pointer"
            >
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
