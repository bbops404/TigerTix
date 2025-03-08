import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Ticket,
  Users,
  Shield,
  BarChart,
  Clipboard,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    {
      name: "Event Management",
      icon: <Calendar size={20} />,
      path: "/event-management",
    },
    { name: "Reservations", icon: <Ticket size={20} />, path: "/reservations" },
    { name: "User", icon: <Users size={20} />, path: "/user" },
    { name: "Admin", icon: <Shield size={20} />, path: "/adminprofile" },
    {
      name: "Event Report & Analytics",
      icon: <BarChart size={20} />,
      path: "/event-report",
    },
    {
      name: "Audit Trails",
      icon: <Clipboard size={20} />,
      path: "/audit-trails",
    },
  ];

  return (
    <aside className="w-[100px] bg-gradient-to-t from-black to-[#494949] text-white p-5 min-h-screen flex flex-col items-center font-poppins text-[10px] top-0 left-0 h-full">
      <nav>
        <ul className="flex flex-col items-center w-full">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <li
                key={index}
                className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3
                  ${isActive ? "bg-[#997342]" : "hover:bg-[#997342]"}`}
                onClick={() => navigate(item.path)}
              >
                {/* Circular Icon */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors padding-
                    ${isActive ? "bg-[#FFAB40]" : "bg-[#7D7D7D]"} 
                    group-hover:bg-[#FFAB40]`}
                >
                  {item.icon}
                </div>
                {/* Menu Text */}
                <span className="text-white text-center w-full py-2">
                  {item.name}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
