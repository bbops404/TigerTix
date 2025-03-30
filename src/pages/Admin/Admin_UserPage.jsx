import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";

const Admin_UserPage = () => {
  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      {/* Header */}
      <Header_Admin />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar_Admin />

        {/* Content Wrapper */}
        <div className="flex-1 px-10 py-10">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar with Spacing */}
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-full">
                Reset
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-full flex items-center gap-2">
                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
            <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
              <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-10">
                <tr>
                  {[
                    "Username",
                    "Full Name",
                    "Role",
                    "Email",
                    "Account Status",
                    "Violation Count",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 border border-[#D6D3D3] text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    username: "olivesangels",
                    fullName: "Olive's Angels",
                    role: "Student",
                    email: "olivesangels@ust.edu.ph",
                    status: "Restricted/Active",
                    violations: 0,
                  },
                  {
                    username: "john_doe",
                    fullName: "John Doe",
                    role: "Faculty",
                    email: "johndoe@ust.edu.ph",
                    status: "Active",
                    violations: 1,
                  },
                  {
                    username: "tigersfan",
                    fullName: "Tigers Fan Club",
                    role: "Alumni",
                    email: "tigersfan@ust.edu.ph",
                    status: "Suspended",
                    violations: 3,
                  },
                  {
                    username: "nathan_sci",
                    fullName: "Nathan Science",
                    role: "Student",
                    email: "nathan@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                  {
                    username: "lucas_m",
                    fullName: "Lucas M.",
                    role: "Student",
                    email: "lucasm@ust.edu.ph",
                    status: "Active",
                    violations: 1,
                  },
                  {
                    username: "charlotte_d",
                    fullName: "Charlotte D.",
                    role: "Faculty",
                    email: "charlotte_d@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                  {
                    username: "kevin_ust",
                    fullName: "Kevin UST",
                    role: "Alumni",
                    email: "kevin.ust@ust.edu.ph",
                    status: "Suspended",
                    violations: 2,
                  },
                  {
                    username: "elena_stu",
                    fullName: "Elena Student",
                    role: "Student",
                    email: "elena@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                  {
                    username: "robert_a",
                    fullName: "Robert A.",
                    role: "Faculty",
                    email: "robert_a@ust.edu.ph",
                    status: "Active",
                    violations: 1,
                  },
                  {
                    username: "sophiag",
                    fullName: "Sophia G.",
                    role: "Student",
                    email: "sophiag@ust.edu.ph",
                    status: "Restricted",
                    violations: 2,
                  },
                  {
                    username: "tigersfan",
                    fullName: "Tigers Fan Club",
                    role: "Alumni",
                    email: "tigersfan@ust.edu.ph",
                    status: "Suspended",
                    violations: 3,
                  },
                  {
                    username: "nathan_sci",
                    fullName: "Nathan Science",
                    role: "Student",
                    email: "nathan@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                  {
                    username: "lucas_m",
                    fullName: "Lucas M.",
                    role: "Student",
                    email: "lucasm@ust.edu.ph",
                    status: "Active",
                    violations: 1,
                  },
                  {
                    username: "charlotte_d",
                    fullName: "Charlotte D.",
                    role: "Faculty",
                    email: "charlotte_d@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                  {
                    username: "kevin_ust",
                    fullName: "Kevin UST",
                    role: "Alumni",
                    email: "kevin.ust@ust.edu.ph",
                    status: "Suspended",
                    violations: 2,
                  },
                  {
                    username: "elena_stu",
                    fullName: "Elena Student",
                    role: "Student",
                    email: "elena@ust.edu.ph",
                    status: "Active",
                    violations: 0,
                  },
                ].map((user, index) => (
                  <tr
                    key={index}
                    className="border border-[#D6D3D3] text-center"
                  >
                    <td className="px-4 py-2 border border-[#D6D3D3] flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="flex-1 text-center">
                        {user.username}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {user.role}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {user.email}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {user.status}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {user.violations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Buttons (Same Width & Height) */}
          <div className="flex justify-center gap-4 mt-6">
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full">
              Edit User
            </button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full">
              Add User
            </button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full">
              Delete User/s
            </button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_UserPage;
