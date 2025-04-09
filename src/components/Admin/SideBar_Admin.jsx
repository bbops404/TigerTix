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

  return (
    <aside className="w-[100px] bg-gradient-to-t from-black to-[#494949] text-white p-5 min-h-screen flex flex-col items-center font-poppins text-[10px] top-0 left-0">
      <nav>
        <ul className="flex flex-col items-center w-full">
          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/admin-dashboard")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/admin-dashboard")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/admin-dashboard")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Home size={20} />
            </div>
            <span className="text-white text-center w-full py-2">
              Admin Dashboard
            </span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/events")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/events")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/events")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Calendar size={20} />
            </div>
            <span className="text-white text-center w-full py-2">
              Event Management
            </span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/reservations")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/reservations")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/reservations")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Ticket size={20} />
            </div>
            <span className="text-white text-center w-full py-2">
              Reservations
            </span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/users")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/users")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/users")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Users size={20} />
            </div>
            <span className="text-white text-center w-full py-2">User</span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/admin-profile")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/admin-profile")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/admin-profile")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Shield size={20} />
            </div>
            <span className="text-white text-center w-full py-2">Admin</span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/event-report")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/event-report")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/event-report")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <BarChart size={20} />
            </div>
            <span className="text-white text-center w-full py-2">
              Event Report & Analytics
            </span>
          </li>

          <li
            className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3 
              ${
                location.pathname.startsWith("/audit-trails")
                  ? "bg-[#997342]"
                  : "hover:bg-[#997342]"
              }`}
            onClick={() => navigate("/audit-trails")}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors
                ${
                  location.pathname.startsWith("/audit-trails")
                    ? "bg-[#FFAB40]"
                    : "bg-[#7D7D7D]"
                } 
                group-hover:bg-[#FFAB40]`}
            >
              <Clipboard size={20} />
            </div>
            <span className="text-white text-center w-full py-2">
              Audit Trails
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Home,
//   Calendar,
//   Ticket,
//   Users,
//   Shield,
//   BarChart,
//   Clipboard,
// } from "lucide-react";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isExpanded, setIsExpanded] = useState(true);

//   return (
//     <aside
//       className={`bg-gradient-to-t from-black to-[#494949] text-white p-5 min-h-screen flex flex-col items-center font-poppins text-[10px] top-0 left-0 transition-all duration-300 ease-in-out overflow-hidden ${
//         isExpanded ? "w-[100px]" : "w-[60px]"
//       }`}
//       onMouseEnter={() => setIsExpanded(true)}
//       onMouseLeave={() => setIsExpanded(false)}
//     >
//       <nav className="w-full">
//         <ul className="flex flex-col items-center w-full">
//           {[
//             { icon: Home, text: "Dashboard", path: "/dashboard" },
//             {
//               icon: Calendar,
//               text: "Event Management",
//               path: "/event-management",
//             },
//             { icon: Ticket, text: "Reservations", path: "/reservations" },
//             { icon: Users, text: "User", path: "/user" },
//             { icon: Shield, text: "Admin", path: "/adminprofile" },
//             {
//               icon: BarChart,
//               text: "Event Report & Analytics",
//               path: "/event-report",
//             },
//             { icon: Clipboard, text: "Audit Trails", path: "/audit-trails" },
//           ].map(({ icon: Icon, text, path }) => (
//             <li
//               key={path}
//               className={`group flex flex-col items-center w-[100px] cursor-pointer transition-colors text-center p-3
//                 ${
//                   location.pathname.startsWith(path)
//                     ? "bg-[#997342]"
//                     : "hover:bg-[#997342]"
//                 }`}
//               onClick={() => navigate(path)}
//             >
//               <div>
//                 <Icon size={20} />
//               </div>
//               {isExpanded && (
//                 <span className="text-white text-center w-full py-2">
//                   {text}
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;
